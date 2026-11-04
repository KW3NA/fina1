/**
 * Utility functions for document verification
 */

export function isDocumentVerified(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("documentsVerified") === "true"
}

export function isVerificationSkipped(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("verificationSkipped") === "true"
}

export function setDocumentVerified(verified: boolean): void {
  if (typeof window === "undefined") return
  
  if (verified) {
    localStorage.setItem("documentsVerified", "true")
    localStorage.setItem("verificationDate", new Date().toISOString())
    // Remove skipped flag if they verified
    localStorage.removeItem("verificationSkipped")
  } else {
    localStorage.removeItem("documentsVerified")
    localStorage.removeItem("verificationDate")
  }
}

export function getVerificationDate(): Date | null {
  if (typeof window === "undefined") return null
  
  const dateString = localStorage.getItem("verificationDate")
  return dateString ? new Date(dateString) : null
}

export function resetVerification(): void {
  setDocumentVerified(false)
  if (typeof window !== "undefined") {
    localStorage.removeItem("verificationSkipped")
  }
}

