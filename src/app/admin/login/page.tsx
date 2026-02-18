'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Welcome back, Admin!')
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-4 py-20 w-full">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-christ-light">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-christ-light rounded-full mb-4">
            <span className="text-christ-blue font-display font-black text-2xl">C</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-christ-dark tracking-tight">Admin Portal</h1>
          <p className="text-christ-blue/60 mt-1 font-medium">Christ University Newsletter</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-christ-dark uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 bg-christ-silver border border-christ-light rounded-xl focus:ring-2 focus:ring-christ-blue/20 focus:border-christ-blue outline-none transition-all text-christ-dark font-medium"
              placeholder="admin@christuniversity.in"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-christ-dark uppercase tracking-widest mb-2 ml-1">Secure Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 bg-christ-silver border border-christ-light rounded-xl focus:ring-2 focus:ring-christ-blue/20 focus:border-christ-blue outline-none transition-all text-christ-dark font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-christ-blue text-white py-4 px-6 rounded-xl hover:bg-christ-dark transition-all font-bold shadow-lg shadow-christ-blue/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
          >
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}