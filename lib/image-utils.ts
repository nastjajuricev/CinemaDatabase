/**
 * Utility functions for image processing
 */

/**
 * Generates a placeholder image URL with specified dimensions
 * @param width Width of the placeholder image
 * @param height Height of the placeholder image
 * @returns URL string for the placeholder
 */
export function getPlaceholderUrl(width = 400, height = 600): string {
  return `/placeholder.svg?width=${width}&height=${height}`
}

/**
 * Checks if an image URL is valid
 * @param url The image URL to check
 * @returns Promise resolving to boolean indicating if URL is valid
 */
export async function isImageUrlValid(url: string): Promise<boolean> {
  if (!url || url.startsWith("data:")) return true // Data URLs are considered valid

  try {
    const response = await fetch(url, { method: "HEAD" })
    return response.ok
  } catch (error) {
    console.error("Error checking image URL:", error)
    return false
  }
}

/**
 * Compresses an image file by resizing and reducing quality
 * @param file The original image file
 * @param maxWidth Maximum width of the compressed image
 * @param maxHeight Maximum height of the compressed image
 * @param quality JPEG quality (0-1)
 * @returns Promise resolving to a compressed File object
 */
export async function compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.8): Promise<File> {
  // Skip compression for SVG files
  if (file.type === "image/svg+xml") {
    console.log("SVG file detected, skipping compression")
    return file
  }

  return new Promise((resolve, reject) => {
    // Create a FileReader to read the file
    const reader = new FileReader()

    // Set up the FileReader onload event
    reader.onload = (readerEvent) => {
      // Create an image object
      const img = new Image()
      img.crossOrigin = "anonymous"

      // Set up the image onload event
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        // Create a canvas element
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        // Draw the image on the canvas
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Determine output format based on input
        const outputFormat = file.type === "image/png" ? "image/png" : "image/jpeg"
        const outputQuality = outputFormat === "image/png" ? 1 : quality

        // Get the data URL from the canvas
        const dataUrl = canvas.toDataURL(outputFormat, outputQuality)

        // Convert data URL to Blob
        const byteString = atob(dataUrl.split(",")[1])
        const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0]
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)

        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i)
        }

        const blob = new Blob([ab], { type: mimeString })

        // Create a new File from the Blob
        const compressedFile = new File([blob], file.name, {
          type: outputFormat,
          lastModified: Date.now(),
        })

        // Log compression results
        const compressionRatio = ((compressedFile.size / file.size) * 100).toFixed(2)
        console.log(
          `Image compressed: ${(file.size / (1024 * 1024)).toFixed(2)}MB → ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB (${compressionRatio}%)`,
        )

        resolve(compressedFile)
      }

      // Handle image loading errors
      img.onerror = () => {
        reject(new Error("Failed to load image for compression"))
      }

      // Set the image source to the FileReader result
      img.src = readerEvent.target?.result as string
    }

    // Handle errors
    reader.onerror = (error) => {
      reject(error)
    }

    // Read the file as a data URL
    reader.readAsDataURL(file)
  })
}

// Add a more aggressive image compression option for faster uploads
export async function compressImageAggressively(file: File): Promise<File> {
  // Use a lower quality setting for even smaller file sizes
  return compressImage(file, 600, 600, 0.6)
}

// Add a function to determine if compression is needed
export function shouldCompressImage(file: File): boolean {
  // Only compress images larger than 500KB
  return file.size > 500 * 1024
}

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

