// Ambient declarations for Next.js public environment variables.
// NEXT_PUBLIC_* vars are statically inlined by the Next.js bundler at build time.
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_SUPABASE_URL: string
    readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  }
}

// Make `process` available in browser-targeted files without requiring @types/node.
declare var process: {
  env: NodeJS.ProcessEnv
}
