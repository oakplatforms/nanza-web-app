import React, { useState } from 'react'
import { signIn } from 'aws-amplify/auth'
import { useSession } from '../context/SessionContext'
import { Button, Input } from './Tailwind'
import SignUp from './SignUp'

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { setIsSignedIn } = useSession()
  const [isSigningUp, setIsSigningUp] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await signIn({ username: email, password })
      setIsSignedIn(true)
      setEmail('')
      setPassword('')
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unknown error occurred')
      }
    }
  }

  if (isSigningUp) {
    return <SignUp onSwitchToSignIn={() => setIsSigningUp(false)} />
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-300">
      <div className="w-full max-w-sm bg-white px-10 pt-8 pb-9 shadow-[rgba(50,50,93,0.25)_0px_50px_100px_-20px,rgba(0,0,0,0.3)_0px_30px_60px_-30px] rounded-2xl">
        <img src="/oak.svg" alt="Oak Platforms" className="h-[21.11px] mb-8" />
        <h2 className="text-2xl font-bold mb-1">Log in</h2>
        <p className="text-[13px] font-figtree text-slate-800 font-medium tracking-[0.05px] mb-6">Continue to TCGX</p>
        <form onSubmit={handleSignIn}>
          <Input
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email"
            labelPosition="above"
            required
            className="w-full mb-4"
          />
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Password"
            labelPosition="above"
            required
            className="w-full"
          />
          {error && <p className="text-red-700 text-sm mt-4">{error}</p>}
          <Button type="submit" className="w-full text-white rounded-lg !mt-6">
            Sign In
          </Button>
        </form>
        <p className="text-[13px] text-slate-800 font-figtree font-medium tracking-[0.05px] mt-6">
          Ready to join TCGX?{' '}
          <button onClick={() => setIsSigningUp(true)} className="ml-1 font-figtree font-bold text-sky-500 hover:text-sky-600 inline-flex items-center">
            Get Started
            <svg className="ml-1.5 mb-0.5" width="9.77" height="9" viewBox="0 0 38 35" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M37 14.99L25 0.990019C24.27 0.260019 23.52 -0.0199809 22.82 1.90935e-05C22.78 1.90935e-05 22.73 1.90935e-05 22.69 1.90935e-05C20.54 -0.0699809 18.06 2.84002 19.75 4.72002L20.28 5.31002L28.1 13.99H3C-1 13.99 -1 19.99 3 19.99H27.96L19.4 29.5L18.87 30.09C17.21 31.94 19.58 34.78 21.71 34.81C21.75 34.81 21.8 34.81 21.85 34.81C21.9 34.81 21.94 34.81 21.99 34.81C22.9 34.79 23.96 34.29 25.01 33L37.01 19C38.01 18 38.01 16 37.01 15L37 14.99Z" fill="currentColor"/>
            </svg>
          </button>
        </p>
      </div>
    </div>
  )
}

export default SignIn
