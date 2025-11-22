import { SidebarNavigation } from '../components/Sidebar'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
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
import { Dashboard } from './Dashboard'
import { TopNavbar } from '../components/TopNavbar'
import { UserProfile } from './UserProfile'
import { Listing } from './Listing'
import { EntityDetail } from './EntityDetail'

function AppLayout() {
  const { isSignedIn } = useSession()
  
  if (isSignedIn === undefined) {
    return null
  }

  return (
    <Router>
      <Routes>
        {/* Login route - accessible to all */}
        <Route path="/login" element={<SignIn />} />
        
        {/* Authenticated admin routes */}
        {isSignedIn ? (
          <>
            <Route path="/dashboard" element={
              <Layout navbar={<TopNavbar />} sidebar={<SidebarNavigation></SidebarNavigation>}>
                <Dashboard />
              </Layout>
            } />
            <Route path="/tags" element={
              <Layout navbar={<TopNavbar />} sidebar={<SidebarNavigation></SidebarNavigation>}>
                <Tags />
              </Layout>
            } />
            <Route path="/brands" element={
              <Layout navbar={<TopNavbar />} sidebar={<SidebarNavigation></SidebarNavigation>}>
                <Brands />
              </Layout>
            } />
            <Route path="/categories" element={
              <Layout navbar={<TopNavbar />} sidebar={<SidebarNavigation></SidebarNavigation>}>
                <Categories />
              </Layout>
            } />
            <Route path="/products" element={
              <Layout navbar={<TopNavbar />} sidebar={<SidebarNavigation></SidebarNavigation>}>
                <Products />
              </Layout>
            } />
            <Route path="/shipping-methods" element={
              <Layout navbar={<TopNavbar />} sidebar={<SidebarNavigation></SidebarNavigation>}>
                <ShippingMethods />
              </Layout>
            } />
            <Route path="/shipping-options" element={
              <Layout navbar={<TopNavbar />} sidebar={<SidebarNavigation></SidebarNavigation>}>
                <ShippingOptions />
              </Layout>
            } />
            <Route path="/homepage" element={
              <Layout navbar={<TopNavbar />} sidebar={<SidebarNavigation></SidebarNavigation>}>
                <Homepage />
              </Layout>
            } />
            <Route path="/conditions" element={
              <Layout navbar={<TopNavbar />} sidebar={<SidebarNavigation></SidebarNavigation>}>
                <Conditions />
              </Layout>
            } />
            <Route path="/sets" element={
              <Layout navbar={<TopNavbar />} sidebar={<SidebarNavigation></SidebarNavigation>}>
                <Sets />
              </Layout>
            } />
            <Route path="/:brandSlug/:entityId" element={
              <Layout>
                <EntityDetail />
              </Layout>
            } />
            <Route path="/:username/:listingId" element={
              <Layout>
                <Listing />
              </Layout>
            } />
            <Route path="/:username" element={
              <Layout>
                <UserProfile />
              </Layout>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          /* Public read-only routes */
          <>
            <Route path="/" element={
              <Layout>
                <Products readOnly={true} />
              </Layout>
            } />
            <Route path="/products" element={
              <Layout>
                <Products readOnly={true} />
              </Layout>
            } />
            <Route path="/tags" element={
              <Layout>
                <Tags readOnly={true} />
              </Layout>
            } />
            <Route path="/brands" element={
              <Layout>
                <Brands readOnly={true} />
              </Layout>
            } />
            <Route path="/categories" element={
              <Layout>
                <Categories readOnly={true} />
              </Layout>
            } />
            <Route path="/sets" element={
              <Layout>
                <Sets readOnly={true} />
              </Layout>
            } />
            <Route path="/shipping-methods" element={
              <Layout>
                <ShippingMethods readOnly={true} />
              </Layout>
            } />
            <Route path="/shipping-options" element={
              <Layout>
                <ShippingOptions readOnly={true} />
              </Layout>
            } />
            <Route path="/homepage" element={
              <Layout>
                <Homepage readOnly={true} />
              </Layout>
            } />
            <Route path="/conditions" element={
              <Layout>
                <Conditions readOnly={true} />
              </Layout>
            } />
            <Route path="/:brandSlug/:entityId" element={
              <Layout>
                <EntityDetail />
              </Layout>
            } />
            <Route path="/:username/:listingId" element={
              <Layout>
                <Listing />
              </Layout>
            } />
            <Route path="/:username" element={
              <Layout>
                <UserProfile />
              </Layout>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  )
}

export default AppLayout
