import { SidebarNavigation } from '../components/Sidebar'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Products } from './Products'
import { CreateOrEditProduct } from './Products/CreateOrEditProduct'
import { Tags } from './Tags'
import { useSession } from '../context/SessionContext'
import SignIn from '../components/SignIn'

function AppLayout() {
  const { isSignedIn } = useSession()
  return isSignedIn ? (
    <Router>
      <Layout sidebar={<SidebarNavigation></SidebarNavigation>}>
        <Routes>
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<CreateOrEditProduct />} />
          <Route path="/products/edit/:productId" element={<CreateOrEditProduct />} />
          <Route path="/tags" element={<Tags />} />
        </Routes>
      </Layout>
    </Router>
  ) : <SignIn />
}

export default AppLayout
