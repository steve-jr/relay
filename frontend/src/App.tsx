import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { RequireRole } from './auth/AuthContext'
import Layout from './components/Layout'
import { Login, RegisterBrand, RegisterCreator } from './pages/Auth'
import CreatorDetail from './pages/CreatorDetail'
import Directory from './pages/Directory'
import ForBrands from './pages/ForBrands'
import ForCreators from './pages/ForCreators'
import Home from './pages/Home'
import { About, Contact, Faq, NotFound, Privacy, Terms } from './pages/Info'

const BrandDashboard = lazy(() => import('./pages/Dashboards').then((m) => ({ default: m.BrandDashboard })))
const CreatorDashboard = lazy(() => import('./pages/Dashboards').then((m) => ({ default: m.CreatorDashboard })))
const AdminDashboard = lazy(() => import('./pages/Dashboards').then((m) => ({ default: m.AdminDashboard })))

export default function App() {
  return (
    <Suspense fallback={<p className="container-page py-24 text-muted" role="status">Loading…</p>}>
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="creators" element={<RequireRole role="brand"><Directory /></RequireRole>} />
        <Route path="creators/:slug" element={<RequireRole role="brand"><CreatorDetail /></RequireRole>} />
        <Route path="for-brands" element={<ForBrands />} />
        <Route path="for-creators" element={<ForCreators />} />
        <Route path="about" element={<About />} />
        <Route path="faq" element={<Faq />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="login" element={<Login />} />
        <Route path="register/brand" element={<RegisterBrand />} />
        <Route path="register/creator" element={<RegisterCreator />} />
        <Route path="dashboard/brand" element={<RequireRole role="brand"><BrandDashboard /></RequireRole>} />
        <Route path="dashboard/creator" element={<RequireRole role="creator"><CreatorDashboard /></RequireRole>} />
        <Route path="admin" element={<RequireRole role="admin"><AdminDashboard /></RequireRole>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
    </Suspense>
  )
}
