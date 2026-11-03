import fs from 'fs'
import path from 'path'

// Manuscript images are stored alongside the other uploads so they are served
// by the same static handler (client/public/uploads -> /uploads). Each
// manuscript gets its own sub-folder keyed by its Kotahi id.
const MANUSCRIPT_UPLOAD_DIR = path.join(
  process.cwd(),
  'client',
  'public',
  'uploads',
  'manuscripts',
)

const stringIsAValidUrl = (s: string): boolean => {
  try {
    new URL(s)
    return true
  } catch {
    return false
  }
}

// Keep only characters that are safe in a filename/URL segment. The original
// name (from the image's alt attribute) usually carries the extension, e.g.
// "IMG_036BC36FD137-1.jpeg", which we want to preserve.
const sanitizeFileName = (name: string): string =>
  name.replace(/[^a-zA-Z0-9._-]/g, '_')

const downloadFile = async (
  url: string,
  localPath: string,
): Promise<boolean> => {
  try {
    const res = await fetch(url)

    if (!res.ok) {
      console.error(
        `Failed to download manuscript image (${res.status}): ${url}`,
      )
      return false
    }

    const buffer = Buffer.from(await res.arrayBuffer())
    await fs.promises.writeFile(localPath, buffer)
    return true
  } catch (err) {
    console.error('Error downloading manuscript image:', url, err)
    return false
  }
}

/**
 * The equivalent of flax's `imagesHandler`: given a piece of published
 * manuscript HTML, download every remote `<img>` to local storage and rewrite
 * its `src` to point at the locally served copy. Returns the rewritten HTML.
 *
 * Remote sources (e.g. signed DigitalOcean Spaces URLs) expire, so persisting
 * the HTML with those URLs is not durable — this makes the images permanent.
 */
export const imagesHandler = async (
  content: string,
  manuscriptId: string,
): Promise<string> => {
  if (!content) {
    return content
  }

  const folderName =
    manuscriptId || (Math.random() + 1).toString(36).substring(5)
  const dirPath = path.join(MANUSCRIPT_UPLOAD_DIR, folderName)

  const imgTags = content.match(/<img\b[^>]*>/gi)

  if (!imgTags?.length) {
    return content
  }

  await fs.promises.mkdir(dirPath, { recursive: true })

  let result = content

  for (const tag of imgTags) {
    const srcMatch = tag.match(/\ssrc="([^"]*)"/i)

    if (!srcMatch) {
      continue
    }

    // The stored HTML encodes `&` as `&amp;`; decode it for the actual request.
    const remoteSrc = srcMatch[1].replace(/&amp;/g, '&')

    if (!stringIsAValidUrl(remoteSrc)) {
      continue
    }

    const altMatch = tag.match(/\salt="([^"]*)"/i)
    const dataIdMatch = tag.match(/\sdata-id="([^"]*)"/i)
    const baseName = altMatch?.[1] || dataIdMatch?.[1] || 'image'

    const fileName = sanitizeFileName(`${folderName}-${baseName}`)
    const localFsPath = path.join(dirPath, fileName)
    const localUrl = `/uploads/manuscripts/${folderName}/${fileName}`

    const downloaded = await downloadFile(remoteSrc, localFsPath)

    if (!downloaded) {
      continue
    }

    const rewrittenTag = tag.replace(/\ssrc="[^"]*"/i, ` src="${localUrl}"`)
    result = result.replace(tag, rewrittenTag)
  }

  return result
}
