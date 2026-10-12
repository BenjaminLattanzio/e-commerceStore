import { useState, type FormEvent } from 'react'
import { BrowserRouter, Link, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowRight, Check, ChevronDown, Heart, Menu, Minus, Plus, Search, ShoppingBag, Trash2, UserRound, X } from 'lucide-react'
import { type Category, type Product } from './data/products'
import { useProducts } from './hooks/useProducts'
import { StoreProvider } from './store/StoreProvider'
import { useStore } from './store/useStore'
import type { Customer } from './store/context'
import './App.css'

const categories: Array<'All' | Category> = ['All', 'Clothing', 'Shoes', 'Accessories', 'Home']
const money = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

function Header() {
  const { cart, user } = useStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchState, setSearchState] = useState({ query, value: query })
  const search = searchState.query === query ? searchState.value : query
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const navigate = useNavigate()

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (search.trim()) next.set('q', search.trim())
      else next.delete('q')
      return next
    })
    navigate(`/?${search.trim() ? `q=${encodeURIComponent(search.trim())}` : ''}`)
    setMobileSearchOpen(false)
    setMenuOpen(false)
  }

  return <header className="site-header" id="top">
    <div className="announcement">A little something extra: complimentary shipping over $100 <ArrowRight size={13} /></div>
    <div className="header-main">
      <button className="icon-button mobile-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      <Link className="wordmark" to="/" aria-label="Field Supply home">field<span> / </span>supply</Link>
      <nav className={menuOpen ? 'primary-nav is-open' : 'primary-nav'} aria-label="Main navigation">
        <Link to="/?category=Clothing" onClick={() => setMenuOpen(false)}>Clothing</Link>
        <Link to="/?category=Shoes" onClick={() => setMenuOpen(false)}>Shoes</Link>
        <Link to="/?category=Accessories" onClick={() => setMenuOpen(false)}>Accessories</Link>
        <Link to="/?category=Home" onClick={() => setMenuOpen(false)}>Home goods</Link>
      </nav>
      <div className="header-actions">
        <form className={mobileSearchOpen ? 'header-search search-open' : 'header-search'} onSubmit={submitSearch} role="search">
          <button className="mobile-search-toggle" type="button" aria-label="Open search" onClick={() => setMobileSearchOpen(!mobileSearchOpen)}><Search size={17} strokeWidth={1.7} /></button>
          <input aria-label="Search products" placeholder="Search the shop" value={search} onChange={(event) => setSearchState({ query, value: event.target.value })} />
          {search && <button className="search-clear" type="button" aria-label="Clear search" onClick={() => { setSearchState({ query: '', value: '' }); setSearchParams({}) }}><X size={14} /></button>}
        </form>
        <Link className="icon-button account-action" to="/account" aria-label={user ? `Account for ${user.name}` : 'Sign in'}><UserRound /></Link>
        <Link className="icon-button bag-action" to="/cart" aria-label={`Shopping bag, ${cart.reduce((sum, line) => sum + line.quantity, 0)} items`}><ShoppingBag /><span className="bag-count">{cart.reduce((sum, line) => sum + line.quantity, 0)}</span></Link>
      </div>
    </div>
  </header>
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const { addToCart } = useStore()
  const [added, setAdded] = useState(false)
  function add() {
    addToCart(product)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1300)
  }

  return <article className="product-card" style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}>
    <Link className="product-image-wrap" to={`/product/${product.id}`} aria-label={`View ${product.title}`}>
      <img src={product.image} alt={product.title} loading="lazy" />
      {product.badge && <span className="product-badge">{product.badge}</span>}
      <span className="quick-view">View item <ArrowRight size={14} /></span>
    </Link>
    <div className="product-meta"><span>{product.category}</span><span className="rating">★ {product.rating.toFixed(1)}</span></div>
    <div className="product-card-bottom">
      <div><Link className="product-title" to={`/product/${product.id}`}>{product.title}</Link><p className="product-price">{money(product.price)} {product.compareAt && <del>{money(product.compareAt)}</del>}</p></div>
      <button className={added ? 'quick-add added' : 'quick-add'} onClick={add} aria-label={added ? 'Added to bag' : `Add ${product.title} to bag`}>{added ? <Check size={16} /> : <Plus size={16} />}</button>
    </div>
  </article>
}

