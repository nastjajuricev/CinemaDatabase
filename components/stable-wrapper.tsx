"use client"

import type React from "react"
import { memo } from "react"

// This component prevents excessive re-renders by memoizing its children
// It's especially useful for wrapping Radix UI components that might cause infinite loops
const StableWrapper = memo(({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
})

StableWrapper.displayName = "StableWrapper"

export default StableWrapper

