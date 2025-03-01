import awsExports from '../aws-exports'
import { Amplify } from 'aws-amplify'
import { SessionProvider } from '../context/SessionContext'
import AppLayout from './AppLayout'

Amplify.configure(awsExports)

function App() {
  return (
    <SessionProvider>
      <AppLayout />
    </SessionProvider>
  )
}

export default App
