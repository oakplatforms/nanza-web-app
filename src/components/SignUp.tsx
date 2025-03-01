import React, { useState } from 'react'
import { signUp, confirmSignUp } from 'aws-amplify/auth'
import { Button, Input } from './Tailwind'

const SignUp = ({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmCode, setConfirmCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await signUp({ username: email, password, options: { userAttributes: { email } } })
      setIsConfirming(true)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unknown error occurred')
      }
    }
  }

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await confirmSignUp({ username: email, confirmationCode: confirmCode })
      alert('Account confirmed! You can now sign in.')
      setIsConfirming(false)
      setEmail('')
      setPassword('')
      setConfirmCode('')
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unknown error occurred')
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">{isConfirming ? 'Confirm Sign Up' : 'Sign Up'}</h2>

        {!isConfirming ? (
          <form onSubmit={handleSignUp} className="space-y-4">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            {error && <p className="text-red-700 text-sm">{error}</p>}
            <Button type="submit" className="w-full text-white rounded-lg">
              Sign Up
            </Button>
          </form>
        ) : (
          <form onSubmit={handleConfirmSignUp} className="space-y-4">
            <Input type="text" value={confirmCode} onChange={(e) => setConfirmCode(e.target.value)} placeholder="Enter confirmation code" required />
            {error && <p className="text-red-700 text-sm">{error}</p>}
            <Button type="submit" className="w-full text-white rounded-lg">
              Confirm Sign Up
            </Button>
          </form>
        )}
        <p className="text-center text-sm mt-4">
          Already have an account?{' '}
          <button onClick={onSwitchToSignIn} className="text-blue-600 hover:underline">
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
}

export default SignUp
