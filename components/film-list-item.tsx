"use client"

import type React from "react"

type FilmListItemProps = {
  film: {
    title: string
    idNumber: string
  }
  onClick: (e: React.MouseEvent) => void
}

export default function FilmListItem({ film, onClick }: FilmListItemProps) {
  return (
    <div
      className="flex items-center justify-between p-4 bg-gray-200 dark:bg-gray-800 rounded-[20px] hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors card-shadow hover:translate-y-[-2px] transition-all group"
      onClick={onClick}
    >
      <h3 className="font-medium text-black dark:text-white">{film.title}</h3>
      <div className="flex items-center">
        <span className="text-black dark:text-white">Nr #{film.idNumber}</span>
      </div>
    </div>
  )
}

