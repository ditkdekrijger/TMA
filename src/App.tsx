import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Toasts from './components/Toasts'
import Home from './pages/Home'
import CategoryPage from './pages/CategoryPage'
import ProductPage from './pages/ProductPage'
import SearchPage from './pages/SearchPage'
import BrandsPage from './pages/BrandsPage'
import BrandPage from './pages/BrandPage'
import DealsPage from './pages/DealsPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ThanksPage from './pages/ThanksPage'
import WishlistPage from './pages/WishlistPage'
import ComparePage from './pages/ComparePage'
import FinderPage from './pages/FinderPage'
import ServicePage from './pages/ServicePage'
import NotFound from './pages/NotFound'
import { useTitle } from './lib/useTitle'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  useTitle()
  if (pathname === '/afrekenen') return <><ScrollTop /><CheckoutPage /><Toasts /></>
  return (
    <>
      <ScrollTop />
      <a className="skip" href="#main">Naar de inhoud</a>
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/c/:cat" element={<CategoryPage />} />
          <Route path="/c/:cat/:sub" element={<CategoryPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/zoeken" element={<SearchPage />} />
          <Route path="/merken" element={<BrandsPage />} />
          <Route path="/merk/:brand" element={<BrandPage />} />
          <Route path="/nieuw" element={<DealsPage />} />
          <Route path="/aanbiedingen" element={<DealsPage />} />
          <Route path="/winkelwagen" element={<CartPage />} />
          <Route path="/bedankt" element={<ThanksPage />} />
          <Route path="/verlanglijst" element={<WishlistPage />} />
          <Route path="/vergelijk" element={<ComparePage />} />
          <Route path="/keuzehulp" element={<FinderPage />} />
          <Route path="/service" element={<ServicePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <Toasts />
    </>
  )
}
