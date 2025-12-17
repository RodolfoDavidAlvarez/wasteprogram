"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Camera, FileText, Upload, X, Check } from "lucide-react"
import Image from "next/image"

interface SubmitBOLButtonProps {
  intakeId: string
  ticketNumber: string
}

export function SubmitBOLButton({ intakeId, ticketNumber }: SubmitBOLButtonProps) {
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Add to uploaded files
    setUploadedFiles(prev => [...prev, ...files])

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviews])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    URL.revokeObjectURL(previewUrls[index])
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("intakeId", intakeId)
      uploadedFiles.forEach((file, index) => {
        formData.append(`file${index}`, file)
      })

      const response = await fetch("/api/intakes/submit-bol", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        // Success! Clear files and close dialog
        setUploadedFiles([])
        previewUrls.forEach(url => URL.revokeObjectURL(url))
        setPreviewUrls([])
        setOpen(false)
        // Could add a success toast here
        window.location.reload() // Reload to show updated status
      } else {
        alert("Failed to upload BOL. Please try again.")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Error uploading BOL. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
      >
        <Camera className="h-5 w-5 mr-2" />
        Submit BOL / Documentation
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Submit BOL - {ticketNumber}
            </DialogTitle>
            <DialogDescription>
              Upload photos of the Bill of Lading, weight ticket, or delivery documentation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Upload Button */}
            <Button
              variant="outline"
              className="w-full h-24 border-2 border-dashed border-emerald-300 hover:border-emerald-500"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <div className="flex flex-col items-center gap-2">
                <Camera className="h-8 w-8 text-emerald-600" />
                <span className="text-sm font-medium">
                  {uploadedFiles.length > 0 ? "Add More Photos" : "Take Photo or Choose File"}
                </span>
              </div>
            </Button>

            {/* Preview Grid */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-emerald-200">
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Button */}
            {uploadedFiles.length > 0 && (
              <Button
                onClick={handleSubmit}
                disabled={uploading}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                {uploading ? (
                  <>
                    <Upload className="h-5 w-5 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Submit {uploadedFiles.length} {uploadedFiles.length === 1 ? "Photo" : "Photos"}
                  </>
                )}
              </Button>
            )}

            {/* Instructions */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="text-sm text-emerald-800">
                <strong>Tips:</strong> Take clear photos of the entire document. Include all weight information,
                signatures, and timestamps. You can upload multiple photos.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
