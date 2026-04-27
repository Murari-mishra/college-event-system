import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { registrationService } from '../../services/registrationService';
import { feedbackService } from '../../services/feedbackService';
import { Modal } from '../../components/Modal';
import api from '../../services/api';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

const categoryColors = {
  Technical: 'badge-blue', Cultural: 'badge-violet', Sports: 'badge-green',
  Academic: 'badge-amber', Workshop: 'badge-rose', Other: '',
};
const categoryIcons = {
  Technical: '💻', Cultural: '🎭', Sports: '⚽', Academic: '📚', Workshop: '🛠️', Other: '📌',
};

const StarRating = ({ value, onChange, readonly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => !readonly && onChange && onChange(star)}
        className={`text-2xl transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'} ${star <= value ? 'text-amber-400' : 'text-surface-200'}`}
      >★</button>
    ))}
  </div>
);

const FeedbackModal = ({ registration, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return setError('Please select a rating.');
    setLoading(true);
    try {
      await feedbackService.submit({ eventId: registration.eventId._id, rating, review });
      onSubmitted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="p-4 bg-brand-50 rounded-xl">
        <p className="font-bold text-surface-900">{registration.eventId?.title}</p>
        <p className="text-sm text-surface-500 mt-0.5">{formatDate(registration.eventId?.date)}</p>
      </div>

      {error && <div className="alert-error"><span>⚠️</span>{error}</div>}

      <div className="form-group">
        <label className="label">Your Rating *</label>
        <StarRating value={rating} onChange={setRating} />
        <p className="text-xs text-surface-400 mt-1">
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating] || 'Click to rate'}
        </p>
      </div>

      <div className="form-group">
        <label className="label">Your Review (optional)</label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={3}
          placeholder="Share your experience about this event..."
          className="input resize-none"
          maxLength={500}
        />
        <p className="text-xs text-surface-400 mt-1">{review.length}/500</p>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
          {loading ? 'Submitting...' : '⭐ Submit Feedback'}
        </button>
      </div>
    </form>
  );
};

