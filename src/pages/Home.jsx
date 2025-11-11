import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllProducts } from '../services/shopService';
import { formatPrice, getProductImage } from '../utils/productHelpers';
import Button from '../components/ui/Button';
import { NotificationIcon } from '../components/notifications';
import StockBadge from '../components/shop/StockBadge';
import CartIcon from '../components/cart/CartIcon';
import { Package } from 'lucide-react';
import './pages.css';

const stats = [
  { value: '500+', label: 'Productos disponibles' },
  { value: '50+', label: 'Marcas premium' },
  { value: '4.9/5', label: 'Valoración clientes' },
];

const benefits = [
  {
    title: 'Envío gratis',
    description: 'En compras superiores a Bs. 200. Recibe tus productos en 24-48h.',
    accent: 'bg-emerald-100 text-emerald-600',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    title: 'Garantía extendida',
    description: 'Todos nuestros productos cuentan con garantía oficial del fabricante.',
    accent: 'bg-primary-100 text-primary-600',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Soporte 24/7',
    description: 'Atención al cliente disponible todos los días. Resolvemos tus dudas.',
    accent: 'bg-amber-100 text-amber-600',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: 'Devoluciones fáciles',
    description: 'No estás satisfecho? Tienes 30 días para devoluciones sin complicaciones.',
    accent: 'bg-purple-100 text-purple-600',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    ),
  },
];

const steps = [
  {
    title: 'Explora el catálogo',
    description: 'Navega entre cientos de productos organizados por categorías. Usa filtros de precio, stock y búsqueda.',
  },
  {
    title: 'Agrega al carrito',
    description: 'Selecciona los productos que necesitas. Verifica stock disponible y precios actualizados.',
  },
  {
    title: 'Recibe en casa',
    description: 'Envío rápido en 24-48h. Garantía oficial y soporte técnico incluido en cada compra.',
  },
];

