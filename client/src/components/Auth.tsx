import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '@headlessui/react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Mail, Lock, ArrowRight, GraduationCap, Github, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  
  const navigate = useNavigate()
  const { session } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      navigate('/')
    }
  }, [session, navigate])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        // Successful login will trigger session change -> useEffect redirects
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="text-center space-y-3 relative mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 mb-4 rotate-3 transform transition-transform hover:rotate-6 hover:scale-105 duration-300 ring-4 ring-white">
            <GraduationCap className="text-white w-8 h-8" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">
            Study<span className="text-primary-600">Mate</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
            Your personal AI-powered study companion.
          </p>
          <div className="pt-2 pb-1">
             <div className="h-1 w-12 bg-gradient-to-r from-primary-400 to-primary-200 rounded-full mx-auto"></div>
          </div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl backdrop-blur-xl border-white/60">
          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none text-sm font-medium"
                  placeholder="name@example.com"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2 ${
                  message.includes('Check') 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'bg-rose-50 text-rose-600 border border-rose-100'
              }`}>
                {message.includes('Check') && <Sparkles size={14} />}
                {message}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-2.5 rounded-lg shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-sm"
            >
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <>
                  {isSignUp ? 'Get Started' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-center text-sm text-slate-500">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 font-bold text-primary-600 hover:text-primary-500 transition-colors focus:outline-none hover:underline"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>

        <div className="text-center text-slate-400 text-[10px] font-semibold flex items-center justify-center gap-1.5 uppercase tracking-wider">
            <Github size={12} className="opacity-70" /> Open Source Project
        </div>
      </div>
    </div>
  )
}
