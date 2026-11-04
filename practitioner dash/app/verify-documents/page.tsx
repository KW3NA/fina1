"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { setDocumentVerified } from "@/lib/verification"
import { supabase } from "@/lib/supabase"

interface UploadedFile {
  id: string
  file: File
  preview: string
  isUploading?: boolean
}

export default function VerifyDocumentsPage() {
  const router = useRouter()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setError("")

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("")
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = async (files: File[]) => {
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    const newFiles: UploadedFile[] = []

    files.forEach((file) => {
      if (!validTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Please upload PDF, DOC, DOCX, or image files.`)
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is 10MB.`)
        return
      }

      const id = Math.random().toString(36).substring(7)
      newFiles.push({
        id,
        file,
        preview: URL.createObjectURL(file),
        isUploading: true,
      })
    })

    // Add files with uploading state
    setUploadedFiles((prev) => [...prev, ...newFiles])

    // Simulate upload process for each file
    for (const newFile of newFiles) {
      await new Promise((resolve) => setTimeout(resolve, 1500)) // 1.5 second delay
      
      // Update the file to mark as uploaded
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === newFile.id ? { ...f, isUploading: false } : f
        )
      )
    }
  }

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter((f) => f.id !== id)
    })
    setError("")
  }

  const handleSubmit = async () => {
    if (uploadedFiles.length < 2) {
      setError("Please upload both required documents: Valid ID and Proof of Practice.")
      return
    }

    // Check if any files are still uploading
    const isAnyUploading = uploadedFiles.some(f => f.isUploading)
    if (isAnyUploading) {
      setError("Please wait for all files to finish processing.")
      return
    }

    setIsSubmitting(true)

    try {
      // Insert a verification record into Supabase
      // We store the file names (actual file storage would use Supabase Storage)
      const { error } = await supabase.from('practitioner_verifications').insert({
        practitioner_email: 'pending@eliteracy.org.za', // replaced with auth.user().email in production
        id_document_name: uploadedFiles[0]?.file?.name ?? 'id-document.pdf',
        reference_document_name: uploadedFiles[1]?.file?.name ?? 'reference-document.pdf',
        status: 'pending',
      })
      if (error) throw error

      setDocumentVerified(true)
      router.push("/dashboard")
    } catch (err: any) {
      setError(`Submission failed: ${err.message}. Please try again.`)
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    // Set a timestamp for temporary skip - valid for 5 seconds (for navigation to complete)
    // This allows viewing ONE page but will prompt again on any navigation or refresh
    const skipTimestamp = Date.now().toString()
    sessionStorage.setItem("tempSkipTimestamp", skipTimestamp)
    localStorage.setItem("verificationSkipped", "true")
    
    console.log("Skip button clicked, navigating to dashboard")
    router.push("/dashboard")
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes("image")) return "🖼️"
    if (type.includes("pdf")) return "📄"
    return "📎"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-3xl font-bold">Document Verification</CardTitle>
          <CardDescription className="text-base">
            Please upload the following 2 documents to verify your practitioner credentials
          </CardDescription>
          <div className="mt-4 text-left bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <p className="font-semibold text-sm mb-2 text-orange-900 dark:text-orange-100">Required Documents:</p>
            <ul className="space-y-1 text-sm text-orange-800 dark:text-orange-200">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 dark:text-orange-400 mt-0.5">1.</span>
                <span><strong>Valid ID</strong> (Driver's License, Passport, National ID, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 dark:text-orange-400 mt-0.5">2.</span>
                <span><strong>Proof of Reference for Area of Practice</strong> (Certificate, License, Accreditation, etc.)</span>
              </li>
            </ul>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-orange-500 bg-orange-50 dark:bg-orange-950"
                : "border-gray-300 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-600"
            }`}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileInput}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                Drop your documents here or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-1">
                Upload: Valid ID + Proof of Practice
              </p>
              <p className="text-xs text-gray-400">
                Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB per file)
              </p>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* File Status */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              {uploadedFiles.length >= 2 ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
              <span className="font-medium">
                {uploadedFiles.length} / 2 required documents uploaded
              </span>
            </div>
            {uploadedFiles.length >= 2 && (
              <span className="text-sm text-green-600 font-medium">Ready to proceed</span>
            )}
          </div>
          
          {/* Document Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={`p-3 rounded-lg border-2 transition-all ${
              uploadedFiles.length >= 1 && !uploadedFiles[0]?.isUploading
                ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                : uploadedFiles.length >= 1 && uploadedFiles[0]?.isUploading
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
            }`}>
              <div className="flex items-center gap-2">
                {uploadedFiles.length >= 1 && uploadedFiles[0]?.isUploading ? (
                  <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                ) : uploadedFiles.length >= 1 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-400" />
                )}
                <div>
                  <p className="font-semibold text-sm">Valid ID</p>
                  <p className="text-xs text-muted-foreground">
                    {uploadedFiles.length >= 1 && uploadedFiles[0]?.isUploading
                      ? "Processing..."
                      : "License, Passport, National ID"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`p-3 rounded-lg border-2 transition-all ${
              uploadedFiles.length >= 2 && !uploadedFiles[1]?.isUploading
                ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                : uploadedFiles.length >= 2 && uploadedFiles[1]?.isUploading
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
            }`}>
              <div className="flex items-center gap-2">
                {uploadedFiles.length >= 2 && uploadedFiles[1]?.isUploading ? (
                  <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                ) : uploadedFiles.length >= 2 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-400" />
                )}
                <div>
                  <p className="font-semibold text-sm">Proof of Practice</p>
                  <p className="text-xs text-muted-foreground">
                    {uploadedFiles.length >= 2 && uploadedFiles[1]?.isUploading
                      ? "Processing..."
                      : "Certificate, License, Accreditation"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Uploaded Documents</h3>
              {uploadedFiles.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {uploadedFile.isUploading ? (
                      <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="text-2xl">{getFileIcon(uploadedFile.file.type)}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{uploadedFile.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {uploadedFile.isUploading ? (
                          <span className="text-orange-600 dark:text-orange-400 animate-pulse">
                            Processing...
                          </span>
                        ) : (
                          <>
                            {formatFileSize(uploadedFile.file.size)}
                            <span className="ml-2 text-green-600 dark:text-green-400">✓ Ready</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(uploadedFile.id)}
                    disabled={uploadedFile.isUploading}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Submit and Skip Buttons */}
          <div className="pt-4 space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={uploadedFiles.length < 2 || isSubmitting || uploadedFiles.some(f => f.isUploading)}
              className="w-full h-12 text-lg font-semibold bg-orange-500 hover:bg-orange-600 focus:ring-orange-500/20"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Verifying Documents...
                </>
              ) : (
                `Submit documents (${uploadedFiles.length}/2)`
              )}
            </Button>
            {uploadedFiles.length < 2 && (
              <p className="text-center text-sm text-gray-500 mt-2">
                {uploadedFiles.length === 0 
                  ? "Upload both required documents to continue" 
                  : "Upload 1 more document to continue"}
              </p>
            )}
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="w-full text-sm font-medium border-orange-200 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20"
            >
              Continue to Dashboard
            </Button>

          </div>

          {/* Info Box */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Why do we need this?</strong> Document verification ensures you are a qualified 
              E-Literacy practitioner and helps us comply with regulatory requirements. Your documents are
              encrypted and stored securely. Complete verification to avoid seeing this prompt on every visit.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

