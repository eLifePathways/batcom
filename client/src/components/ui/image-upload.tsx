import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  className?: string;
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  label?: string;
  description?: string;
}

export function ImageUpload({
  className,
  currentImageUrl,
  onImageUploaded,
  label = "Image",
  description = "Upload an image file (PNG, JPG, GIF up to 5MB)",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File validation
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, GIF)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Create a form data object to send the file
      const formData = new FormData();
      formData.append("image", file);

      // Upload the file
      const response = await apiRequest<{ fileUrl: string }>("/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type header when using FormData
          // The browser will set it automatically with the boundary parameter
        },
      });

      // Set the preview and notify parent component
      setPreviewUrl(response.fileUrl);
      onImageUploaded(response.fileUrl);
      
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully",
      });
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearImage = () => {
    setPreviewUrl(null);
    onImageUploaded("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="image-upload">{label}</Label>
      <div className="grid gap-4">
        <div className="flex flex-col items-center gap-4">
          {previewUrl ? (
            <div className="relative rounded-md overflow-hidden border border-border shadow-sm">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="h-48 w-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={handleClearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 w-full rounded-md border border-dashed border-border bg-muted/50 p-4 text-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              ref={fileInputRef}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {previewUrl ? "Replace" : "Upload"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}