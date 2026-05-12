// Ambient declarations for Next.js public environment variables.
// NEXT_PUBLIC_* vars are statically inlined by the Next.js bundler at build time.
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_SUPABASE_URL: string
    readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    readonly GOOGLE_MAPS_API_KEY: string | undefined
    /** Set to "true" to enable demo/dev accounts. Safe to enable on Vercel preview environments. */
    readonly NEXT_PUBLIC_ENABLE_DEMO_AUTH?: string
  }
}

// Make `process` available in browser-targeted files without requiring @types/node.
declare var process: {
  env: NodeJS.ProcessEnv
}
