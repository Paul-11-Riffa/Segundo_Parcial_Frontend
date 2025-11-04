import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const heroProducts = [
  { name: 'Termostato Nest', subtitle: 'Ahorra hasta un 30% de energía', price: '$249' },
  { name: 'Kit Philips Hue', subtitle: 'Iluminación adaptable y control por voz', price: '$189' },
  { name: 'Cerradura Yale', subtitle: 'Acceso seguro desde tu smartphone', price: '$299' },
];

const stats = [
  { value: '12K+', label: 'Pedidos entregados' },
  { value: '150+', label: 'Marcas premium aliadas' },
  { value: '4.9/5', label: 'Valoración promedio' },
];

const benefits = [
  {
    title: 'Calidad verificada',
    description: 'Seleccionamos y probamos cada producto antes de ofrecerlo en la tienda.',
    accent: 'bg-emerald-100 text-emerald-600',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    title: 'Entregas express',
    description: 'Cobertura nacional con envíos en 24-48h y seguimiento en tiempo real.',
    accent: 'bg-primary-100 text-primary-600',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18l-1.5 9h-15L3 7zm3 12h12M7 11h10" />
      </svg>
    ),
  },
  {
    title: 'Soporte humano',
    description: 'Especialistas que resuelven tus dudas por chat, videollamada o visita técnica.',
    accent: 'bg-amber-100 text-amber-600',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8m-8 4h5m11-4v6a2 2 0 01-2 2h-6l-4 4v-4H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    title: 'Pagos flexibles',
    description: 'Financia tus compras y paga a plazos con tasas preferenciales.',
    accent: 'bg-purple-100 text-purple-600',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18a2 2 0 012 2v6a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h.01M11 15h2" />
      </svg>
    ),
  },
];

const steps = [
  {
    title: 'Elige tu setup ideal',
    description: 'Explora un catálogo curado por expertos con comparativas claras y reseñas reales.',
  },
  {
    title: 'Acompañamiento personalizado',
    description: 'Un concierge te asesora en la instalación, configuración y uso diario de tus dispositivos.',
  },
  {
    title: 'Servicio postventa superior',
    description: 'Actualizaciones, mantenimiento y garantías extendidas para que tu inversión rinda más tiempo.',
  },
];

const Home = () => {
  const { user } = useAuth();

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

          <nav className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <span className="hidden text-sm text-dark-600 sm:inline">{user.username}</span>
                <Link to="/profile">
                  <Button variant="ghost" size="sm">Mi Perfil</Button>
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
                Tecnología seleccionada para tu hogar inteligente
              </span>

              <h1 className="mt-6 text-4xl font-semibold leading-tight text-dark-900 sm:text-5xl lg:text-[52px]">
                Eleva tu hogar con experiencias inteligentes y sin complicaciones
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-dark-600 md:text-xl">
                Seleccionamos los mejores dispositivos smart home y te acompañamos en cada paso: asesoría, instalación y soporte postventa premium.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                {!user ? (
                  <>
                    <Link to="/register" className="w-full sm:w-auto">
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full bg-dark-900 hover:bg-dark-800 focus:ring-dark-700"
                      >
                        Crear cuenta gratis
                      </Button>
                    </Link>
                    <Link to="/login" className="w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full border-dark-200 text-dark-800 hover:bg-dark-900 hover:text-white focus:ring-dark-400"
                      >
                        Ya tengo cuenta
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/profile" className="w-full sm:w-auto">
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full bg-dark-900 hover:bg-dark-800 focus:ring-dark-700"
                      >
                        Ir a mi panel
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto border-dark-200 text-dark-800 hover:bg-dark-900 hover:text-white focus:ring-dark-400"
                    >
                      Explorar novedades
                    </Button>
                  </>
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
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-dark-500">Colección destacada</p>
                  <h3 className="mt-2 text-2xl font-semibold text-dark-900">Smart Home Essentials</h3>
                </div>
                <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
                  Nuevo
                </span>
              </div>

              <div className="mt-8 space-y-4">
                {heroProducts.map((product) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between rounded-2xl border border-dark-100 bg-white/90 px-5 py-4 shadow-soft"
                  >
                    <div>
                      <p className="text-sm font-semibold text-dark-900">{product.name}</p>
                      <p className="text-xs text-dark-500">{product.subtitle}</p>
                    </div>
                    <span className="text-sm font-semibold text-dark-800">{product.price}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-4 rounded-2xl border border-dark-100 bg-dark-900/95 px-5 py-4 text-white shadow-soft">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6l3 6h6l-4.5 3.5L18 21l-6-3.5L6 21l1.5-5.5L3 12h6l3-6z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold">Clientes felices</p>
                  <p className="text-xs text-white/70">4.9/5 calificación promedio</p>
                </div>
                <span className="ml-auto text-2xl font-bold">12K+</span>
              </div>

              <div className="mt-6 flex gap-4 rounded-2xl border border-white/60 bg-white/90 p-5 shadow-soft backdrop-blur">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-primary-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-dark-900">Instalación guiada</p>
                  <p className="mt-1 text-xs text-dark-500">Especialistas disponibles en todo el país.</p>
                  <div className="mt-3 flex -space-x-2">
                    {['AR', 'MP', 'VS'].map((initials) => (
                      <span
                        key={initials}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-dark-900/90 text-[11px] font-semibold text-white shadow-soft"
                      >
                        {initials}
                      </span>
                    ))}
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
                <h2 className="text-3xl font-bold text-dark-900 md:text-4xl">Experiencia premium sin complicaciones</h2>
                <p className="mt-4 max-w-2xl text-dark-600">
                  Combinamos productos top con acompañamiento experto para que cada instalación sea impecable. Desde la planificación hasta el soporte postventa, cuidamos cada detalle.
                </p>
              </div>
              <Link to="/login" className="inline-flex">
                <Button variant="ghost" size="md" className="text-dark-700 hover:bg-dark-100">
                  Ver cómo funciona
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
                    <span>Descubrir más</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-dark-900 py-24 text-white">
          <div className="mx-auto grid max-w-7xl gap-16 px-6 sm:px-8 lg:grid-cols-[420px_1fr]">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">Un proceso pensado para ti</h2>
              <p className="mt-4 text-white/70">
                Evita complicaciones técnicas. Nuestro equipo acompaña cada fase para que disfrutes de una experiencia premium desde el primer día.
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
                  <h2 className="text-3xl font-bold md:text-4xl">¿Listo para transformar tu hogar inteligente?</h2>
                  <p className="mt-4 max-w-xl text-white/80">
                    Accede a lanzamientos exclusivos, asesoría personalizada y entregas rápidas en todo el país. Empieza gratis en menos de dos minutos.
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  {!user ? (
                    <>
                      <Link to="/register">
                        <Button
                          variant="primary"
                          size="lg"
                          className="bg-white text-dark-900 hover:bg-dark-100 focus:ring-white/40"
                        >
                          Crear cuenta gratis
                        </Button>
                      </Link>
                      <Link to="/login">
                        <Button
                          variant="outline"
                          size="lg"
                          className="border-white text-white hover:bg-white hover:text-dark-900 focus:ring-white/60"
                        >
                          Ya tengo cuenta
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Link to="/profile">
                      <Button
                        variant="primary"
                        size="lg"
                        className="bg-white text-dark-900 hover:bg-dark-100 focus:ring-white/40"
                      >
                        Ir a mi panel
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