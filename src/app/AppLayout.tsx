import { SidebarNavigation } from '../components/Sidebar'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Products } from './Products'
import { Tags } from './Tags'
import { useSession } from '../context/SessionContext'
import SignIn from '../components/SignIn'
import { Brands } from './Brands'
import { Categories } from './Categories'

function AppLayout() {
  const { isSignedIn } = useSession()
  return isSignedIn === undefined ? (
    null
  ) : isSignedIn ? (
    <Router>
      <Layout sidebar={<SidebarNavigation></SidebarNavigation>}>
        <Routes>
          <Route path="/tags" element={<Tags />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </Layout>
    </Router>
  ) : <SignIn />
}

export default AppLayout
