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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Sign In</h2>
        <form onSubmit={handleSignIn} className="space-y-4">
          <Input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full"
          />
          {error && <p className="text-red-700 text-sm">{error}</p>}
          <Button type="submit" className="w-full text-white rounded-lg">
            Sign In
          </Button>
        </form>
        <p className="text-center text-sm mt-4">
          Dont have an account?{' '}
          <button onClick={() => setIsSigningUp(true)} className="text-blue-600 hover:underline">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  )
}

export default SignIn
