import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react'
import { apiRequest } from '@/lib/queryClient'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface ImageUploadProps {
  className?: string
  currentImageUrl?: string
  onImageUploaded: (imageUrl: string) => void
  label?: string
  description?: string
}

export function ImageUpload({
  className,
  currentImageUrl,
  onImageUploaded,
  label = 'Image',
  description = 'Upload an image file (PNG, JPG, GIF up to 10)',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null,
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (PNG, JPG, GIF)',
        variant: 'destructive',
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 10MB',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)

    try {
      const reader = new FileReader()

      reader.onloadend = () => {
        const base64String = reader.result as string
        setPreviewUrl(base64String)
        onImageUploaded(base64String)

        toast({
          title: 'Image encoded',
          description: 'Your image was encoded and stored successfully',
        })
        setIsUploading(false)
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Encoding failed:', error)
      toast({
        title: 'Encoding failed',
        description:
          'There was a problem encoding your image. Please try again.',
        variant: 'destructive',
      })
      setIsUploading(false)
    }
  }

  const handleClearImage = () => {
    setPreviewUrl(null)
    onImageUploaded('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor="image-upload">{label}</Label>
      <div className="grid gap-4">
        <div className="flex flex-col items-center gap-4">
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            ref={fileInputRef}
            className="hidden"
          />

          {previewUrl ? (
            <div
              className="relative rounded-md overflow-hidden border border-border shadow-sm cursor-pointer group"
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <img
                src={previewUrl}
                alt="Preview"
                className="h-48 w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="h-10 w-10 text-white drop-shadow-lg" />
                </div>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
                onClick={e => {
                  e.stopPropagation() // Prevent triggering the parent's onClick
                  handleClearImage()
                }}
              >
                <X className="h-4 w-4" />
              </Button>

              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-white animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center h-48 w-full rounded-md border border-dashed border-border bg-muted/50 p-4 text-center cursor-pointer hover:bg-muted/70 transition-colors"
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              {isUploading ? (
                <Loader2 className="h-10 w-10 text-muted-foreground mb-2 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Click to upload
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