function ProductGrid({ products, loading }: { products: Product[]; loading: boolean }) {
  if (loading) return <div className="loading-grid" aria-label="Loading products">{Array.from({ length: 8 }, (_, index) => <div className="skeleton" key={index} />)}</div>
  if (!products.length) return <div className="empty-results"><span>Nothing on this shelf.</span><p>Try another search or explore all of our good things.</p><Link className="text-link" to="/">Clear filters <ArrowRight size={15} /></Link></div>
  return <div className="product-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}</div>
}

function HomePage({ products, loading }: { products: Product[]; loading: boolean }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const selectedCategory = searchParams.get('category') || 'All'
  const sort = searchParams.get('sort') || 'featured'
  const filtered = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesQuery = `${product.title} ${product.category} ${product.description}`.toLowerCase().includes(query.toLowerCase())
    return matchesCategory && matchesQuery
  })
  const visible = [...filtered].sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price
    if (sort === 'price-high') return b.price - a.price
    if (sort === 'top-rated') return b.rating - a.rating
    return 0
  })

  function setFilter(key: string, value: string) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (!value || value === 'All' || value === 'featured') next.delete(key)
      else next.set(key, value)
      return next
    })
  }

  return <>
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> Good things, made to last</div>
          <h1>Make room<br />for <em>everyday.</em></h1>
          <p>Considered clothes and useful things for wherever the day takes you.</p>
          <a className="button button-dark" href="#shop">Shop the collection <ArrowRight size={16} /></a>
          <div className="hero-footnote"><span>01 / 04</span><span>Thoughtful by nature. Easy by design.</span></div>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1500&q=90" alt="A sunlit, relaxed everyday outfit" />
          <div className="hero-image-note"><span>New season</span><ArrowDown size={14} /></div>
          <div className="hero-image-index">ISSUE NO. 04 <span>—</span> THE EVERYDAY EDIT</div>
        </div>
      </section>

      <section className="promise-strip" aria-label="Our shop promises"><span>Made with intention</span><i /> <span>Materials that feel good</span><i /> <span>Free shipping over $100</span><i /> <span>Easy 30-day returns</span></section>

      <section id="shop" className="shop-section">
        <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> A well-edited collection</div><h2>Good things, <em>right this way.</em></h2></div><p>Everyday favorites, thoughtfully found.</p></div>
        <div className="shop-toolbar">
          <div className="category-tabs" aria-label="Filter by category">{categories.map((category) => <button key={category} className={selectedCategory === category ? 'category-tab active' : 'category-tab'} onClick={() => setFilter('category', category)}>{category}<span>{category === 'All' ? products.length : products.filter((product) => product.category === category).length}</span></button>)}</div>
          <label className="sort-control"><span>Sort:</span><select value={sort} onChange={(event) => setFilter('sort', event.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="top-rated">Top rated</option></select><ChevronDown size={14} /></label>
        </div>
        {(query || selectedCategory !== 'All') && <div className="filter-summary">{query && <span>Results for “{query}”</span>}{selectedCategory !== 'All' && <span>{selectedCategory}</span>}<button onClick={() => setSearchParams({})}>Clear all <X size={13} /></button></div>}
        <ProductGrid products={visible} loading={loading} />
        <div className="shop-bottom"><span>Showing {visible.length} of {products.length} considered things</span><a href="#top" className="text-link">Back to top <ArrowRight size={15} /></a></div>
      </section>

      <section className="journal-banner">
        <div className="journal-image"><img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1100&q=85" alt="A bright studio filled with carefully made clothing" loading="lazy" /></div>
        <div className="journal-copy"><div className="eyebrow"><span className="eyebrow-line" /> A little more about us</div><h2>Less, but<br /><em>so much better.</em></h2><p>We believe the things you use every day deserve a little more thought. So that's where we put ours.</p><Link to="/?category=Home" className="text-link">Explore the point of view <ArrowRight size={15} /></Link></div>
        <span className="journal-number">FIELD NOTES / 001</span>
      </section>
    </main>
    <Footer />
  </>
}

function ProductPage({ products }: { products: Product[] }) {
  const { id = '' } = useParams()
  const { addToCart } = useStore()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const product = products.find((item) => item.id === id)
  if (!product && !products.length) return <main className="page-shell detail-loading"><div className="skeleton" /><div className="skeleton" /></main>
  if (!product) return <main className="page-shell not-found"><span className="eyebrow">A little detour</span><h1>We couldn't find that one.</h1><Link to="/" className="button button-dark">Back to the shop <ArrowRight size={16} /></Link></main>
  return <><main className="detail-page page-shell">
    <Link className="back-link" to="/"><ArrowLeft size={15} /> Back to the collection</Link>
    <div className="detail-layout"><div className="detail-image"><img src={product.image} alt={product.title} /><span className="image-caption">FIELD / OBJECT No. {id.slice(-3).toUpperCase()}</span></div>
      <div className="detail-copy"><div className="eyebrow"><span className="eyebrow-line" /> {product.category} / Field selection</div><h1>{product.title}</h1><div className="detail-rating"><span>★ {product.rating.toFixed(1)}</span><span>{product.reviews} reviews</span></div><div className="detail-price">{money(product.price)} {product.compareAt && <del>{money(product.compareAt)}</del>}</div><p className="detail-description">{product.description}</p><div className="product-attribute"><span>Color</span><strong>{product.color}</strong></div><div className="quantity-control"><span>Quantity</span><div><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={14} /></button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)}><Plus size={14} /></button></div></div><button className="button button-dark add-to-bag" onClick={() => { addToCart(product, quantity); setAdded(true); window.setTimeout(() => setAdded(false), 1400) }}>{added ? <><Check size={16} /> Added to your bag</> : <>Add to bag <span>{money(product.price * quantity)}</span></>}</button><div className="detail-perks"><span><Check size={15} /> Free shipping over $100</span><span><Check size={15} /> Easy 30-day returns</span><span><Check size={15} /> Made with intention</span></div><div className="detail-note"><Heart size={16} /><span>Made for your everyday, and the days that feel like something more.</span></div></div>
    </div>
  </main><Footer /></>
}

