import { SidebarNavigation } from '../components/Sidebar'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import { Layout } from '../components/Layout'
import { ProductsDashboard } from './dashboards/Product'
import { CreateOrEditProductForm } from './dashboards/Product/CreateOrEditProductForm'
import { TagsDashboard } from './dashboards/Tag'

function App() {
  return (
    <Router>
      <Layout sidebar={<SidebarNavigation></SidebarNavigation>}>
        <Routes>
          <Route path="/products" element={<ProductsDashboard />} />
          <Route path="/products/new" element={<CreateOrEditProductForm />} />
          <Route path="/products/edit/:productId" element={<CreateOrEditProductForm />} />
          <Route path="/tags" element={<TagsDashboard />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
