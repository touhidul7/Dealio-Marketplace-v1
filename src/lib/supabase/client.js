import { createBrowserClient } from '@supabase/ssr'

let client = null

export function createClient() {
  if (client) return client

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        // Provide a custom no-op lock to prevent Web Locks API from freezing
        // when returning to a backgrounded tab.
        lock: {
          acquire: async (name, acquireCallback) => {
            return await acquireCallback();
          },
          release: async (name) => {}
        }
      }
    }
  )

  return client
}
