/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_USE_LOCAL_BACKEND: string
  readonly VITE_LOCAL_BACKEND_URL: string
  readonly VITE_REMOTE_BACKEND_URL: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_LOG_API_CALLS: string
  readonly VITE_FEATURE_PUBLIC_LISTS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}




