import { SidebarNavigation } from '../components/Sidebar'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Products } from './Products'
import { Tags } from './Tags'
import { useSession } from '../context/SessionContext'
import SignIn from '../components/SignIn'
import { Brands } from './Brands'
import { Categories } from './Categories'
import { ShippingMethods } from './ShippingMethods'
import { ShippingOptions } from './ShippingOptions'
import { Homepage } from './Homepage'
import { Conditions } from './Conditions'
import { Sets } from './Sets'

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
          <Route path="/shipping-methods" element={<ShippingMethods />} />
          <Route path="/shipping-options" element={<ShippingOptions />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/conditions" element={<Conditions />} />
          <Route path="/sets" element={<Sets />} />
        </Routes>
      </Layout>
    </Router>
  ) : <SignIn />
}

export default AppLayout
