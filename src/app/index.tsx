import amplifyConfig from '../amplify-config.json'
import { Amplify } from 'aws-amplify'
import { SessionProvider } from '../context/SessionContext'
import AppLayout from './AppLayout'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

Amplify.configure(amplifyConfig)

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <AppLayout />
      </SessionProvider>
    </QueryClientProvider>
  )
}

export default App
