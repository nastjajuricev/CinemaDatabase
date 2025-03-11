// API configuration for Dropbox only
// Note: NEXT_PUBLIC_ prefix allows this to be used in client components

// Client-side safe configurations
export const getClientConfig = () => {
  return {
    dropbox: {
      appKey: process.env.NEXT_PUBLIC_DROPBOX_APP_KEY,
    },
  }
}

// Utility to check if Dropbox is configured
export function isDropboxConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_DROPBOX_APP_KEY
}

