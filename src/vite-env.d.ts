/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ELEVENLABS_API_KEY: string;
  readonly VITE_GAME_VERSION: string;
  readonly VITE_DEBUG_AUDIO: string;
  readonly VITE_DEPLOYMENT_ID: string;
  readonly VITE_OBSERVABILITY_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
