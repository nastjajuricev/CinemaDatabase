"use client"

import { Dropbox } from "dropbox"
import type { Film } from "./types"

// Constants
const DROPBOX_APP_KEY = process.env.NEXT_PUBLIC_DROPBOX_APP_KEY || "your_dropbox_app_key_here"

// Add a function to check if the Dropbox key is properly configured
export const isDropboxKeyConfigured = () => {
  // Check if the key exists and is not the placeholder
  return !!DROPBOX_APP_KEY && DROPBOX_APP_KEY.length > 0 && DROPBOX_APP_KEY !== "your_dropbox_app_key_here"
}

const FILM_DB_FILE_PATH = "/film-database/films.json"
const LAST_SEARCHED_FILE_PATH = "/film-database/last-searched.json"
const LAST_ADDED_FILE_PATH = "/film-database/last-added.json"

// Types
type DropboxAuthState = {
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
}

// Initialize Dropbox client
const getDropboxClient = (accessToken?: string) => {
  return new Dropbox({
    clientId: DROPBOX_APP_KEY,
    accessToken: accessToken,
  })
}

// Get authentication URL
export const getAuthUrl = () => {
  if (!isDropboxKeyConfigured()) {
    throw new Error(
      "Dropbox API key is not configured. Please add the NEXT_PUBLIC_DROPBOX_APP_KEY environment variable.",
    )
  }

  const dbx = getDropboxClient()
  const redirectUri = typeof window !== "undefined" ? `${window.location.origin}/auth/dropbox/callback` : ""

  return dbx.auth.getAuthenticationUrl(redirectUri, null, "code", "offline", null, null, true)
}

// Save auth state to localStorage
const saveAuthState = (state: DropboxAuthState) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("dropboxAuth", JSON.stringify(state))
  }
}

// Load auth state from localStorage
export const loadAuthState = (): DropboxAuthState => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("dropboxAuth")
    if (saved) {
      return JSON.parse(saved)
    }
  }
  return {
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
  }
}

// Handle OAuth callback
export const handleOAuthCallback = async (code: string) => {
  if (!isDropboxKeyConfigured()) {
    console.error("Dropbox API key is not configured")
    return false
  }

  const dbx = getDropboxClient()
  const redirectUri = typeof window !== "undefined" ? `${window.location.origin}/auth/dropbox/callback` : ""

  try {
    const response = await dbx.auth.getAccessTokenFromCode(redirectUri, code)
    const { access_token, refresh_token, expires_in } = response.result

    const authState: DropboxAuthState = {
      isAuthenticated: true,
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + expires_in * 1000,
    }

    saveAuthState(authState)
    return true
  } catch (error) {
    console.error("Error getting access token:", error)
    return false
  }
}

// Refresh token if needed
const refreshTokenIfNeeded = async (): Promise<string | null> => {
  if (!isDropboxKeyConfigured()) {
    return null
  }

  const authState = loadAuthState()

  if (!authState.isAuthenticated || !authState.refreshToken) {
    return null
  }

  // Check if token is expired or about to expire (within 5 minutes)
  if (authState.expiresAt && authState.expiresAt > Date.now() + 5 * 60 * 1000) {
    return authState.accessToken
  }

  // Token needs refresh
  try {
    const dbx = getDropboxClient()
    const response = await dbx.auth.refreshAccessToken(authState.refreshToken)
    const { access_token, refresh_token, expires_in } = response.result

    const newAuthState: DropboxAuthState = {
      isAuthenticated: true,
      accessToken: access_token,
      refreshToken: refresh_token || authState.refreshToken,
      expiresAt: Date.now() + expires_in * 1000,
    }

    saveAuthState(newAuthState)
    return access_token
  } catch (error) {
    console.error("Error refreshing token:", error)
    return null
  }
}

// Get authenticated Dropbox client
export const getAuthenticatedClient = async () => {
  if (!isDropboxKeyConfigured()) {
    throw new Error("Dropbox API key is not configured")
  }

  const accessToken = await refreshTokenIfNeeded()
  if (!accessToken) {
    throw new Error("Not authenticated with Dropbox")
  }
  return getDropboxClient(accessToken)
}

// Check if file exists
const fileExists = async (dbx: Dropbox, path: string): Promise<boolean> => {
  try {
    await dbx.filesGetMetadata({ path })
    return true
  } catch (error) {
    return false
  }
}

// Create directory if it doesn't exist
const ensureDirectoryExists = async (dbx: Dropbox, path: string) => {
  try {
    await dbx.filesGetMetadata({ path })
  } catch (error) {
    // Directory doesn't exist, create it
    try {
      await dbx.filesCreateFolderV2({ path })
    } catch (createError) {
      console.error("Error creating directory:", createError)
    }
  }
}

// Save films to Dropbox
export const saveFilmsToDropbox = async (films: Film[]): Promise<boolean> => {
  if (!isDropboxKeyConfigured()) {
    console.warn("Dropbox API key is not configured, skipping save to Dropbox")
    return false
  }

  try {
    const dbx = await getAuthenticatedClient()

    // Ensure directory exists
    await ensureDirectoryExists(dbx, "/film-database")

    // Upload films data
    await dbx.filesUpload({
      path: FILM_DB_FILE_PATH,
      contents: JSON.stringify(films),
      mode: { ".tag": "overwrite" },
    })

    return true
  } catch (error) {
    console.error("Error saving films to Dropbox:", error)
    return false
  }
}

