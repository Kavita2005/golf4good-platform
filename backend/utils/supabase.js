import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mipjvleltmvrnvmenzdi.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pcGp2bGVsdG12cm52bWVuemRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU3MzQxNCwiZXhwIjoyMDkwMTQ5NDE0fQ.5GB7W4iOLRvUZgfyBJCWssiPqHaUnqBhE8MQhaFavuk'

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
})

export default supabase