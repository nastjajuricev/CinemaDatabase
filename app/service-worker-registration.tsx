"use client"

import { useEffect } from "react"

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((registration) => {
            console.log("ServiceWorker registration successful with scope: ", registration.scope)
          })
          .catch((error) => {
            console.log("ServiceWorker registration failed: ", error)
          })
      })
    }
  }, [])

  return null
}

