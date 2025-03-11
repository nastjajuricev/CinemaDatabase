export default function FilmGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-gray-200 dark:bg-gray-800 rounded-[10px] p-4 animate-pulse">
          <div className="relative aspect-square rounded-[10px] bg-gray-300 dark:bg-gray-700 mb-2"></div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

