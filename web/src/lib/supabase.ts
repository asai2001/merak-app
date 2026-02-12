import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Prediction = {
    id: string
    user_id: string
    image_url: string | null
    prediction: 'fertile' | 'infertile'
    confidence: number
    fertile_prob: number
    infertile_prob: number
    model_used: string
    created_at: string
}
