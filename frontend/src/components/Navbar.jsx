import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';

const Logo = () => (
  <Link to="/" className="flex items-center gap-2.5 group">
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-brand group-hover:scale-105 transition-transform">
      <span className="text-white text-base font-bold font-display">E</span>
    </div>
    <div className="flex flex-col leading-none">
      <span className="font-display font-bold text-surface-900 text-lg tracking-tight">EduEvent</span>
      <span className="text-[10px] text-surface-400 font-medium tracking-widest uppercase">Campus Portal</span>
    </div>
  </Link>
);

const adminLinks = [
  { to: '/admin/dashboard',    label: 'Dashboard',     icon: '' },
  { to: '/admin/analytics',    label: 'Analytics',     icon: '' },
  { to: '/admin/events',       label: 'Manage Events', icon: '' },
  { to: '/admin/create-event', label: 'Create Event',  icon: '' },
  { to: '/admin/scanner',      label: 'QR Scanner',    icon: '' },
];

const studentLinks = [
  { to: '/student/dashboard',        label: 'Dashboard',        icon: '' },
  { to: '/student/events',           label: 'All Events',       icon: '' },
  { to: '/student/calendar',         label: 'Calendar',         icon: '' },
  { to: '/student/my-registrations', label: 'My Registrations', icon: '' },
];

const NotificationPanel = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleMarkRead = async (id) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleDelete = async (id) => {
    await notificationService.delete(id);
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="absolute right-0 mt-2 w-80 card shadow-xl animate-slide-up z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
        <div>
          <p className="font-bold text-surface-900 text-sm">Notifications</p>
          {unreadCount > 0 && (
            <p className="text-xs text-surface-400">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}
            className="text-xs text-brand-600 font-semibold hover:text-brand-700">
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-2xl mb-2"></p>
            <p className="text-sm text-surface-400 font-medium">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
              className={`flex items-start gap-3 px-4 py-3 border-b border-surface-50 cursor-pointer hover:bg-surface-50 transition-colors ${!n.isRead ? 'bg-brand-50/50' : ''}`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.isRead ? 'bg-brand-500' : 'bg-transparent'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${!n.isRead ? 'font-semibold text-surface-900' : 'text-surface-700'}`}>
                  {n.title}
                </p>
                <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-xs text-surface-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                className="text-surface-300 hover:text-rose-400 text-xs flex-shrink-0 mt-1"
              >✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const links = isAdmin ? adminLinks : studentLinks;

  // Fetch unread count periodically
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await notificationService.getAll();
        setUnreadCount(data.unreadCount || 0);
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close notification panel on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-brand-50 text-brand-700'
        : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-surface-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Logo />

          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClass}>
                <span className="text-base leading-none">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className={`hidden sm:inline-flex badge ${isAdmin ? 'badge-violet' : 'badge-blue'}`}>
              {isAdmin ? '👑 Admin' : '🎓 Student'}
            </span>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
                className="relative p-2 rounded-xl hover:bg-surface-100 transition-colors"
              >
                <svg className="w-5 h-5 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent-rose text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <NotificationPanel onClose={() => setNotifOpen(false)} />
              )}
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-surface-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-semibold text-surface-700 max-w-[120px] truncate">
                  {user?.name}
                </span>
                <svg className={`w-4 h-4 text-surface-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 card py-1 shadow-lg animate-slide-up z-50">
                  <div className="px-4 py-3 border-b border-surface-100">
                    <p className="text-sm font-semibold text-surface-800">{user?.name}</p>
                    <p className="text-xs text-surface-400 truncate">{user?.email}</p>
                    {user?.department && (
                      <p className="text-xs text-surface-400 mt-0.5">{user.department}</p>
                    )}
                  </div>
                  {!isAdmin && (
                    <Link to="/student/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors">
                      👤 My Profile
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-accent-rose hover:bg-rose-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden btn-ghost p-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-surface-100 bg-white animate-slide-up">
          <nav className="px-4 py-3 space-y-1">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to}
                onClick={() => setMobileOpen(false)} className={navLinkClass}>
                <span>{link.icon}</span>{link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};