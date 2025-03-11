"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Scan, X, RefreshCw } from "lucide-react"
import { BrowserMultiFormatReader, type Result, BarcodeFormat } from "@zxing/library"

type BarcodeScannerProps = {
  onScanSuccess: (barcode: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScanSuccess, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)

  // Initialize the barcode reader
  useEffect(() => {
    const hints = new Map()
    // Set formats we want to scan - UPC, EAN, QR codes
    hints.set(2, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.EAN_8,
    ])

    codeReaderRef.current = new BrowserMultiFormatReader(hints)

    // Get available video devices
    codeReaderRef.current
      .listVideoInputDevices()
      .then((devices) => {
        const videoDevices = devices.filter((device) => device.kind === "videoinput")
        setVideoDevices(videoDevices)

        // Select the first device by default
        if (videoDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoDevices[0].deviceId)
        }
      })
      .catch((err) => {
        setError("Error accessing camera: " + err.message)
      })

    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset()
      }
    }
  }, [selectedDeviceId])

  // Start scanning when the component mounts
  const startScanning = useCallback(() => {
    if (!codeReaderRef.current || !selectedDeviceId) return

    setIsScanning(true)
    setError(null)

    codeReaderRef.current
      .decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current || undefined,
        (result: Result | null, error: Error | undefined) => {
          if (result) {
            const barcode = result.getText()
            console.log("Barcode detected:", barcode)
            onScanSuccess(barcode)
            stopScanning()
          }

          if (error && !(error instanceof TypeError)) {
            // TypeError is thrown when the scanner is stopped, so we ignore it
            console.error("Scanning error:", error)
          }
        },
      )
      .catch((err) => {
        setError("Error starting scanner: " + err.message)
        setIsScanning(false)
      })
  }, [selectedDeviceId, onScanSuccess])

  const stopScanning = useCallback(() => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset()
      setIsScanning(false)
    }
  }, [])

  const switchCamera = useCallback(() => {
    stopScanning()

    // Find the next camera in the list
    if (videoDevices.length > 1 && selectedDeviceId) {
      const currentIndex = videoDevices.findIndex((device) => device.deviceId === selectedDeviceId)
      const nextIndex = (currentIndex + 1) % videoDevices.length
      setSelectedDeviceId(videoDevices[nextIndex].deviceId)
    }
  }, [videoDevices, selectedDeviceId, stopScanning])

  useEffect(() => {
    if (selectedDeviceId && !isScanning) {
      startScanning()
    }
  }, [selectedDeviceId, isScanning, startScanning])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium">Scan Barcode</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative aspect-[4/3] bg-black">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
              <div>
                <p className="text-red-500 mb-4">{error}</p>
                <Button
                  onClick={() => {
                    setError(null)
                    startScanning()
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <>
              <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-lime-green rounded-lg opacity-70"></div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 flex justify-between">
          <Button
            variant="outline"
            onClick={isScanning ? stopScanning : startScanning}
            className="flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <X className="h-4 w-4" /> Stop
              </>
            ) : (
              <>
                <Scan className="h-4 w-4" /> Start
              </>
            )}
          </Button>

          {videoDevices.length > 1 && (
            <Button variant="outline" onClick={switchCamera} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Switch Camera
            </Button>
          )}
        </div>

        <div className="p-4 pt-0 text-sm text-gray-500 dark:text-gray-400">
          <p>Position the barcode within the frame to scan.</p>
          <p className="mt-1">Works with UPC, EAN, and QR codes on DVD/Blu-ray cases.</p>
        </div>
      </div>
    </div>
  )
}