const QRModal = ({ registrationId, onClose }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/registrations/${registrationId}/qr`)
      .then((res) => setQrData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [registrationId]);

  return (
    <div className="text-center space-y-4">
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : qrData ? (
        <>
          <div className="p-4 bg-surface-50 rounded-xl inline-block">
            <img src={qrData.qrCode} alt="QR Code" className="w-48 h-48 mx-auto" />
          </div>
          <div className="text-left p-4 bg-brand-50 rounded-xl space-y-1">
            <p className="font-bold text-surface-900">{qrData.registration.eventId?.title}</p>
            <p className="text-sm text-surface-600">
              📅 {new Date(qrData.registration.eventId?.date).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </p>
            <p className="text-sm text-surface-600">📍 {qrData.registration.eventId?.venue}</p>
          </div>
          <p className="text-xs text-surface-400">
            Show this QR code at the event entrance for check-in.
          </p>
          <a
            href={qrData.qrCode}
            download={`qr-ticket-${registrationId}.png`}
            className="btn-secondary w-full justify-center inline-flex"
          >
            ⬇️ Download QR Code
          </a>
        </>
      ) : (
        <p className="text-surface-400">Failed to load QR code.</p>
      )}
    </div>
  );
};

export const MyRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [myFeedbacks, setMyFeedbacks]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [cancellingId, setCancellingId]   = useState(null);
  const [feedbackReg, setFeedbackReg]     = useState(null);
  const [qrRegId, setQrRegId]             = useState(null);
  const [toast, setToast]                 = useState({ msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  const fetchData = async () => {
    try {
      const [regRes, fbRes] = await Promise.all([
        registrationService.getMyRegistrations(),
        feedbackService.getMyFeedback(),
      ]);
      setRegistrations(regRes.registrations || []);
      setMyFeedbacks(fbRes.feedbacks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const hasFeedback = (eventId) =>
    myFeedbacks.some(f => f.eventId?._id === eventId || f.eventId === eventId);

  const handleCancel = async (regId) => {
    if (!window.confirm('Cancel your registration for this event?')) return;
    setCancellingId(regId);
    try {
      await registrationService.cancel(regId);
      setRegistrations(prev => prev.filter(r => r._id !== regId));
      showToast('Registration cancelled successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel.', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const upcoming = registrations.filter(r => r.eventId && new Date(r.eventId.date) >= new Date());
  const past     = registrations.filter(r => r.eventId && new Date(r.eventId.date) < new Date());

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );

  const RegistrationCard = ({ reg, showCancel }) => {
    const event = reg.eventId;
    if (!event) return null;
    const isPast         = new Date(event.date) < new Date();
    const alreadyFeedback = hasFeedback(event._id);
    const catColor       = categoryColors[event.category] || '';
    const catIcon        = categoryIcons[event.category] || '📌';

    return (
      <div className="card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 animate-slide-up">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge ${catColor}`}>{catIcon} {event.category || 'Other'}</span>
              {isPast && <span className="badge bg-surface-100 text-surface-500">Concluded</span>}
            </div>
            <h3 className="font-display font-bold text-surface-900 text-lg leading-snug">{event.title}</h3>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-surface-600">
                <span className="w-4 text-center">📅</span>
                <span>{formatDate(event.date)}</span>
                <span className="text-surface-300">·</span>
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-surface-600">
                <span className="w-4 text-center">📍</span>
                <span>{event.venue}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className="badge badge-green">✓ Confirmed</span>
            <p className="text-xs text-surface-400">
              {new Date(reg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>

        <div className="divider mt-4 mb-3" />

        <div className="flex flex-wrap gap-2">
          {showCancel && (
            <button
              onClick={() => handleCancel(reg._id)}
              disabled={cancellingId === reg._id}
              className="btn-ghost text-accent-rose hover:bg-rose-50 text-sm px-3 py-1.5"
            >
              {cancellingId === reg._id ? 'Cancelling...' : '✕ Cancel'}
            </button>
          )}

          {/* QR Code button — show for all registrations */}
          <button
            onClick={() => setQrRegId(reg._id)}
            className="btn-secondary text-sm px-3 py-1.5"
          >
            📱 QR Code
          </button>

          {isPast && !alreadyFeedback && (
            <button
              onClick={() => setFeedbackReg(reg)}
              className="btn-secondary text-sm px-3 py-1.5"
            >
              ⭐ Leave Feedback
            </button>
          )}
          {isPast && alreadyFeedback && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 px-3 py-1.5">
              ✅ Feedback submitted
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast */}
      {toast.msg && (
        <div className={`fixed top-20 right-4 z-50 shadow-lg animate-slide-up px-4 py-3 rounded-xl text-sm font-medium ${
          toast.type === 'error' ? 'alert-error' : 'alert-success'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">My Registrations</h1>
          <p className="page-subtitle">{registrations.length} total · {upcoming.length} upcoming</p>
        </div>
        <Link to="/student/events" className="btn-primary whitespace-nowrap">🎯 Browse Events</Link>
      </div>

      {registrations.length === 0 ? (
        <div className="empty-state card py-20">
          <p className="empty-icon">🎟️</p>
          <p className="empty-title">No registrations yet</p>
          <p className="empty-desc">Browse events and register to get started!</p>
          <Link to="/student/events" className="btn-primary mt-6">Browse Campus Events</Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="section-title">Upcoming Events</h2>
                <span className="badge badge-blue">{upcoming.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcoming.map(reg => (
                  <RegistrationCard key={reg._id} reg={reg} showCancel={true} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="section-title text-surface-500">Past Events</h2>
                <span className="badge bg-surface-100 text-surface-500">{past.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-90">
                {past.map(reg => (
                  <RegistrationCard key={reg._id} reg={reg} showCancel={false} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Feedback Modal */}
      <Modal isOpen={!!feedbackReg} onClose={() => setFeedbackReg(null)} title="Rate this Event">
        {feedbackReg && (
          <FeedbackModal
            registration={feedbackReg}
            onClose={() => setFeedbackReg(null)}
            onSubmitted={() => {
              showToast('🎉 Feedback submitted! Thank you.');
              fetchData();
            }}
          />
        )}
      </Modal>

      {/* QR Code Modal */}
      <Modal isOpen={!!qrRegId} onClose={() => setQrRegId(null)} title="Your Event QR Ticket">
        {qrRegId && (
          <QRModal registrationId={qrRegId} onClose={() => setQrRegId(null)} />
        )}
      </Modal>
    </div>
  );
};