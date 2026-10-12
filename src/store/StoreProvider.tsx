import { useEffect, useState, type ReactNode } from 'react'
import { StoreContext, type Customer, type Order, type CartLine } from './context'
import type { Product } from '../data/products'

function readStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) as T : fallback
  } catch {
    return fallback
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>(() => readStorage('field-cart', []))
  const [user, setUser] = useState<Customer | null>(() => readStorage('field-user', null))
  const [orders, setOrders] = useState<Order[]>(() => readStorage('field-orders', []))

  useEffect(() => { localStorage.setItem('field-cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => {
    if (user) localStorage.setItem('field-user', JSON.stringify(user))
    else localStorage.removeItem('field-user')
  }, [user])
  useEffect(() => { localStorage.setItem('field-orders', JSON.stringify(orders)) }, [orders])

  function addToCart(product: Product, quantity = 1) {
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id)
      return existing
        ? current.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + quantity } : line)
        : [...current, { product, quantity }]
    })
  }

  function updateQuantity(productId: string, quantity: number) {
    setCart((current) => quantity < 1 ? current.filter((line) => line.product.id !== productId) : current.map((line) => line.product.id === productId ? { ...line, quantity } : line))
  }

  function removeFromCart(productId: string) {
    setCart((current) => current.filter((line) => line.product.id !== productId))
  }

  function signIn(customer: Customer) {
    setUser(customer)
  }

  function signOut() {
    setUser(null)
  }

  function placeOrder(customer: Customer) {
    const subtotal = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0)
    const order: Order = {
      id: `FS-${Date.now().toString().slice(-7)}`,
      date: new Date().toISOString(),
      total: subtotal + (subtotal >= 100 ? 0 : 8),
      items: cart,
      email: customer.email,
      status: 'Confirmed',
    }
    setOrders((current) => [order, ...current])
    setUser(customer)
    setCart([])
    return order
  }

  return <StoreContext.Provider value={{ cart, user, orders, addToCart, updateQuantity, removeFromCart, signIn, signOut, placeOrder }}>{children}</StoreContext.Provider>
}
