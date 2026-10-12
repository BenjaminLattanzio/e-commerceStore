export type Category = 'Clothing' | 'Shoes' | 'Accessories' | 'Home'

export type Product = {
  id: string
  title: string
  category: Category
  price: number
  compareAt?: number
  rating: number
  reviews: number
  image: string
  description: string
  color: string
  badge?: string
}

export const fallbackProducts: Product[] = [
  { id: 'linen-shirt', title: 'The Sunday Linen Shirt', category: 'Clothing', price: 88, compareAt: 110, rating: 4.9, reviews: 128, image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85', description: 'An easy, airy layer in responsibly sourced European flax. Cut to feel relaxed without losing its shape.', color: 'Cloud white', badge: 'Bestseller' },
  { id: 'everyday-tote', title: 'Everyday Carryall', category: 'Accessories', price: 64, rating: 4.8, reviews: 84, image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85', description: 'A sturdy, thoughtfully sized carryall for market mornings, work days, and everything in between.', color: 'Natural canvas' },
  { id: 'city-sneaker', title: 'City Runner 02', category: 'Shoes', price: 120, rating: 4.7, reviews: 93, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85', description: 'Light on your feet and easy on the eyes. Made with recycled mesh and a cushioned natural rubber sole.', color: 'Poppy / chalk', badge: 'New' },
  { id: 'ceramic-cup', title: 'Sunday Ceramic Cup', category: 'Home', price: 32, rating: 4.9, reviews: 57, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85', description: 'Wheel-thrown stoneware with a comfortable curve and a soft, satin glaze. Each one is a little different.', color: 'Warm white' },
  { id: 'weekender', title: 'The Weekender Bag', category: 'Accessories', price: 148, compareAt: 175, rating: 4.8, reviews: 62, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85', description: 'A roomy, durable travel companion with an interior laptop sleeve and space for that extra book.', color: 'Olive canvas' },
  { id: 'ribbed-knit', title: 'Soft Ribbed Tank', category: 'Clothing', price: 48, rating: 4.6, reviews: 41, image: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=900&q=85', description: 'A wardrobe staple in a breathable organic cotton rib. Designed to layer, made to live in.', color: 'Tomato red' },
  { id: 'leather-wallet', title: 'Foldover Card Case', category: 'Accessories', price: 52, rating: 4.8, reviews: 36, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85', description: 'A slim everyday essential, cut from supple leather that softens beautifully with time.', color: 'Chestnut' },
  { id: 'canvas-trainer', title: 'Court Canvas Low', category: 'Shoes', price: 94, rating: 4.7, reviews: 73, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=85', description: 'A clean, classic low-top with a flexible vulcanized sole and an unlined organic cotton upper.', color: 'Chalk / ink' },
  { id: 'glass-vase', title: 'Sculpted Glass Vase', category: 'Home', price: 58, rating: 4.9, reviews: 29, image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=85', description: 'Recycled glass shaped into a softly sculptural form. Lovely with a single stem or on its own.', color: 'Clear' },
  { id: 'overshirt', title: 'Weekend Overshirt', category: 'Clothing', price: 136, compareAt: 160, rating: 4.8, reviews: 51, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85', description: 'A substantial cotton twill layer with considered details and an easy, boxy fit.', color: 'Deep forest', badge: 'Almost gone' },
  { id: 'sunglasses', title: 'Daybreak Sunglasses', category: 'Accessories', price: 78, rating: 4.5, reviews: 48, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85', description: 'A modern, flattering frame made from plant-based acetate with UV400 lenses.', color: 'Tortoise' },
  { id: 'leather-slide', title: 'Sunday Leather Slide', category: 'Shoes', price: 110, rating: 4.8, reviews: 34, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=85', description: 'An effortless warm-weather sandal with cushioned footbeds and a considered leather finish.', color: 'Toffee' },
]

const categoryFor = (category: string): Category | null => {
  if (/shoe|sandal|boot|sneaker/i.test(category)) return 'Shoes'
  if (/home|furniture|decor|kitchen|lighting|vase|ceramic/i.test(category)) return 'Home'
  if (/bag|jewel|watch|glass|accessor|sunglass|wallet/i.test(category)) return 'Accessories'
  if (/shirt|dress|jacket|top|pants|jeans|hoodie|sweater|coat|skirt/i.test(category)) return 'Clothing'
  return null
}

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch('https://dummyjson.com/products?limit=100&select=id,title,description,category,price,rating,thumbnail,images')
    if (!response.ok) throw new Error('Catalog request failed')
    const result = await response.json() as { products?: Array<{ id: number; title: string; description: string; category: string; price: number; rating: number; thumbnail: string; images?: string[] }> }
    if (!result.products?.length) throw new Error('Catalog is empty')
    const catalog = result.products.flatMap((item) => {
      const category = categoryFor(item.category)
      return category ? [{
        id: String(item.id),
        title: item.title,
        category,
        price: item.price,
        rating: item.rating,
        reviews: Math.round(item.rating * 37),
        image: item.images?.[0] || item.thumbnail,
        description: item.description,
        color: 'As shown',
      }] : []
    })
    if (catalog.length < 6) return fallbackProducts
    const counts: Record<Category, number> = { Clothing: 0, Shoes: 0, Accessories: 0, Home: 0 }
    const additions = catalog.filter((product) => {
      if (counts[product.category] >= 3) return false
      counts[product.category] += 1
      return true
    })
    return [...fallbackProducts, ...additions]
  } catch {
    return fallbackProducts
  }
}
