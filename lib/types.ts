export type Film = {
  id: string
  title: string
  director: string
  actors: string
  genre: string
  idNumber: string
  year: string
  tags: string
  imageUrl: string
  dateAdded: string
  imageFile?: File
}

export type Stats = {
  totalFilms: number
  daysSinceLastAdded: number
}

export type SearchEntry = {
  id: string
  term: string
  resultCount: number
  timestamp: string
}

