import { createContext } from 'react'
import type { Product } from '../data/products'

export type CartLine = { product: Product; quantity: number }
export type Customer = { name: string; email: string }
export type Order = { id: string; date: string; total: number; items: CartLine[]; email: string; status: string }

export type StoreContextValue = {
  cart: CartLine[]
  user: Customer | null
  orders: Order[]
  addToCart: (product: Product, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  signIn: (customer: Customer) => void
  signOut: () => void
  placeOrder: (customer: Customer) => Order
}

export const StoreContext = createContext<StoreContextValue | null>(null)
