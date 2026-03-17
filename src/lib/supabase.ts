// creates a supabase client that we can use anywhere in the app
// this reads the url and key from our .env.local file

import { createClient } from "@supabase/supabase-js";

// these values come from your supabase project dashboard
// they are safe to expose on the client because row level security protects your data
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// this is the main supabase client we will import everywhere
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
