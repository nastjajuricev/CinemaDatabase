"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback, memo, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Film } from "@/lib/types"
import { useFilms } from "@/lib/use-films"
import { Upload } from "lucide-react"
import { compressImage, formatFileSize } from "@/lib/image-utils"

type FilmModalProps = {
  film: Film
  onClose: () => void
}

// Use memo to prevent unnecessary re-renders
const FilmModal = memo(function FilmModal({ film, onClose }: FilmModalProps) {
  const { deleteFilm, updateFilm } = useFilms()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Omit<Film, "id" | "dateAdded"> & { imageFile?: File }>({
    title: film.title || "",
    director: film.director || "",
    actors: film.actors || "",
    genre: film.genre || "",
    idNumber: film.idNumber || "",
    year: film.year || "",
    tags: film.tags || "",
    imageUrl: film.imageUrl || "",
  })
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageStats, setImageStats] = useState<{ original: string; compressed: string } | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [confetti, setConfetti] = useState<any[]>([])

  // Track the current film for comparison
  const [currentFilm, setCurrentFilm] = useState<Film>(film)

  // Use a ref to track if we need to update editData
  const shouldUpdateEditData = useRef(true)

  // Add this after the state declarations
  const imagePreviewUrl = useMemo(() => {
    if (editData.imageFile) {
      return URL.createObjectURL(editData.imageFile)
    }
    return editData.imageUrl || "/placeholder.svg"
  }, [editData.imageFile, editData.imageUrl])

  // Update currentFilm when film changes
  useEffect(() => {
    if (film && film.id !== currentFilm?.id) {
      setCurrentFilm(film)
      shouldUpdateEditData.current = true
    }
  }, [film, currentFilm?.id])

  // Update editData separately to avoid render loops
  useEffect(() => {
    if (shouldUpdateEditData.current) {
      setEditData({
        title: currentFilm.title || "",
        director: currentFilm.director || "",
        actors: currentFilm.actors || "",
        genre: currentFilm.genre || "",
        idNumber: currentFilm.idNumber || "",
        year: currentFilm.year || "",
        tags: currentFilm.tags || "",
        imageUrl: currentFilm.imageUrl || "",
      })
      shouldUpdateEditData.current = false
    }
  }, [currentFilm])

  // Handle confetti effect
  useEffect(() => {
    if (!saveSuccess) return

    // Generate static confetti pieces
    const pieces = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 5 + Math.random() * 10,
      color: ["#FF7F50", "#32CD32", "#d4f7d4", "#1E3C1E"][Math.floor(Math.random() * 4)],
      rotation: Math.random() * 360,
    }))

    setConfetti(pieces)

    // Clear confetti after 2 seconds
    const timer = setTimeout(() => {
      setConfetti([])
      setSaveSuccess(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [saveSuccess])

  // Add useCallback for all event handlers that aren't already using it:
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleDelete = useCallback(() => {
    deleteFilm(film.id)
    onClose()
  }, [deleteFilm, film.id, onClose])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0])
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0])
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    try {
      const originalSize = formatFileSize(file.size)
      const compressedFile = await compressImage(file)
      const compressedSize = formatFileSize(compressedFile.size)

      setImageStats({
        original: originalSize,
        compressed: compressedSize,
      })

      // Update the editData with the new file
      setEditData((prev) => ({
        ...prev,
        imageFile: compressedFile,
        // Don't update imageUrl here as we'll use URL.createObjectURL in the render
      }))
    } catch (error) {
      console.error("Error compressing image:", error)
      alert("There was an error processing your image. Please try again.")
    }
  }

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleSave = useCallback(() => {
    // Create a copy of the edit data
    let finalEditData = { ...editData }

    // If we have an image file, we need to convert it to a data URL
    if (editData.imageFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        // Get the data URL
        const dataUrl = e.target?.result as string

        // Update the imageUrl with the data URL
        finalEditData = {
          ...finalEditData,
          imageUrl: dataUrl,
        }

        // Remove the imageFile property as it can't be serialized
        delete finalEditData.imageFile

        // Now update the film
        const updatedFilm = updateFilm(film.id, finalEditData)

        if (updatedFilm) {
          // Update our current film reference
          setCurrentFilm(updatedFilm)

          // Hide editing mode immediately to prevent further state changes
          setIsEditing(false)

          // Show success message after a short delay
          setTimeout(() => {
            setSaveSuccess(true)
          }, 100)
        }
      }

      // Start reading the file as a data URL
      reader.readAsDataURL(editData.imageFile)
    } else {
      // No image file, just update with the current data
      // Remove the imageFile property as it can't be serialized
      delete finalEditData.imageFile

      // Update the film in the database
      const updatedFilm = updateFilm(film.id, finalEditData)

      if (updatedFilm) {
        // Update our current film reference
        setCurrentFilm(updatedFilm)

        // Hide editing mode immediately to prevent further state changes
        setIsEditing(false)

        // Show success message after a short delay
        setTimeout(() => {
          setSaveSuccess(true)
        }, 100)
      }
    }
  }, [editData, film.id, updateFilm])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      setIsEditing(false)
      setSaveSuccess(false)
      onClose()
    }, 300)
  }, [onClose])

  const handleEditClick = useCallback(() => {
    // Only set isEditing to true, don't update editData here
    setIsEditing(true)
  }, [])

  // Render confetti piece
  const renderConfetti = useCallback((piece: any) => {
    const style: React.CSSProperties = {
      position: "absolute",
      left: `${piece.x}%`,
      top: `${piece.y}%`,
      width: `${piece.size}px`,
      height: `${piece.size * 0.4}px`, // rectangular confetti
      backgroundColor: piece.color,
      transform: `rotate(${piece.rotation}deg)`,
      opacity: 0.8,
      zIndex: 50,
    }

    return <div key={piece.id} style={style} />
  }, [])

  // Add this useEffect after the other useEffect hooks
  useEffect(() => {
    // Cleanup function for the object URL
    return () => {
      if (editData.imageFile) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [editData.imageFile, imagePreviewUrl])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Blurred backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[6px] transition-opacity duration-300 ease-in-out modal-backdrop"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div
        className={`relative w-full max-w-lg mx-auto h-auto max-h-[85vh] bg-lime-green-light dark:bg-lime-green-dark dark:bg-opacity-20 rounded-[15px] overflow-hidden card-shadow ${
          isClosing ? "modal-closing" : "modal-content"
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
          className="absolute top-5 right-5 z-10 w-10 h-10 flex items-center justify-center rounded-full border-[1px] border-black dark:border-white btn-shadow transition-transform duration-200 hover:scale-110"
        >
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
            className="lucide lucide-x"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        <div className="p-6 pt-16 pb-8 overflow-y-auto max-h-[85vh]">
          {isEditing ? (
            <form
              className="space-y-4 pb-4"
              onSubmit={(e) => {
                e.preventDefault()
                handleSave()
              }}
            >
              <div className="space-y-2">
                <div>
                  <Label htmlFor="title" className="text-black dark:text-white">
                    Film Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={editData.title}
                    onChange={handleChange}
                    required
                    className="mt-0.5 border-[1px] border-[#ff6b6b] bg-white dark:bg-lime-green-dark dark:bg-opacity-20 text-black dark:text-white dark:border-white"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <Label htmlFor="director" className="text-black dark:text-white">
                    Director
                  </Label>
                  <Input
                    id="director"
                    name="director"
                    value={editData.director}
                    onChange={handleChange}
                    className="mt-0.5 border-[1px] border-black dark:border-white bg-white dark:bg-lime-green-dark dark:bg-opacity-20 text-black dark:text-white"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <Label htmlFor="actors" className="text-black dark:text-white">
                    Actor
                  </Label>
                  <Input
                    id="actors"
                    name="actors"
                    value={editData.actors}
                    onChange={handleChange}
                    className="mt-0.5 border-[1px] border-black dark:border-white bg-white dark:bg-lime-green-dark dark:bg-opacity-20 text-black dark:text-white"
                    autoComplete="off"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="genre" className="text-black dark:text-white">
                      Genre
                    </Label>
                    <Input
                      id="genre"
                      name="genre"
                      value={editData.genre}
                      onChange={handleChange}
                      className="mt-0.5 border-[1px] border-black dark:border-white bg-white dark:bg-lime-green-dark dark:bg-opacity-20 text-black dark:text-white"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <Label htmlFor="idNumber" className="text-black dark:text-white">
                      ID number
                    </Label>
                    <Input
                      id="idNumber"
                      name="idNumber"
                      value={editData.idNumber}
                      onChange={handleChange}
                      required
                      className="mt-0.5 border-[1px] border-[#ff6b6b] bg-white dark:bg-lime-green-dark dark:bg-opacity-20 text-black dark:text-white dark:border-white"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="tags" className="text-black dark:text-white">
                      Tags
                    </Label>
                    <Input
                      id="tags"
                      name="tags"
                      value={editData.tags}
                      onChange={handleChange}
                      className="mt-0.5 border-[1px] border-black dark:border-white bg-white dark:bg-lime-green-dark dark:bg-opacity-20 text-black dark:text-white"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <Label htmlFor="year" className="text-black dark:text-white">
                      Year
                    </Label>
                    <Input
                      id="year"
                      name="year"
                      value={editData.year}
                      onChange={handleChange}
                      className="mt-0.5 border-[1px] border-black dark:border-white bg-white dark:bg-lime-green-dark dark:bg-opacity-20 text-black dark:text-white"
                      autoComplete="off"
                    />
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
                  <Upload size={32} className="mb-1 text-gray-400 dark:text-gray-300" />
                  <p className="text-gray-500 dark:text-gray-300 italic text-sm">Drag & drop or click to upload</p>
                  {imageStats && (
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                      <p>
                        Original: {imageStats.original} → Compressed: {imageStats.compressed}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="imageUrl" className="text-black dark:text-white">
                    Upload image via URL
                  </Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={editData.imageUrl}
                    onChange={handleChange}
                    className="mt-1 border-[1px] border-black dark:border-white bg-white dark:bg-lime-green-dark dark:bg-opacity-20 text-black dark:text-white"
                    placeholder="https://example.com/image.jpg"
                    autoComplete="off"
                  />
                </div>

                {/* Image Preview */}
                <div className="relative w-full h-40 rounded-[10px] overflow-hidden mt-4 bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={imagePreviewUrl || "/placeholder.svg"}
                    alt="Preview"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // If image fails to load, replace with placeholder
                      ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 mb-4">
                  <Button
                    type="submit"
                    className="bg-coral hover:bg-coral-hover dark:bg-black dark:text-white transition-colors duration-300"
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="border-[1px] border-[#ff6b6b] text-[#ff6b6b] dark:bg-red-500 dark:text-white dark:border-red-500"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          ) : showDeleteConfirm ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[6px]"
                onClick={() => setShowDeleteConfirm(false)}
              />
              <div className="relative bg-[#e0f4e0] dark:bg-[#1a2e1a] dark:bg-opacity-20 rounded-[30px] p-8 w-full max-w-sm">
                <h3 className="text-xl font-semibold text-black dark:text-white mb-4 text-center">Sure about that?</h3>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-black/10 hover:bg-black/20 text-black dark:bg-white/10 dark:hover:bg-white/20 dark:text-white"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleDelete} variant="destructive" className="flex-1">
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Image Container */}
              <div className="w-full mx-auto mb-6">
                <div className="relative w-full aspect-[16/9] overflow-hidden modal-item-1">
                  <Image
                    src={currentFilm.imageUrl || "/placeholder.svg"}
                    alt={currentFilm.title}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 600px"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDQwMCA2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiNmMGYwZjAiIC8+PC9zdmc+"
                    onError={(e) => {
                      // If image fails to load, replace with placeholder
                      ;(e.target as HTMLImageElement).src = "/placeholder.svg"
                    }}
                  />
                </div>
              </div>

              {/* Film Details */}
              <div className="space-y-6">
                {/* Title and ID */}
                <div className="flex justify-between items-center modal-item-2">
                  <h2 className="text-3xl font-bold text-black dark:text-white">{currentFilm.title}</h2>
                  <span className="text-xl text-black dark:text-white">ID {currentFilm.idNumber}</span>
                </div>

                {/* Main Info Row */}
                <div className="grid grid-cols-3 gap-4 modal-item-3">
                  <div>
                    <span className="text-sm text-black/60 dark:text-white/60">Director</span>
                    <p className="font-medium text-black dark:text-white">{currentFilm.director || "—"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-black/60 dark:text-white/60">Genre</span>
                    <p className="font-medium text-black dark:text-white">{currentFilm.genre || "—"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-black/60 dark:text-white/60">Year</span>
                    <p className="font-medium text-black dark:text-white">{currentFilm.year || "—"}</p>
                  </div>
                </div>

                {/* Actors */}
                <div className="modal-item-3">
                  <span className="text-sm text-black/60 dark:text-white/60">Actors</span>
                  <p className="font-medium text-black dark:text-white">{currentFilm.actors || "—"}</p>
                </div>

                {/* Tags if present */}
                {currentFilm.tags && (
                  <div className="modal-item-3">
                    <span className="text-sm text-black/60 dark:text-white/60">Tags</span>
                    <p className="font-medium text-black dark:text-white">{currentFilm.tags}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 modal-item-4">
                  <Button
                    onClick={handleEditClick}
                    className="w-full bg-black dark:bg-black text-white rounded-[10px] h-14"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="outline"
                    className="w-full border-[1px] border-black dark:border-red-500 dark:bg-red-500 text-black dark:text-white rounded-[10px] h-14"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Success message with confetti */}
      {saveSuccess && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 animate-in fade-in duration-300">
          {/* Semi-transparent backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[6px] transition-opacity duration-300 ease-in-out modal-backdrop"></div>

          {/* Success popup with confetti */}
          <div className="relative w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-[15px] overflow-hidden shadow-lg transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
            <div className="p-8 text-center">
              <h3 className="text-3xl font-bold text-black dark:text-white">Changes saved!</h3>

              {/* Render confetti pieces */}
              {confetti.map(renderConfetti)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

FilmModal.displayName = "FilmModal"

export default FilmModal

