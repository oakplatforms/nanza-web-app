import { SidebarNavigation } from '../components/Sidebar'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Products } from './Products'
import { Tags } from './Tags'
import { useSession } from '../context/SessionContext'
import SignIn from '../components/SignIn'
import SignUpPage from '../components/SignUpPage'
import { Homepage } from './Homepage'
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
        {/* Login and Signup routes - accessible to all */}
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUpPage />} />
        
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
            <Route path="/products" element={
              <Layout navbar={<TopNavbar />} sidebar={<SidebarNavigation></SidebarNavigation>}>
                <Products />
              </Layout>
            } />
            <Route path="/homepage" element={
              <Layout navbar={<TopNavbar />} sidebar={<SidebarNavigation></SidebarNavigation>}>
                <Homepage />
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
            <Route path="/sets" element={
              <Layout>
                <Sets readOnly={true} />
              </Layout>
            } />
            <Route path="/homepage" element={
              <Layout>
                <Homepage readOnly={true} />
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
