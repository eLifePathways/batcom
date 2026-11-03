import { mathjax } from 'mathjax-full/js/mathjax.js'
import { TeX } from 'mathjax-full/js/input/tex.js'
import { SVG } from 'mathjax-full/js/output/svg.js'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js'

// One-time MathJax setup. `fontCache: 'none'` inlines each glyph path directly
// so that many independent SVGs baked into the same page cannot collide on
// shared <defs> ids.
const adaptor = liteAdaptor()
RegisterHTMLHandler(adaptor)
const texInput = new TeX({ packages: AllPackages })
const svgOutput = new SVG({ fontCache: 'none' })
const mjDocument = mathjax.document('', {
  InputJax: texInput,
  OutputJax: svgOutput,
})

const NAMED_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&#x27;': "'",
}

// Minimal HTML-entity decoder for the entities that appear inside Wax math
// nodes (equivalent to flax's `he.decode`). `&amp;` is decoded last so a
// single-encoded string is not double-decoded.
const decodeEntities = (input: string): string => {
  let out = input
  for (const [entity, char] of Object.entries(NAMED_ENTITIES)) {
    out = out.split(entity).join(char)
  }
  out = out.replace(/&#(\d+);/g, (_m, dec) => String.fromCodePoint(Number(dec)))
  out = out.replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) =>
    String.fromCodePoint(parseInt(hex, 16)),
  )
  return out.split('&amp;').join('&')
}

// Convert a LaTeX string to a bare, self-contained <svg>. Returns null when
// MathJax reports a TeX error, so the caller can leave the original node in
// place (matching flax, which only replaces when there is no error).
const convertLatex = (latex: string, display: boolean): string | null => {
  const node = mjDocument.convert(latex, { display })
  const svg = adaptor.innerHTML(node)
  return svg.includes('data-mjx-error') ? null : svg
}

/**
 * The equivalent of flax's `makeSvgsFromLatex(true)`: convert the LaTeX carried
 * in Wax `<math-display>` / `<math-inline>` nodes into inline SVG so the maths
 * renders without any client-side MathJax. Returns the rewritten HTML.
 */
export const makeSvgsFromLatex = (content: string): string => {
  if (!content) {
    return content
  }

  let result = content

  result = result.replace(
    /<math-display\b[^>]*>([\s\S]*?)<\/math-display>/gi,
    (match, inner: string) => {
      try {
        return convertLatex(decodeEntities(inner), true) ?? match
      } catch (err) {
        console.error('Failed to convert display formula:', inner, err)
        return match
      }
    },
  )

  result = result.replace(
    /<math-inline\b[^>]*>([\s\S]*?)<\/math-inline>/gi,
    (match, inner: string) => {
      try {
        return convertLatex(decodeEntities(inner), false) ?? match
      } catch (err) {
        console.error('Failed to convert inline formula:', inner, err)
        return match
      }
    },
  )

  return result
}
