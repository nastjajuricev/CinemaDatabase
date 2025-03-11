"use client"

import { useEffect } from "react"
import { useTheme } from "@/lib/theme-context"

export default function FaviconHandler() {
  const { theme } = useTheme()

  useEffect(() => {
    // Get the favicon SVG element
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (favicon) {
      // Update the favicon color based on theme
      const svg = document.querySelector("#favicon") as SVGElement
      if (svg) {
        svg.style.color = theme === "dark" ? "#ffffff" : "#000000"
      }
    }
  }, [theme])

  return null
}

