import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ErrorBoundary, RouteGuard, validateUploadId, PrivateRoute } from './components/common'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { MappingPage } from './pages/MappingPage'
import { ProductsPage } from './pages/ProductsPage'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'
import { ProductEditPage } from './pages/ProductEditPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ErrorPage } from './pages/ErrorPage'
import { Toaster } from 'sonner'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Toaster position="top-right" />
          <Layout>
            <Routes>
              {/* Login - Public */}
              <Route path="/login" element={<LoginPage />} />

              {/* Home - Private */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <HomePage />
                  </PrivateRoute>
                }
              />

              {/* Mapping - Private + Route Guard */}
              <Route
                path="/mapping/:uploadId"
                element={
                  <PrivateRoute>
                    <RouteGuard validate={validateUploadId}>
                      <MappingPage />
                    </RouteGuard>
                  </PrivateRoute>
                }
              />

              {/* Products - Private + Route Guard */}
              <Route
                path="/products/:uploadId"
                element={
                  <PrivateRoute>
                    <RouteGuard validate={validateUploadId}>
                      <ProductsPage />
                    </RouteGuard>
                  </PrivateRoute>
                }
              />

              {/* Profile - Private */}
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />

              {/* Product Edit - Private */}
              <Route
                path="/products/edit/:productId"
                element={
                  <PrivateRoute>
                    <ProductEditPage />
                  </PrivateRoute>
                }
              />

              {/* Error Page */}
              <Route path="/error" element={<ErrorPage />} />

              {/* 404 - Not Found (catch all) */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
