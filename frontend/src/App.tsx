import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { UploadPage } from './pages/UploadPage'
import { MappingPage } from './pages/MappingPage'
import { ProductsPage } from './pages/ProductsPage'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/mapping/:uploadId" element={<MappingPage />} />
          <Route path="/products/:uploadId" element={<ProductsPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