function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useStore()
  const subtotal = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0)
  if (!cart.length) return <><main className="page-shell empty-cart"><div className="empty-icon"><ShoppingBag size={25} /></div><div className="eyebrow"><span className="eyebrow-line" /> Nothing in here just yet</div><h1>Your bag has<br /><em>room for good things.</em></h1><Link to="/" className="button button-dark">Find your everyday <ArrowRight size={16} /></Link></main><Footer /></>
  return <><main className="page-shell cart-page"><div className="eyebrow"><span className="eyebrow-line" /> Your good things</div><h1>Your bag<span className="cart-item-count">({cart.reduce((sum, line) => sum + line.quantity, 0)})</span></h1><div className="cart-layout"><div className="cart-lines">{cart.map(({ product, quantity }) => <article className="cart-line" key={product.id}><Link to={`/product/${product.id}`} className="cart-line-image"><img src={product.image} alt={product.title} /></Link><div className="cart-line-info"><span className="cart-category">{product.category}</span><Link to={`/product/${product.id}`} className="cart-line-title">{product.title}</Link><span className="cart-color">{product.color}</span><div className="cart-quantity"><button aria-label="Decrease quantity" onClick={() => updateQuantity(product.id, quantity - 1)}><Minus size={13} /></button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => updateQuantity(product.id, quantity + 1)}><Plus size={13} /></button></div></div><div className="cart-line-right"><strong>{money(product.price * quantity)}</strong><button className="remove-item" onClick={() => removeFromCart(product.id)} aria-label={`Remove ${product.title}`}><Trash2 size={15} /></button></div></article>)}</div><aside className="order-summary"><h2>Order summary</h2><div className="summary-row"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="summary-row"><span>Shipping</span><span>{subtotal >= 100 ? 'Complimentary' : 'Calculated at checkout'}</span></div><div className="summary-total"><span>Estimated total</span><strong>{money(subtotal)}</strong></div><p className="tax-note">Taxes calculated at checkout.</p><Link className="button button-dark checkout-link" to="/checkout">Continue to checkout <ArrowRight size={16} /></Link><Link to="/" className="continue-shopping">Keep looking around</Link><div className="secure-note"><Check size={14} /> Thoughtful things, securely yours.</div></aside></div></main><Footer /></>
}

