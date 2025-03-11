"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TabsList, TabsTrigger, Tabs, TabsContent } from "@/components/ui/tabs"
import NavigationBar from "@/components/navigation-bar"
import { useFilms } from "@/lib/use-films"
import type { Film } from "@/lib/types"
import dynamic from "next/dynamic"
import { compressImage, formatFileSize } from "@/lib/image-utils"

// Add this import at the top of the file
import { useRef, useState } from "react"

// Remove the SuccessConfetti component as we'll implement a new one

// Replace the direct import with lazy loading
const LoadingAnimation = dynamic(() => import("@/components/loading-animation"), {
  loading: () => (
    <div className="w-12 h-12 border-4 border-t-[#FF7F50] border-opacity-50 rounded-full animate-spin"></div>
  ),
  ssr: false,
})

// Add this import at the top with the other imports
import { Scan, Upload } from "lucide-react"
import BarcodeScanner from "@/components/barcode-scanner"
import { lookupFilmByBarcode } from "@/lib/barcode-service"
import { toast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Image from "next/image"

export default function AddFilmScreen() {
  const router = useRouter()
  const { addFilm, addFilms } = useFilms()
  const [formData, setFormData] = useState<Omit<Film, "id" | "dateAdded"> & { imageFile?: File }>({
    title: "",
    director: "",
    actors: "",
    genre: "",
    idNumber: "",
    year: "",
    tags: "",
    imageUrl: "",
  })
  const [dragActive, setDragActive] = useState(false)
  const [bulkText, setBulkText] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageStats, setImageStats] = useState<{ original: string; compressed: string } | null>(null)
  // Add state for validation
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  // Add state for tracking bulk operation progress
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 })
  // Add state for confetti
  const [confetti, setConfetti] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      color: string
      rotation: number
      speed: number
    }>
  >([])

  // Add this state near the other state declarations
  const [showScanner, setShowScanner] = useState(false)
  const [isLookingUpBarcode, setIsLookingUpBarcode] = useState(false)
  const [barcodeError, setBarcodeError] = useState<string | null>(null)
  const [barcode, setBarcode] = useState<string | null>(null)

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleFile = async (file: File) => {
    try {
      const compressedFile = await compressImage(file)
      setFormData({ ...formData, imageFile: compressedFile })
      const originalSize = formatFileSize(file.size)
      const compressedSize = formatFileSize(compressedFile.size)
      setImageStats({ original: originalSize, compressed: compressedSize })
    } catch (error) {
      console.error("Error compressing image:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.title) {
      errors.title = "Title is required"
    }
    if (!formData.idNumber) {
      errors.idNumber = "ID Number is required"
    }
    if (formData.year && isNaN(Number(formData.year))) {
      errors.year = "Year must be a number"
    }
    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      errors.imageUrl = "Invalid URL format"
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const newFilm: Omit<Film, "id" | "dateAdded"> = {
        title: formData.title,
        director: formData.director,
        actors: formData.actors,
        genre: formData.genre,
        idNumber: formData.idNumber,
        year: formData.year,
        tags: formData.tags,
        imageUrl: formData.imageUrl,
      }

      if (formData.imageFile) {
        // Convert image file to base64
        const fileReader = new FileReader()
        fileReader.readAsDataURL(formData.imageFile)
        fileReader.onload = async () => {
          const base64Image = fileReader.result as string
          newFilm.imageUrl = base64Image // Assign base64 image to imageUrl
          await addFilm(newFilm)
          toast({
            title: "Success!",
            description: "Film added successfully.",
            variant: "default",
          })
          router.push("/dashboard")
        }
        fileReader.onerror = (error) => {
          console.error("Error converting image to base64:", error)
          setIsSubmitting(false)
        }
      } else {
        await addFilm(newFilm)
        toast({
          title: "Success!",
          description: "Film added successfully.",
          variant: "default",
        })
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error adding film:", error)
      toast({
        title: "Error!",
        description: "Failed to add film.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const films = bulkText.split("\n").map((line) => {
      const [title, director, actors, genre, idNumber, year, tags] = line.split(",").map((item) => item.trim())
      return {
        title,
        director,
        actors,
        genre,
        idNumber,
        year,
        tags,
        imageUrl: "", // You might want to handle image URLs in bulk upload differently
      }
    })

    setBulkProgress({ current: 0, total: films.length })

    try {
      await addFilms(
        films,
        (index) => {
          setBulkProgress((prev) => ({ ...prev, current: index + 1 }))
        },
        () => {
          setIsSubmitting(false)
          toast({
            title: "Success!",
            description: "Films added successfully.",
            variant: "default",
          })
          router.push("/dashboard")
        },
      )
    } catch (error) {
      console.error("Error adding films:", error)
      toast({
        title: "Error!",
        description: "Failed to add films.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Title,Director,Actors,Genre,ID Number,Year,Tags\n"
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "film_template.csv")
    document.body.appendChild(link) // Required for FF

    link.click()

    document.body.removeChild(link)
  }

  const renderConfetti = (confettiPiece: any) => {
    return (
      <div
        key={confettiPiece.id}
        style={{
          position: "absolute",
          left: `${confettiPiece.x}%`,
          top: `${confettiPiece.y}%`,
          width: `${confettiPiece.size}px`,
          height: `${confettiPiece.size}px`,
          backgroundColor: confettiPiece.color,
          borderRadius: "50%",
          transform: `rotate(${confettiPiece.rotation}deg)`,
        }}
      ></div>
    )
  }

  const handleBarcodeScan = async (barcode: string) => {
    setShowScanner(false)
    setIsLookingUpBarcode(true)
    setBarcodeError(null)

    try {
      const filmData = await lookupFilmByBarcode(barcode)

      if (filmData) {
        // Pre-fill the form with the film data
        setFormData({
          title: filmData.title || "",
          director: filmData.director || "",
          actors: filmData.actors || "",
          genre: filmData.genre || "",
          idNumber: filmData.idNumber || "",
          year: filmData.year || "",
          tags: filmData.tags || "",
          imageUrl: filmData.imageUrl || "",
        })

        // Show success message
        toast({
          title: "Film found!",
          description: `Found "${filmData.title}" from barcode ${barcode}`,
          variant: "default",
        })
      } else {
        setBarcodeError(`No film found for barcode ${barcode}`)
      }
    } catch (error) {
      console.error("Error scanning barcode:", error)
      setBarcodeError("Error looking up film information")
    } finally {
      setIsLookingUpBarcode(false)
    }
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <button onClick={() => router.back()} className="mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-left"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold">Add</h1>
        </div>

        {/* Horizontal tab buttons */}
        <div className="flex justify-center mb-6">
          <Tabs defaultValue="single" className="w-full max-w-md mx-auto">
            <div className="flex items-center w-full">
              <TabsList className="grid grid-cols-2 h-10 flex-1 min-w-[280px]">
                <TabsTrigger value="single" className="text-sm px-3">
                  Add Single Film
                </TabsTrigger>
                <TabsTrigger value="bulk" className="text-sm px-3">
                  Bulk Add
                </TabsTrigger>
              </TabsList>
              <Button
                onClick={() => setShowScanner(true)}
                variant="outline"
                className="ml-2 flex items-center gap-2 border-[1px] border-black dark:border-white h-10 whitespace-nowrap"
              >
                <Scan className="h-4 w-4" /> Scan Barcode
              </Button>
            </div>

            <TabsContent value="single">
              <form onSubmit={handleSubmit} className="border border-[#ff6b6b] rounded-lg p-4 max-w-2xl mx-auto">
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="title">Film Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="mt-0.5 border-[1px] border-[#ff6b6b] dark:border-[#ff6b6b] dark:text-white"
                    />
                    {validationErrors.title && <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>}
                  </div>

                  <div>
                    <Label htmlFor="director">Director</Label>
                    <Input
                      id="director"
                      name="director"
                      value={formData.director}
                      onChange={handleChange}
                      className="mt-0.5 border-[1px] border-black dark:border-white dark:text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="actors">Actor</Label>
                    <Input
                      id="actors"
                      name="actors"
                      value={formData.actors}
                      onChange={handleChange}
                      className="mt-0.5 border-[1px] border-black dark:border-white dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="genre">Genre</Label>
                      <Input
                        id="genre"
                        name="genre"
                        value={formData.genre}
                        onChange={handleChange}
                        className="mt-0.5 border-[1px] border-black dark:border-white dark:text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="idNumber">ID number</Label>
                      <Input
                        id="idNumber"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleChange}
                        required
                        className="mt-0.5 border-[1px] border-[#ff6b6b] dark:border-[#ff6b6b] dark:text-white"
                      />
                      {validationErrors.idNumber && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.idNumber}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        className="mt-0.5 border-[1px] border-black dark:border-white dark:text-white"
                      />
                    </div>

                    {/* Year field */}
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="mt-0.5 border-[1px] border-black dark:border-white dark:text-white"
                      />
                      {validationErrors.year && <p className="text-red-500 text-xs mt-1">{validationErrors.year}</p>}
                    </div>
                  </div>

                  <div
                    className={`mt-2 border-[1px] border-dashed rounded-lg p-3 text-center flex flex-col items-center justify-center cursor-pointer ${
                      dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30" : "border-black dark:border-white"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileInput}
                      className="hidden"
                      accept="image/*"
                    />
                    <Upload size={32} className="mb-1 text-gray-400" />
                    <p className="text-gray-500 italic text-sm">Drag & drop or click to upload</p>
                    {imageStats && (
                      <div className="mt-1 text-xs text-gray-600">
                        <p>
                          Original: {imageStats.original} → Compressed: {imageStats.compressed}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Image URL field */}
                  <div>
                    <Label htmlFor="imageUrl">Upload image via URL</Label>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      className="mt-1 border-[1px] border-black dark:border-white dark:text-white"
                      placeholder="https://example.com/image.jpg"
                    />
                    {validationErrors.imageUrl && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.imageUrl}</p>
                    )}
                  </div>

                  {formData.imageUrl && !formData.imageFile && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Image URL will be used if no file is uploaded
                    </p>
                  )}

                  {/* Image preview if available */}
                  {(formData.imageFile || formData.imageUrl) && (
                    <div className="mt-4 relative w-full aspect-video rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                      <Image
                        src={formData.imageFile ? URL.createObjectURL(formData.imageFile) : formData.imageUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          // If image fails to load, replace with placeholder
                          ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                        }}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <Button type="submit" className="bg-coral hover:bg-coral-hover transition-colors duration-300">
                      Add
                    </Button>
                    <Button
                      type="button"
                      onClick={() => router.push("/dashboard")}
                      variant="outline"
                      className="border-[1px] border-[#ff6b6b] text-[#ff6b6b]"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
                {isSubmitting && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-[8px]">
                    <LoadingAnimation />
                  </div>
                )}
              </form>
            </TabsContent>

            <TabsContent value="bulk">
              <div className="border border-[#ff6b6b] rounded-lg p-6 max-w-2xl mx-auto">
                <div className="mb-4">
                  <p className="mb-2">Upload a CSV file or paste a list of films below.</p>
                  <p className="mb-4">Format: Title, Director, Actors, Genre, ID Number, Year, Tags</p>
                  <Button
                    onClick={downloadTemplate}
                    variant="outline"
                    size="sm"
                    className="mb-4 border-[1px] border-black"
                  >
                    Download Template
                  </Button>
                </div>

                <form onSubmit={handleBulkSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bulkText">Paste film data (one film per line)</Label>
                      <textarea
                        id="bulkText"
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        className="w-full h-40 mt-1 p-2 border-[1px] border-black rounded-md"
                        placeholder="The Godfather, Francis Ford Coppola, Marlon Brando Al Pacino, Crime Drama, 001, 1972, classic mafia"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <Button type="submit" className="bg-coral hover:bg-coral-hover transition-colors duration-300">
                        Add Films
                      </Button>
                      <Button
                        type="button"
                        onClick={() => router.push("/dashboard")}
                        variant="outline"
                        className="border-[1px] border-[#ff6b6b] text-[#ff6b6b]"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {isSubmitting && bulkProgress.total > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-[8px]">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Processing films...</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className="bg-[#FF7F50] h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {bulkProgress.current} of {bulkProgress.total} films processed
            </p>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 animate-in fade-in duration-300">
          {/* Semi-transparent backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[6px] transition-opacity duration-300 ease-in-out modal-backdrop"></div>

          {/* Success popup with confetti */}
          <div className="relative w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-[15px] overflow-hidden shadow-lg transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
            <div className="p-8 text-center">
              <h3 className="text-3xl font-bold text-black dark:text-white">Party on, Wayne!</h3>

              {/* Render confetti pieces */}
              {confetti.map(renderConfetti)}
            </div>
          </div>
        </div>
      )}
      <NavigationBar active="add" />
      {showScanner && <BarcodeScanner onScanSuccess={handleBarcodeScan} onClose={() => setShowScanner(false)} />}

      {isLookingUpBarcode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center">
            <div className="w-12 h-12 border-t-2 border-b-2 border-coral rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Looking up film...</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Searching for film information by barcode</p>
          </div>
        </div>
      )}

      {barcodeError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 text-center max-w-md">
            <div className="text-red-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Barcode Not Found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{barcodeError}</p>
            <div className="flex justify-center space-x-2">
              <Button variant="outline" onClick={() => setBarcodeError(null)}>
                Try Again
              </Button>
              <Button
                onClick={() => {
                  setBarcodeError(null)
                  setShowScanner(true)
                }}
              >
                Scan Another
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