const Home = () => {
  const { user, loading } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Verificar si el usuario es administrador
  const isAdmin = user?.isAdmin || user?.role === 'ADMIN';

  // Cargar productos destacados al montar
  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoadingProducts(true);
      const products = await getAllProducts({ ordering: '-created_at' });
      // Tomar los primeros 4 productos
      setFeaturedProducts(products.slice(0, 4));
    } catch (error) {
      console.error('Error loading featured products:', error);
      setFeaturedProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-50 via-white to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-dark-900 rounded-2xl shadow-lg mb-4 animate-pulse">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <p className="text-dark-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-50 via-white to-white text-dark-900">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-dark-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark-900 text-white transition-transform group-hover:scale-110">
              <span className="text-sm font-bold">S</span>
            </div>
            <span className="text-lg font-semibold text-dark-900">Ventas inteligentes 365</span>
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <>
                {/* Iconos de Acción */}
                <div className="flex items-center gap-2">
                  <NotificationIcon />
                  <CartIcon />
                </div>

                {/* Mis Órdenes */}
                <Link to="/my-orders">
                  <button className="icon-button" style={{ gap: '6px', paddingLeft: '12px', paddingRight: '12px' }}>
                    <Package size={20} strokeWidth={2} />
                    <span className="hidden md:inline text-sm font-medium">Mis Órdenes</span>
                  </button>
                </Link>

                {/* Perfil de Usuario */}
                <Link to="/profile" className="group">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="hidden sm:flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="hidden md:flex flex-col">
                        <span className="text-sm font-semibold text-gray-900 leading-tight">{user.username}</span>
                        <span className="text-xs text-gray-500">Ver perfil</span>
                      </div>
                    </div>
                    <svg className="md:hidden w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Iniciar sesión</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="bg-dark-900 hover:bg-dark-800 focus:ring-dark-700">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="pt-16">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-50 via-white to-dark-50" />
          <div className="absolute top-[12%] right-[-12%] h-72 w-72 -rotate-12 rounded-full bg-primary-200/40 blur-3xl" />
          <div className="absolute bottom-[-18%] left-[-10%] h-80 w-80 rounded-full bg-dark-100/70 blur-3xl" />

          <div className="mx-auto grid max-w-7xl items-start gap-12 px-6 pt-16 pb-24 sm:px-8 lg:grid-cols-[1fr_auto] lg:gap-16 lg:pt-24">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-dark-100 bg-white/80 px-4 py-2 text-sm font-medium shadow-soft backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-primary-500" />
                Tu tienda de tecnología inteligente
              </span>

              <h1 className="mt-6 text-4xl font-semibold leading-tight text-dark-900 sm:text-5xl lg:text-[52px]">
                Descubre productos de calidad para tu hogar y oficina
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-dark-600 md:text-xl">
                Explora nuestro catálogo de productos seleccionados. Envío rápido, garantía oficial y soporte técnico especializado.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link to="/shop" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full bg-dark-900 hover:bg-dark-800 focus:ring-dark-700"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Ver catálogo completo
                  </Button>
                </Link>
                
                {!user ? (
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-dark-200 text-dark-800 hover:bg-dark-900 hover:text-white focus:ring-dark-400"
                    >
                      Crear cuenta
                    </Button>
                  </Link>
                ) : (
                  <Link 
                    to={isAdmin ? '/admin/dashboard' : '/profile'} 
                    className="w-full sm:w-auto"
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-dark-200 text-dark-800 hover:bg-dark-900 hover:text-white focus:ring-dark-400"
                    >
                      {isAdmin ? 'Panel de administración' : 'Mi perfil'}
                    </Button>
                  </Link>
                )}
              </div>

              <dl className="mt-12 grid grid-cols-3 gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-dark-100 bg-white/80 px-4 py-4 shadow-soft backdrop-blur"
                  >
                    <dt className="text-xs text-dark-500">{stat.label}</dt>
                    <dd className="mt-1 text-2xl font-semibold text-dark-900">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative z-10 w-full max-w-[420px] rounded-[2.25rem] border border-white/60 bg-white/80 p-8 shadow-premium backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-dark-500">Productos destacados</p>
                  <h3 className="mt-2 text-2xl font-semibold text-dark-900">Recién llegados</h3>
                </div>
                <Link to="/shop">
                  <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 cursor-pointer hover:bg-primary-200 transition-colors">
                    Ver todos
                  </span>
                </Link>
              </div>

              <div className="mt-8 space-y-4">
                {loadingProducts ? (
                  // Loading skeletons
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-2xl border border-dark-100 bg-white/90 px-5 py-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))
                ) : featuredProducts.length > 0 ? (
                  featuredProducts.slice(0, 3).map((product) => (
                    <Link 
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between rounded-2xl border border-dark-100 bg-white/90 px-5 py-4 shadow-soft hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-dark-900 truncate">{product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-dark-500">{product.category_name || 'Sin categoría'}</p>
                            <span className="text-xs">•</span>
                            <StockBadge stock={product.stock} />
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-dark-800 ml-3">{formatPrice(product.price)}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8 text-dark-500">
                    <p className="text-sm">No hay productos disponibles</p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-center gap-4 rounded-2xl border border-dark-100 bg-dark-900/95 px-5 py-4 text-white shadow-soft">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6l3 6h6l-4.5 3.5L18 21l-6-3.5L6 21l1.5-5.5L3 12h6l3-6z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold">Clientes satisfechos</p>
                  <p className="text-xs text-white/70">4.9/5 calificación promedio</p>
                </div>
                <span className="ml-auto text-2xl font-bold">12K+</span>
              </div>

              <div className="mt-6 flex gap-4 rounded-2xl border border-white/60 bg-white/90 p-5 shadow-soft backdrop-blur">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-dark-900">Envío gratis</p>
                  <p className="mt-1 text-xs text-dark-500">En compras superiores a Bs. 200</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="flex h-7 px-3 items-center justify-center rounded-full bg-dark-900/90 text-[11px] font-semibold text-white shadow-soft">
                      24-48h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-dark-900 md:text-4xl">¿Por qué comprar con nosotros?</h2>
                <p className="mt-4 max-w-2xl text-dark-600">
                  Ofrecemos mucho más que productos. Garantizamos calidad, rapidez y atención personalizada en cada compra.
                </p>
              </div>
              <Link to="/shop" className="inline-flex">
                <Button variant="ghost" size="md" className="text-dark-700 hover:bg-dark-100">
                  Explorar tienda
                </Button>
              </Link>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="group rounded-3xl border border-dark-100 bg-white/80 p-8 shadow-soft backdrop-blur transition-transform duration-300 hover:-translate-y-1 hover:shadow-premium"
                >
                  <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${benefit.accent}`}>
                    {benefit.icon}
                  </span>
                  <h3 className="mt-6 text-xl font-semibold text-dark-900">{benefit.title}</h3>
                  <p className="mt-3 text-dark-600">{benefit.description}</p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-dark-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span>Más información</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Grid */}
        <section className="px-6 py-20 sm:px-8 bg-gradient-to-b from-white to-dark-50">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-dark-900 md:text-4xl">Productos destacados</h2>
              <p className="mt-4 text-dark-600">
                Descubre nuestra selección de productos más populares
              </p>
            </div>

            {loadingProducts ? (
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-2xl border border-dark-100 bg-white p-4 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {featuredProducts.map((product) => (
                  <Link 
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="group"
                  >
                    <div className="rounded-2xl border border-dark-100 bg-white p-4 shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 mb-4">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2">
                          <StockBadge stock={product.stock} />
                        </div>
                      </div>
                      <h3 className="font-semibold text-dark-900 truncate group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-dark-500 mt-1">{product.category_name || 'Sin categoría'}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold text-dark-900">{formatPrice(product.price)}</span>
                        <span className="text-xs text-dark-500">{product.stock} disponibles</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-12 text-center py-16">
                <p className="text-dark-500">No hay productos disponibles en este momento</p>
              </div>
            )}

            <div className="mt-12 text-center">
              <Link to="/shop">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-dark-900 hover:bg-dark-800 focus:ring-dark-700"
                >
                  Ver todos los productos
                  <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-dark-900 py-24 text-white">
          <div className="mx-auto grid max-w-7xl gap-16 px-6 sm:px-8 lg:grid-cols-[420px_1fr]">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">Compra fácil en 3 pasos</h2>
              <p className="mt-4 text-white/70">
                Un proceso de compra simple y seguro. Desde la búsqueda hasta la entrega, todo está diseñado para tu comodidad.
              </p>
            </div>

            <div className="space-y-8">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="relative rounded-3xl border border-white/15 bg-white/5 p-8 shadow-soft backdrop-blur"
                >
                  <span className="absolute -top-5 left-8 flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-lg font-semibold text-white shadow-soft">
                    {index + 1}
                  </span>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-white/70">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-24 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-dark-100 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 p-12 text-white shadow-premium">
              <div className="absolute -top-20 -right-10 h-56 w-56 rounded-full bg-primary-500/40 blur-3xl" />
              <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-3xl font-bold md:text-4xl">¿Listo para empezar a comprar?</h2>
                  <p className="mt-4 max-w-xl text-white/80">
                    Explora nuestro catálogo completo con envío rápido, garantía oficial y las mejores ofertas del mercado.
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link to="/shop">
                    <Button
                      variant="primary"
                      size="lg"
                      className="bg-white text-dark-900 hover:bg-dark-100 focus:ring-white/40"
                    >
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Ir a la tienda
                    </Button>
                  </Link>
                  {!user && (
                    <Link to="/register">
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-white text-white hover:bg-white hover:text-dark-900 focus:ring-white/60"
                      >
                        Crear cuenta
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-dark-100 bg-white/80 py-12 px-6 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark-900 text-white">
              <span className="text-sm font-bold">S</span>
            </div>
            <span className="text-lg font-semibold text-dark-900">Ventas inteligentes 365</span>
          </div>
          <p className="text-sm text-dark-600">
            © 2025 SmartSales365. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;