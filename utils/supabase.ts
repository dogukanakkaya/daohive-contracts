import { createClient } from '@supabase/supabase-js'
import { SUPABASE_SERVICE_ROLE, SUPABASE_URL } from '@/config'

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)