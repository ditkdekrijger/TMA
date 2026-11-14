import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { productById } from '../data/catalog'
import { BULKY_CATEGORIES, shop } from '../lib/config'

export interface CartLine { id: string; variant: string; qty: number }

interface Toast { id: number; text: string; action?: { label: string; to: string } }

interface Store {
  cart: CartLine[]
  add: (id: string, variant: string, qty?: number) => void
  setQty: (id: string, variant: string, qty: number) => void
  remove: (id: string, variant: string) => void
  clear: () => void
  count: number
  subtotal: number
  shipping: number
  discount: number
  coupon: string | null
  applyCoupon: (code: string) => boolean
  total: number
  wishlist: string[]
  toggleWish: (id: string) => void
  compare: string[]
  toggleCompare: (id: string) => void
  recent: string[]
  viewed: (id: string) => void
  drawer: boolean
  setDrawer: (v: boolean) => void
  toasts: Toast[]
  toast: (text: string, action?: Toast['action']) => void
}

const Ctx = createContext<Store | null>(null)

function useStored<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch { return initial }
  })
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* privémodus */ }
  }, [key, v])
  return [v, setV] as const
}

const COUPONS: Record<string, number> = { WELKOM10: 0.1, MUZIEK5: 0.05 }

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useStored<CartLine[]>('kh.cart', [])
  const [wishlist, setWish] = useStored<string[]>('kh.wish', [])
  const [compare, setCompare] = useStored<string[]>('kh.compare', [])
  const [recent, setRecent] = useStored<string[]>('kh.recent', [])
  const [coupon, setCoupon] = useStored<string | null>('kh.coupon', null)
  const [drawer, setDrawer] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const validCart = useMemo(() => cart.filter((l) => productById[l.id]), [cart])

  const toast = useCallback((text: string, action?: Toast['action']) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t.slice(-2), { id, text, action }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800)
  }, [])

  const add = useCallback((id: string, variant: string, qty = 1) => {
    setCart((c) => {
      const i = c.findIndex((l) => l.id === id && l.variant === variant)
      if (i >= 0) return c.map((l, j) => (j === i ? { ...l, qty: Math.min(99, l.qty + qty) } : l))
      return [...c, { id, variant, qty }]
    })
    setDrawer(true)
  }, [setCart])

  const setQty = useCallback((id: string, variant: string, qty: number) =>
    setCart((c) => (qty <= 0 ? c.filter((l) => !(l.id === id && l.variant === variant)) : c.map((l) => (l.id === id && l.variant === variant ? { ...l, qty: Math.min(99, qty) } : l)))), [setCart])
  const remove = useCallback((id: string, variant: string) => setCart((c) => c.filter((l) => !(l.id === id && l.variant === variant))), [setCart])
  const clear = useCallback(() => { setCart([]); setCoupon(null) }, [setCart, setCoupon])

  const toggleWish = useCallback((id: string) => {
    setWish((w) => {
      const has = w.includes(id)
      toast(has ? 'Verwijderd van je verlanglijst' : 'Toegevoegd aan je verlanglijst', has ? undefined : { label: 'Bekijk', to: '/verlanglijst' })
      return has ? w.filter((x) => x !== id) : [id, ...w]
    })
  }, [setWish, toast])

  const toggleCompare = useCallback((id: string) => {
    setCompare((c) => {
      if (c.includes(id)) return c.filter((x) => x !== id)
      if (c.length >= 4) { toast('Je kunt maximaal 4 producten vergelijken'); return c }
      toast('Toegevoegd aan vergelijking', { label: 'Vergelijk', to: '/vergelijk' })
      return [...c, id]
    })
  }, [setCompare, toast])

  const viewed = useCallback((id: string) => setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, 12)), [setRecent])

  const applyCoupon = useCallback((code: string) => {
    const c = code.trim().toUpperCase()
    if (COUPONS[c]) { setCoupon(c); return true }
    return false
  }, [setCoupon])

  const count = validCart.reduce((s, l) => s + l.qty, 0)
  const subtotal = validCart.reduce((s, l) => s + productById[l.id].price * l.qty, 0)
  const discount = coupon ? Math.round(subtotal * COUPONS[coupon] * 100) / 100 : 0
  const bulky = validCart.some((l) => BULKY_CATEGORIES.includes(productById[l.id].category) && productById[l.id].price > 200)
  const shipping = count === 0 ? 0 : subtotal - discount >= shop.freeShippingFrom ? 0 : bulky ? shop.bulkyShippingCost : shop.shippingCost
  const total = Math.max(0, subtotal - discount + shipping)

  const value: Store = {
    cart: validCart, add, setQty, remove, clear, count, subtotal, shipping, discount, coupon, applyCoupon, total,
    wishlist, toggleWish, compare, toggleCompare, recent, viewed, drawer, setDrawer, toasts, toast,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore buiten StoreProvider')
  return s
}
