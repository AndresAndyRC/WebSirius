/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL: string;
  readonly GOOGLE_ANALYTICS_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}