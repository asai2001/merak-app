import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Lazy-init: avoid crash during SSG build when env vars are missing
let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
    if (!_supabase) {
        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Supabase environment variables are not configured')
        }
        _supabase = createClient(supabaseUrl, supabaseAnonKey)
    }
    return _supabase
}

// For backward compat — only call at runtime in 'use client' components
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : (null as unknown as SupabaseClient)

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
