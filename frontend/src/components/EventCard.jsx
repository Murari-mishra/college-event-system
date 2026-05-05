import { useState, useEffect } from 'react';

const categoryColors = {
  Technical:  { bg: 'bg-brand-50',   text: 'text-brand-700',   dot: 'bg-brand-500' },
  Cultural:   { bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-500' },
  Sports:     { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Academic:   { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  Workshop:   { bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-500' },
  Other:      { bg: 'bg-surface-100',text: 'text-surface-600', dot: 'bg-surface-400' },
};

const categoryIcons = {
  Technical: '', Cultural: '', Sports: '',
  Academic: '', Workshop: '', Other: '',
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ── Countdown Timer ────────────────────────────────────────────────────────
const CountdownTimer = ({ date }) => {
  const calcTimeLeft = () => {
    const diff = new Date(date) - new Date();
    if (diff <= 0) return null;
    return {
      days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [date]);

  if (!timeLeft) return null;

  if (timeLeft.days > 7) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-brand-600 font-semibold">
        <span>⏳</span>
        <span>{timeLeft.days} days away</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs font-bold">
      <span className="text-surface-500 font-medium mr-0.5">⏱️ </span>
      {timeLeft.days > 0 && (
        <>
          <span className="px-1.5 py-0.5 bg-brand-600 text-white rounded-md">{timeLeft.days}d</span>
          <span className="text-surface-300">:</span>
        </>
      )}
      <span className="px-1.5 py-0.5 bg-brand-600 text-white rounded-md">
        {String(timeLeft.hours).padStart(2, '0')}h
      </span>
      <span className="text-surface-300">:</span>
      <span className="px-1.5 py-0.5 bg-brand-600 text-white rounded-md">
        {String(timeLeft.minutes).padStart(2, '0')}m
      </span>
      <span className="text-surface-300">:</span>
      <span className="px-1.5 py-0.5 bg-accent-rose text-white rounded-md animate-pulse-slow">
        {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    </div>
  );
};

// ── Capacity Bar ───────────────────────────────────────────────────────────
const CapacityBar = ({ current, max }) => {
  if (!max) return null;
  const pct      = Math.min((current / max) * 100, 100);
  const isFull   = pct >= 100;
  const isAlmost = pct >= 80;

  const barColor  = isFull ? 'bg-accent-rose' : isAlmost ? 'bg-accent-amber' : 'bg-emerald-500';
  const textColor = isFull ? 'text-accent-rose' : isAlmost ? 'text-amber-600' : 'text-emerald-600';
  const label     = isFull ? ' Full' : isAlmost ? ' Almost full' : ' Available';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${textColor}`}>{label}</span>
        <span className="text-xs text-surface-500 font-medium">{current} / {max}</span>
      </div>
      <div className="w-full bg-surface-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!isFull && (
        <p className="text-xs text-surface-400">{max - current} spots remaining</p>
      )}
    </div>
  );
};

// ── Main EventCard ─────────────────────────────────────────────────────────
export const EventCard = ({ event, role, onRegister, onDelete, onEdit, onViewParticipants }) => {
  const [loading, setLoading] = useState(false);
  const cat    = categoryColors[event.category] || categoryColors.Other;
  const icon   = categoryIcons[event.category] || '📌';
  const isPast = new Date(event.date) < new Date();
  const participantCount = event.participantCount ?? 0;

  const handleRegister = async () => {
    setLoading(true);
    try { await onRegister(event._id); }
    finally { setLoading(false); }
  };

  return (
    <div className="card overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 animate-slide-up flex flex-col">

      {/* Banner image OR color strip */}
      {event.imageUrl ? (
        <div className="relative h-36 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          {/* Category badge over image */}
          <div className="absolute top-3 left-3">
            <span className={`badge ${cat.bg} ${cat.text} gap-1`}>
              <span>{icon}</span> {event.category || 'Other'}
            </span>
          </div>
          {/* Status badges over image */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            {isPast && (
              <span className="badge bg-black/50 text-white border-0">Concluded</span>
            )}
            {event.isRegistered && (
              <span className="badge badge-green">✓ Registered</span>
            )}
          </div>
        </div>
      ) : (
        // No image — show color strip
        <div className={`h-1.5 w-full ${cat.dot}`} />
      )}

      <div className="p-5 flex flex-col flex-1">

        {/* Category + Status — only when NO image */}
        {!event.imageUrl && (
          <div className="flex items-center justify-between mb-3">
            <span className={`badge ${cat.bg} ${cat.text} gap-1`}>
              <span>{icon}</span> {event.category || 'Other'}
            </span>
            <div className="flex items-center gap-1.5">
              {isPast && (
                <span className="badge bg-surface-100 text-surface-500">Concluded</span>
              )}
              {event.isRegistered && (
                <span className="badge badge-green">✓ Registered</span>
              )}
            </div>
          </div>
        )}

        {/* Title */}
        <h3 className="font-display font-bold text-surface-900 text-lg leading-snug mb-2 line-clamp-2">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-surface-500 leading-relaxed line-clamp-3 mb-4 flex-1">
          {event.description}
        </p>

        {/* Countdown Timer — upcoming events only */}
        {!isPast && (
          <div className="mb-3">
            <CountdownTimer date={event.date} />
          </div>
        )}

        {/* Meta info */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-surface-600">
            <span className="w-4 text-center"></span>
            <span className="font-medium">{formatDate(event.date)}</span>
            <span className="text-surface-300">·</span>
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-surface-600">
            <span className="w-4 text-center"></span>
            <span className="font-medium truncate">{event.venue}</span>
          </div>
        </div>

        {/* Capacity Bar — Admin */}
        {role === 'admin' && (
          <div className="mb-4">
            <CapacityBar
              current={participantCount}
              max={event.maxParticipants}
            />
          </div>
        )}

        {/* Capacity Bar — Student */}
        {role === 'student' && !isPast && event.maxParticipants && (
          <div className="mb-4">
            <CapacityBar
              current={event.participantCount ?? 0}
              max={event.maxParticipants}
            />
          </div>
        )}

        {/* Divider */}
        <div className="divider mb-4" />

        {/* Student Actions */}
        {role === 'student' && !event.isRegistered && !isPast && (
          <button
            onClick={handleRegister}
            disabled={loading || (event.participantCount >= event.maxParticipants)}
            className="btn-primary w-full justify-center"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Registering...
              </span>
            ) : event.participantCount >= event.maxParticipants ? (
              'Event Full'
            ) : (
              <><span></span> Register Now</>
            )}
          </button>
        )}

        {role === 'student' && event.isRegistered && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-emerald-600 font-semibold">
            <span></span> You're registered!
          </div>
        )}

        {/* Admin Actions */}
        {role === 'admin' && (
          <div className="flex gap-2">
            <button
              onClick={() => onViewParticipants(event._id)}
              className="btn-secondary flex-1 justify-center text-xs px-3 py-2"
            >
              👥 Participants
            </button>
            <button
              onClick={() => onEdit(event)}
              className="btn-secondary justify-center text-xs px-3 py-2"
            >
              
            </button>
            <button
              onClick={() => onDelete(event._id)}
              className="btn-danger justify-center text-xs px-3 py-2"
            >
            
            </button>
          </div>
        )}
      </div>
    </div>
  );
};