function CheckoutPage() {
  const { cart, user, placeOrder } = useStore()
  const navigate = useNavigate()
  const subtotal = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0)
  const [customer, setCustomer] = useState<Customer>({ name: user?.name || '', email: user?.email || '' })
  const [address, setAddress] = useState({ street: '', city: '', region: '', postal: '', country: 'United States' })
  if (!cart.length) return <main className="page-shell empty-checkout"><h1>There's nothing to check out yet.</h1><Link to="/" className="text-link">Back to the shop <ArrowRight size={15} /></Link></main>
  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const order = placeOrder(customer)
    navigate(`/account?placed=${order.id}`)
  }
  return <><main className="page-shell checkout-page"><Link className="back-link" to="/cart"><ArrowLeft size={15} /> Back to your bag</Link><div className="eyebrow"><span className="eyebrow-line" /> Nearly yours</div><h1>Let's make it <em>official.</em></h1><form className="checkout-layout" onSubmit={submitOrder}><div className="checkout-fields"><section className="form-section"><div className="form-section-heading"><span>01</span><div><h2>Contact</h2><p>Where should we send the good news?</p></div></div><div className="field-grid"><label className="field full-field">Email address<input type="email" required autoComplete="email" value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} placeholder="you@example.com" /></label><label className="field full-field">Full name<input required autoComplete="name" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Your name" /></label></div></section><section className="form-section"><div className="form-section-heading"><span>02</span><div><h2>Delivery</h2><p>Good things need a good place to land.</p></div></div><div className="field-grid"><label className="field full-field">Street address<input required autoComplete="street-address" value={address.street} onChange={(event) => setAddress({ ...address, street: event.target.value })} placeholder="123 Anywhere Street" /></label><label className="field">City<input required autoComplete="address-level2" value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} /></label><label className="field">State / region<input required autoComplete="address-level1" value={address.region} onChange={(event) => setAddress({ ...address, region: event.target.value })} /></label><label className="field">ZIP code<input required autoComplete="postal-code" value={address.postal} onChange={(event) => setAddress({ ...address, postal: event.target.value })} /></label><label className="field">Country<select value={address.country} onChange={(event) => setAddress({ ...address, country: event.target.value })}><option>United States</option><option>Canada</option><option>United Kingdom</option><option>Australia</option></select></label></div></section><section className="form-section payment-section"><div className="form-section-heading"><span>03</span><div><h2>Payment</h2><p>A demo checkout, no payment details needed.</p></div></div><div className="payment-demo"><span className="payment-dot"><Check size={13} /></span><span><strong>Pay securely at a later step</strong><small>This preview doesn't collect card details.</small></span><span className="payment-label">DEMO</span></div></section></div><aside className="order-summary checkout-summary"><h2>In your bag <span>({cart.reduce((sum, line) => sum + line.quantity, 0)})</span></h2><div className="checkout-items">{cart.map(({ product, quantity }) => <div className="checkout-item" key={product.id}><img src={product.image} alt="" /><span className="checkout-item-quantity">{quantity}</span><div><strong>{product.title}</strong><small>{product.color}</small></div><span>{money(product.price * quantity)}</span></div>)}</div><div className="summary-row"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="summary-row"><span>Shipping</span><span>{subtotal >= 100 ? 'Complimentary' : money(8)}</span></div><div className="summary-total"><span>Total</span><strong>{money(subtotal + (subtotal >= 100 ? 0 : 8))}</strong></div><button className="button button-dark checkout-link" type="submit">Place your order <ArrowRight size={16} /></button><p className="checkout-legal">By placing your order, you agree to the very reasonable terms of this demo.</p></aside></form></main><Footer /></>
}

