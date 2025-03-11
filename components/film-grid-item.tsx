"use client"

import Image from "next/image"
import type { Film } from "@/lib/types"

type FilmGridItemProps = {
  film: Film
  onClick: () => void
}

export default function FilmGridItem({ film, onClick }: FilmGridItemProps) {
  return (
    <div
      className="bg-lime-green-light dark:bg-lime-green-dark rounded-[10px] p-4 cursor-pointer lime-shadow hover:translate-y-[-4px] hover:shadow-lg transition-all duration-300 group"
      onClick={onClick}
    >
      <div className="relative aspect-square rounded-[10px] overflow-hidden mb-2">
        {film.imageUrl ? (
          <div className="w-full h-full overflow-hidden">
            <Image
              src={film.imageUrl || "/placeholder.svg"}
              alt={film.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDQwMCA2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiNmMGYwZjAiIC8+PC9zdmc+"
              loading="lazy"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              onError={(e) => {
                // If image fails to load, replace with placeholder
                ;(e.target as HTMLImageElement).src = "/placeholder.svg"
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <Image src="/placeholder.svg" alt="No image available" fill className="object-contain p-4" />
          </div>
        )}
      </div>
      <div className="flex justify-between">
        <h3 className="font-medium text-black dark:text-white group-hover:text-lime-green dark:group-hover:text-lime-green transition-colors duration-300">
          {film.title}
        </h3>
        <span className="text-black dark:text-white">ID {film.idNumber}</span>
      </div>
    </div>
  )
}

