import { SidebarNavigation } from '../components/Sidebar'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { Layout } from '../components/Layout'
import { ProductsDashboard } from './dashboards/Product';
import { TagsDashboard } from './dashboards/Tag';
import { ProductForm } from './forms/Product';

function App() {
  return (
    <Router>
      <Layout sidebar={<SidebarNavigation></SidebarNavigation>}>
        <Routes>
          <Route path="/products" element={<ProductsDashboard />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/edit/:productId" element={<ProductForm />} />
          <Route path="/tags" element={<TagsDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