function AccountPage() {
  const { user, signIn, signOut, orders } = useStore()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', password: '' })
  const [error, setError] = useState('')
  const userOrders = user ? orders.filter((order) => order.email.toLowerCase() === user.email.toLowerCase()) : []
  const placedOrder = searchParams.get('placed')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setError('Add your name, email, and a password of at least 6 characters.')
      return
    }
    signIn({ name: form.name.trim(), email: form.email.trim() })
    setError('')
  }
  return <><main className="page-shell account-page">{placedOrder && <div className="order-success"><span><Check size={18} /></span><div><strong>It's official. Thank you, {user?.name?.split(' ')[0] || 'friend'}.</strong><p>Order {placedOrder} is confirmed. A little good news is on its way to your inbox.</p></div></div>}<div className="eyebrow"><span className="eyebrow-line" /> Your corner of Field</div><h1>{user ? `Good to see you, ${user.name.split(' ')[0]}.` : 'Come on in.'}</h1>{user ? <div className="account-layout"><div className="account-intro"><p>Signed in as <strong>{user.email}</strong></p><button className="text-link sign-out" onClick={() => signOut()}>Sign out <ArrowRight size={15} /></button></div><section className="order-history"><div className="order-history-heading"><div><span className="eyebrow">The good things you've found</span><h2>Your orders</h2></div><span>{userOrders.length} {userOrders.length === 1 ? 'order' : 'orders'}</span></div>{userOrders.length ? userOrders.map((order) => <article className="order-card" key={order.id}><div className="order-card-top"><div><span className="order-number">{order.id}</span><span className="order-date">{new Date(order.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div><span className="order-status"><Check size={13} /> {order.status}</span></div><div className="order-card-items">{order.items.map(({ product, quantity }) => <Link to={`/product/${product.id}`} className="order-product" key={product.id}><img src={product.image} alt={product.title} /><span>{product.title}<small>Qty {quantity}</small></span></Link>)}</div><div className="order-card-total"><span>Order total</span><strong>{money(order.total)}</strong></div></article>) : <div className="no-orders"><ShoppingBag size={19} /><span>Your next favorite thing is out there.</span><Link to="/" className="text-link">Explore the shop <ArrowRight size={15} /></Link></div>}</section></div> : <div className="auth-layout"><div className="auth-copy"><div className="auth-mark">F<span>/</span>S</div><h2>A little home for<br />your <em>good things.</em></h2><p>Sign in to keep an eye on your orders and find your way back to the things you love.</p><div className="auth-note"><Heart size={16} />Thoughtfully kept, just for you.</div></div><form className="auth-form" onSubmit={submit}><div className="auth-form-heading"><h2>Sign in or join us</h2><p>It only takes a moment to feel at home.</p></div><label className="field">Your name<input autoComplete="name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="First and last name" /></label><label className="field">Email address<input type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label><label className="field">Password<input type="password" autoComplete="new-password" minLength={6} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 6 characters" /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-dark auth-submit" type="submit">Continue to your account <ArrowRight size={16} /></button><p className="auth-disclaimer">This is a local demo account. Your password isn't stored or sent anywhere.</p></form></div>}</main><Footer /></>
}

function Footer() {
  return <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><Link className="wordmark" to="/">field<span> / </span>supply</Link><p>Good things for ordinary days<br />and all the ones in between.</p></div><div className="footer-column"><span>Come explore</span><Link to="/?category=Clothing">Clothing</Link><Link to="/?category=Shoes">Shoes</Link><Link to="/?category=Accessories">Accessories</Link></div><div className="footer-column"><span>Good to know</span><Link to="/account">Your account</Link><Link to="/cart">Your bag</Link><a href="#shop">Shipping & returns</a></div><div className="footer-newsletter"><span>A note from us, once in a while.</span><label><input type="email" aria-label="Your email address" placeholder="Your email address" /><button aria-label="Subscribe"><ArrowRight size={16} /></button></label><small>No noise. Just the occasional good thing.</small></div></div><div className="footer-bottom"><span>© 2025 Field Supply. Made for the everyday.</span><span>Thoughtfully found, always.</span></div></footer>
}

function StoreApp() {
  const { products, loading } = useProducts()
  return <><Header /><Routes><Route path="/" element={<HomePage products={products} loading={loading} />} /><Route path="/product/:id" element={<ProductPage products={products} />} /><Route path="/cart" element={<CartPage />} /><Route path="/checkout" element={<CheckoutPage />} /><Route path="/account" element={<AccountPage />} /><Route path="*" element={<main className="page-shell not-found"><h1>That page wandered off.</h1><Link to="/" className="text-link">Back to the shop <ArrowRight size={15} /></Link></main>} /></Routes></>
}

function App() {
  return <StoreProvider><BrowserRouter><StoreApp /></BrowserRouter></StoreProvider>
}

export default App
