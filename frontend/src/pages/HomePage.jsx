import { Link } from 'react-router-dom';

const features = [
  { icon: '🎯', title: 'Discover Events', desc: 'Browse all upcoming campus events in one place — from tech fests to cultural nights.' },
  { icon: '🎟️', title: 'Instant Registration', desc: 'Register for events with one click. No paperwork, no queues.' },
  { icon: '👑', title: 'Admin Controls', desc: 'Admins can create, manage, and track participation across all events.' },
  { icon: '📊', title: 'Live Stats', desc: 'Real-time dashboards show registrations, attendance, and event insights.' },
];

export const HomePage = () => (
  <div className="min-h-screen bg-surface-50 bg-mesh-brand">
    {/* Navbar */}
    <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-brand">
          <span className="text-white font-bold font-display text-base">E</span>
        </div>
        <span className="font-display font-bold text-surface-900 text-lg">EduEvent</span>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/login" className="btn-ghost">Sign In</Link>
        <Link to="/register" className="btn-primary">Get Started</Link>
      </div>
    </header>

    {/* Hero */}
    <main className="max-w-5xl mx-auto px-6 pt-20 pb-32 text-center">
      <div className="animate-slide-up">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-100 mb-6">
          🎓 For Students & Admins
        </span>
        <h1 className="text-5xl sm:text-6xl font-bold font-display text-surface-900 leading-[1.1] mb-6">
          Your Campus,{' '}
          <span className="text-gradient">All In One Place</span>
        </h1>
        <p className="text-lg text-surface-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          EduEvent is the complete event management platform for colleges — discover events, register instantly, and manage everything from a single dashboard.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/register" className="btn-primary text-base px-7 py-3 shadow-brand">
            Get Started Free →
          </Link>
          <Link to="/login" className="btn-secondary text-base px-7 py-3">
            Sign In
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-24 text-left">
        {features.map((f, i) => (
          <div key={i} className="card p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
            style={{ animationDelay: `${i * 80}ms` }}>
            <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-xl mb-4">
              {f.icon}
            </div>
            <h3 className="font-display font-bold text-surface-900 mb-1">{f.title}</h3>
            <p className="text-sm text-surface-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>


    </main>
  </div>
);