// Load films from Dropbox
export const loadFilmsFromDropbox = async (): Promise<Film[] | null> => {
  if (!isDropboxKeyConfigured()) {
    console.warn("Dropbox API key is not configured, skipping load from Dropbox")
    return null
  }

  try {
    const dbx = await getAuthenticatedClient()

    // Check if file exists
    const exists = await fileExists(dbx, FILM_DB_FILE_PATH)
    if (!exists) {
      return null
    }

    // Download file
    const response = await dbx.filesDownload({ path: FILM_DB_FILE_PATH })

    // Parse file content
    const fileBlob = (response.result as any).fileBlob
    const text = await fileBlob.text()
    return JSON.parse(text) as Film[]
  } catch (error) {
    console.error("Error loading films from Dropbox:", error)
    return null
  }
}

// Save last searched films to Dropbox
export const saveLastSearchedToDropbox = async (films: Film[]): Promise<boolean> => {
  if (!isDropboxKeyConfigured()) {
    console.warn("Dropbox API key is not configured, skipping save to Dropbox")
    return false
  }

  try {
    const dbx = await getAuthenticatedClient()

    // Ensure directory exists
    await ensureDirectoryExists(dbx, "/film-database")

    // Upload data
    await dbx.filesUpload({
      path: LAST_SEARCHED_FILE_PATH,
      contents: JSON.stringify(films),
      mode: { ".tag": "overwrite" },
    })

    return true
  } catch (error) {
    console.error("Error saving last searched to Dropbox:", error)
    return false
  }
}

// Load last searched films from Dropbox
export const loadLastSearchedFromDropbox = async (): Promise<Film[] | null> => {
  if (!isDropboxKeyConfigured()) {
    console.warn("Dropbox API key is not configured, skipping load from Dropbox")
    return null
  }

  try {
    const dbx = await getAuthenticatedClient()

    // Check if file exists
    const exists = await fileExists(dbx, LAST_SEARCHED_FILE_PATH)
    if (!exists) {
      return null
    }

    // Download file
    const response = await dbx.filesDownload({ path: LAST_SEARCHED_FILE_PATH })

    // Parse file content
    const fileBlob = (response.result as any).fileBlob
    const text = await fileBlob.text()
    return JSON.parse(text) as Film[]
  } catch (error) {
    console.error("Error loading last searched from Dropbox:", error)
    return null
  }
}

// Save last added films to Dropbox
export const saveLastAddedToDropbox = async (films: Film[]): Promise<boolean> => {
  if (!isDropboxKeyConfigured()) {
    console.warn("Dropbox API key is not configured, skipping save to Dropbox")
    return false
  }

  try {
    const dbx = await getAuthenticatedClient()

    // Ensure directory exists
    await ensureDirectoryExists(dbx, "/film-database")

    // Upload data
    await dbx.filesUpload({
      path: LAST_ADDED_FILE_PATH,
      contents: JSON.stringify(films),
      mode: { ".tag": "overwrite" },
    })

    return true
  } catch (error) {
    console.error("Error saving last added to Dropbox:", error)
    return false
  }
}

// Load last added films from Dropbox
export const loadLastAddedFromDropbox = async (): Promise<Film[] | null> => {
  if (!isDropboxKeyConfigured()) {
    console.warn("Dropbox API key is not configured, skipping load from Dropbox")
    return null
  }

  try {
    const dbx = await getAuthenticatedClient()

    // Check if file exists
    const exists = await fileExists(dbx, LAST_ADDED_FILE_PATH)
    if (!exists) {
      return null
    }

    // Download file
    const response = await dbx.filesDownload({ path: LAST_ADDED_FILE_PATH })

    // Parse file content
    const fileBlob = (response.result as any).fileBlob
    const text = await fileBlob.text()
    return JSON.parse(text) as Film[]
  } catch (error) {
    console.error("Error loading last added from Dropbox:", error)
    return null
  }
}

// Upload image to Dropbox and get a shared link
export const uploadImageToDropbox = async (file: File): Promise<string | null> => {
  if (!isDropboxKeyConfigured()) {
    console.warn("Dropbox API key is not configured, skipping upload to Dropbox")
    return null
  }

  try {
    const dbx = await getAuthenticatedClient()

    // Ensure directory exists
    await ensureDirectoryExists(dbx, "/film-database/images")

    // Generate unique filename
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`
    const path = `/film-database/images/${filename}`

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Upload file
    await dbx.filesUpload({
      path,
      contents: arrayBuffer,
    })

    // Create shared link
    const shareResponse = await dbx.sharingCreateSharedLinkWithSettings({
      path,
      settings: {
        requested_visibility: { ".tag": "public" },
      },
    })

    // Convert to direct link (remove dl=0 and add dl=1)
    let url = shareResponse.result.url
    url = url.replace("www.dropbox.com", "dl.dropboxusercontent.com")
    url = url.replace("?dl=0", "")

    return url
  } catch (error) {
    console.error("Error uploading image to Dropbox:", error)
    return null
  }
}

// Check if user is authenticated with Dropbox
export const isDropboxAuthenticated = (): boolean => {
  if (!isDropboxKeyConfigured()) {
    return false
  }

  const authState = loadAuthState()
  return authState.isAuthenticated && !!authState.accessToken
}

// Logout from Dropbox
export const logoutFromDropbox = () => {
  saveAuthState({
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
  })
}

