import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
  'https://xidzqnzxvqgnctrpejuz.supabase.co'

const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpZHpxbnp4dnFnbmN0cnBlanV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NzE3MjAsImV4cCI6MjEwNTI0NzcyMH0.shehBqw1l0-sxkqB7E_JzSbe2dzDf0ST5ZD_n14vTMQ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
