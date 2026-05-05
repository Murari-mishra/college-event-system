import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../services/api';
import { eventService } from '../../services/eventService';

const AttendanceStats = ({ eventId }) => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get(`/registrations/event/${eventId}/checkin-stats`);
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) fetchStats();
  }, [eventId]);

  if (loading) return (
    <div className="flex justify-center py-6">
      <div className="w-6 h-6 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );

  if (!stats) return null;

  const pct = stats.stats.total > 0
    ? Math.round((stats.stats.present / stats.stats.total) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-surface-50 rounded-xl text-center">
          <p className="text-2xl font-bold font-display text-surface-900">{stats.stats.total}</p>
          <p className="text-xs text-surface-500 font-medium mt-0.5">Registered</p>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl text-center">
          <p className="text-2xl font-bold font-display text-emerald-700">{stats.stats.present}</p>
          <p className="text-xs text-emerald-600 font-medium mt-0.5">Present</p>
        </div>
        <div className="p-4 bg-rose-50 rounded-xl text-center">
          <p className="text-2xl font-bold font-display text-rose-700">{stats.stats.absent}</p>
          <p className="text-xs text-rose-600 font-medium mt-0.5">Absent</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-xs font-semibold text-surface-500">Attendance</span>
          <span className="text-xs font-bold text-surface-700">{pct}%</span>
        </div>
        <div className="w-full bg-surface-100 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Recent check-ins */}
      {stats.recentCheckins.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
            Recent Check-ins
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {stats.recentCheckins.map((r) => (
              <div key={r._id} className="flex items-center gap-3 p-2.5 bg-emerald-50 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {r.userId?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-surface-900 truncate">{r.userId?.name}</p>
                  <p className="text-xs text-surface-500 truncate">{r.userId?.rollNo || r.userId?.email}</p>
                </div>
                <span className="text-xs text-emerald-600 font-semibold flex-shrink-0">✓ In</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={fetchStats}
        className="btn-secondary w-full justify-center text-sm py-2"
      >
         Refresh Stats
      </button>
    </div>
  );
};

export const QRScannerPage = () => {
  const [events, setEvents]           = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [scanning, setScanning]       = useState(false);
  const [scanResult, setScanResult]   = useState(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [error, setError]             = useState('');
  const [toast, setToast]             = useState({ msg: '', type: '' });
  const scannerRef                    = useRef(null);
  const html5QrRef                    = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  // Fetch upcoming events for selector
  useEffect(() => {
    eventService.getAll()
      .then((res) => {
        const upcoming = (res.events || []).filter(
          (e) => new Date(e.date) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
        setEvents(upcoming);
        if (upcoming.length > 0) setSelectedEventId(upcoming[0]._id);
      })
      .catch(console.error);
  }, []);

  const startScanner = async () => {
    setError('');
    setScanResult(null);
    setScanning(true);

    try {
      const html5Qr = new Html5Qrcode('qr-reader');
      html5QrRef.current = html5Qr;

      await html5Qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // QR scanned successfully
          await html5Qr.stop();
          setScanning(false);

          try {
            const data = JSON.parse(decodedText);
            setScanResult(data);
          } catch {
            setError('Invalid QR code. Please scan a valid EduEvent ticket.');
          }
        },
        () => {} // ignore frequent scan errors
      );
    } catch (err) {
      setScanning(false);
      setError('Camera access denied or not available. Please allow camera permission.');
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); } catch {}
    }
    setScanning(false);
  };

  const handleCheckIn = async () => {
    if (!scanResult?.registrationId) return;
    setCheckInLoading(true);
    try {
      const res = await api.put(`/registrations/${scanResult.registrationId}/checkin`);
      if (res.data.alreadyCheckedIn) {
        showToast('⚠️ Student is already checked in!', 'warning');
      } else {
        showToast(`✅ ${scanResult.studentName} checked in successfully!`);
      }
      setScanResult(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Check-in failed.', 'error');
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleScanAgain = () => {
    setScanResult(null);
    setError('');
    startScanner();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast.msg && (
        <div className={`fixed top-20 right-4 z-50 shadow-lg animate-slide-up px-4 py-3 rounded-xl text-sm font-medium ${
          toast.type === 'error'   ? 'alert-error' :
          toast.type === 'warning' ? 'bg-amber-50 border border-amber-200 text-amber-700' :
          'alert-success'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-header mb-0">
        <h1 className="page-title">QR Code Scanner</h1>
        <p className="page-subtitle">Scan student QR tickets to mark attendance at the event.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left — Scanner */}
        <div className="space-y-4">

          {/* Event Selector */}
          <div className="card p-5">
            <label className="label">Select Event</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="input"
              disabled={scanning}
            >
              {events.length === 0 && (
                <option value="">No upcoming events</option>
              )}
              {events.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.title} — {new Date(e.date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short',
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Scanner Box */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Camera Scanner</h2>
              <span className={`badge ${scanning ? 'badge-green animate-pulse' : 'bg-surface-100 text-surface-500'}`}>
                {scanning ? '● Live' : '○ Idle'}
              </span>
            </div>

            {/* QR Reader container */}
            <div
              id="qr-reader"
              className={`w-full rounded-xl overflow-hidden bg-surface-900 ${
                scanning ? 'block' : 'hidden'
              }`}
              style={{ minHeight: '300px' }}
            />

            {/* Placeholder when not scanning */}
            {!scanning && !scanResult && (
              <div className="flex flex-col items-center justify-center py-12 bg-surface-50 rounded-xl border-2 border-dashed border-surface-200">
                <div className="text-5xl mb-3">📷</div>
                <p className="text-sm font-semibold text-surface-700">Camera is off</p>
                <p className="text-xs text-surface-400 mt-1">Click Start Scanner to begin</p>
              </div>
            )}

            {/* Scan Result */}
            {scanResult && !scanning && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  <p className="font-bold text-emerald-800">QR Code Scanned!</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-5 text-center">👤</span>
                    <span className="font-semibold text-surface-900">{scanResult.studentName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-surface-600">
                    <span className="w-5 text-center">📧</span>
                    <span>{scanResult.studentEmail}</span>
                  </div>
                  {scanResult.rollNo && (
                    <div className="flex items-center gap-2 text-sm text-surface-600">
                      <span className="w-5 text-center">🎓</span>
                      <span className="font-mono">{scanResult.rollNo}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-surface-600">
                    <span className="w-5 text-center">🎪</span>
                    <span>{scanResult.eventTitle}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-5 text-center">📋</span>
                    <span className={`badge ${
                      scanResult.status === 'confirmed' ? 'badge-green' : 'badge-rose'
                    }`}>
                      {scanResult.status}
                    </span>
                    {scanResult.attendance === 'present' && (
                      <span className="badge bg-amber-100 text-amber-700">Already checked in</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleScanAgain}
                    className="btn-secondary flex-1 justify-center text-sm py-2"
                  >
                    🔄 Scan Again
                  </button>
                  <button
                    onClick={handleCheckIn}
                    disabled={checkInLoading || scanResult.attendance === 'present'}
                    className="btn-primary flex-1 justify-center text-sm py-2"
                  >
                    {checkInLoading ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Checking in...
                      </span>
                    ) : scanResult.attendance === 'present' ? (
                      '✅ Already In'
                    ) : (
                      '✅ Mark Present'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="alert-error">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Control buttons */}
            <div className="flex gap-3">
              {!scanning ? (
                <button
                  onClick={startScanner}
                  disabled={!selectedEventId || !!scanResult}
                  className="btn-primary flex-1 justify-center"
                >
                  📷 Start Scanner
                </button>
              ) : (
                <button
                  onClick={stopScanner}
                  className="btn-danger flex-1 justify-center"
                >
                  ⏹ Stop Scanner
                </button>
              )}
            </div>

            <p className="text-xs text-surface-400 text-center">
              Point the camera at the student's QR ticket to scan
            </p>
          </div>
        </div>

        {/* Right — Attendance Stats */}
        <div className="card p-5 space-y-4">
          <h2 className="section-title">Attendance Stats</h2>
          {selectedEventId ? (
            <AttendanceStats key={selectedEventId} eventId={selectedEventId} />
          ) : (
            <div className="empty-state py-8">
              <p className="empty-icon">📊</p>
              <p className="empty-title">Select an event</p>
              <p className="empty-desc">Choose an event to see attendance stats.</p>
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="card p-6">
        <h2 className="section-title mb-4">How QR Check-in Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { step: '1', icon: '🎓', title: 'Student Registers', desc: 'Student registers for the event on the portal' },
            { step: '2', icon: '📱', title: 'Gets QR Ticket', desc: 'QR code generated in My Registrations page' },
            { step: '3', icon: '📷', title: 'Admin Scans', desc: 'Admin scans the QR code at event entrance' },
            { step: '4', icon: '✅', title: 'Marked Present', desc: 'Student attendance recorded in real-time' },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center text-center p-4 bg-surface-50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center mb-3">
                {s.step}
              </div>
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-sm font-bold text-surface-900">{s.title}</p>
              <p className="text-xs text-surface-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};