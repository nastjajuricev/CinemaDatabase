"use client"

import Image from "next/image"
import type { Film } from "@/lib/types"

type FilmCardProps = {
  film: Film
}

export default function FilmCard({ film }: FilmCardProps) {
  return (
    <div className="bg-[#d4f7d4] rounded-lg p-4">
      <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
        {film.imageUrl ? (
          <Image src={film.imageUrl || "/placeholder.svg"} alt={film.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">No image</div>
        )}
      </div>
      <div className="flex justify-between">
        <h3 className="font-medium">{film.title}</h3>
        <span>ID {film.idNumber}</span>
      </div>
    </div>
  )
}

