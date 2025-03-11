"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ExportDatabaseProps {
  data: any
  filename?: string
}

export default function ExportDatabase({ data, filename = "film-database-export.json" }: ExportDatabaseProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    try {
      setIsExporting(true)

      // Convert the data to a JSON string
      const jsonString = JSON.stringify(data, null, 2)

      // Create a blob from the JSON string
      const blob = new Blob([jsonString], { type: "application/json" })

      // Create a URL for the blob
      const url = URL.createObjectURL(blob)

      // Create a temporary anchor element
      const a = document.createElement("a")
      a.href = url
      a.download = filename

      // Append the anchor to the body
      document.body.appendChild(a)

      // Trigger a click on the anchor
      a.click()

      // Remove the anchor from the body
      document.body.removeChild(a)

      // Revoke the URL to free up memory
      URL.revokeObjectURL(url)

      setIsExporting(false)
    } catch (error) {
      console.error("Error exporting database:", error)
      setIsExporting(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={isExporting} variant="outline" className="flex items-center gap-2">
      <Download size={16} />
      {isExporting ? "Exporting..." : "Export Database"}
    </Button>
  )
}

