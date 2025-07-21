import { createContext, useState, ReactNode, useEffect, Dispatch, SetStateAction, useContext } from 'react'
import { getCurrentUser } from 'aws-amplify/auth'
import { UserDto } from '../types'
import { userService } from '../services/api/User'

type TSessionContext = {
  isSignedIn?: boolean
  setIsSignedIn: Dispatch<SetStateAction<boolean | undefined>>
  currentUser: UserDto | undefined
  setCurrentUser: Dispatch<SetStateAction<UserDto | undefined>>
}

type SessionProviderProps = {
  children: ReactNode;
}

const SessionContext = createContext<TSessionContext>({
  isSignedIn: undefined,
  setIsSignedIn: () => false,
  currentUser: undefined,
  setCurrentUser: () => undefined
})

const SessionProvider = ({ children } : SessionProviderProps) => {
  const [isSignedIn, setIsSignedIn] = useState<boolean>()
  const [currentUser, setCurrentUser] = useState<UserDto>()

  useEffect(() => {
    async function checkUser() {
      try {
        await getCurrentUser()
        setIsSignedIn(true)
      } catch {
        setIsSignedIn(false)
      }
    }
    checkUser()
  }, [])

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const { userId } = await getCurrentUser()
        if (userId) {
          const userData = await userService.get(userId, '?include=admin')
          setCurrentUser({...userData, admin: { ...userData.admin, userId: undefined }})
        }
      } catch (error) {
        console.log(error)
      }
    }
    if (isSignedIn) {
      fetchCurrentUser()
    }
  }, [isSignedIn])

  return (
    <SessionContext.Provider value={{ isSignedIn, setIsSignedIn, currentUser, setCurrentUser }}>
      {children}
    </SessionContext.Provider>
  )
}

const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession hook must be used within the SessionProvider')
  }
  return context
}

export { SessionProvider, useSession }
