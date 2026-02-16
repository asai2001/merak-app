'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import EggDetector from '@/components/EggDetector'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAccess()
  }, [])

  async function checkAccess() {
    // Check guest mode
    if (typeof window !== 'undefined') {
      const isGuest = localStorage.getItem('merak_guest') === 'true'
      if (isGuest) {
        setReady(true)
        return
      }
    }

    // Check auth
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setReady(true)
        return
      }
    }

    // Not logged in and not guest → go to login
    router.push('/login')
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    )
  }

  return <EggDetector />
}
