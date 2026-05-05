import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { registrationService } from '../../services/registrationService';
import { eventService } from '../../services/eventService';
import api from '../../services/api';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const ViewParticipantsPage = () => {
  const { eventId } = useParams();
  const [data, setData]           = useState(null);
  const [event, setEvent]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [exporting, setExporting] = useState(false);
  const [toast, setToast]         = useState({ msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regRes, evRes] = await Promise.all([
          registrationService.getEventParticipants(eventId),
          eventService.getOne(eventId),
        ]);
        setData(regRes);
        setEvent(evRes.event);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  const filtered = (data?.registrations || []).filter((r) =>
    r.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.userId?.rollNo?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get(`/registrations/event/${eventId}/export`, {
        responseType: 'blob',
      });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `participants-${event?.title?.replace(/\s+/g, '-') || eventId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('CSV exported successfully! 📥');
    } catch (err) {
      showToast('Export failed. Please try again.', 'error');
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  // Attendance summary counts
  const presentCount = (data?.registrations || []).filter(r => r.attendance === 'present').length;
  const absentCount  = (data?.registrations || []).filter(r => r.attendance !== 'present').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Toast */}
      {toast.msg && (
        <div className={`fixed top-20 right-4 z-50 shadow-lg animate-slide-up px-4 py-3 rounded-xl text-sm font-medium ${
          toast.type === 'error' ? 'alert-error' : 'alert-success'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Back */}
      <Link
        to="/admin/events"
        className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to events
      </Link>

      {/* Event header */}
      {event && (
        <div className="card p-6 bg-gradient-to-br from-brand-50 to-violet-50 border-brand-100">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="page-title text-2xl">{event.title}</h1>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-surface-600">
                <span>{formatDate(event.date)} · {event.time}</span>
                <span> {event.venue}</span>
                <span>👥 {data?.count || 0} / {event.maxParticipants} registered</span>
              </div>
            </div>

            {/* Capacity bar */}
            <div className="sm:w-48 flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-surface-500">Capacity</span>
                <span className="text-xs font-bold text-surface-700">
                  {Math.round(((data?.count || 0) / event.maxParticipants) * 100)}%
                </span>
              </div>
              <div className="w-full bg-surface-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(((data?.count || 0) / event.maxParticipants) * 100, 100)}%`,
                    backgroundColor:
                      ((data?.count || 0) / event.maxParticipants) > 0.8
                        ? '#f43f5e'
                        : ((data?.count || 0) / event.maxParticipants) > 0.5
                        ? '#f59e0b'
                        : '#10b981',
                  }}
                />
              </div>
              <p className="text-xs text-surface-400 mt-1">
                {event.maxParticipants - (data?.count || 0)} spots remaining
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Summary */}
      {(data?.count || 0) > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold font-display text-surface-900">{data?.count || 0}</p>
            <p className="text-xs text-surface-500 font-medium mt-0.5">Total Registered</p>
          </div>
          <div className="card p-4 text-center bg-emerald-50 border-emerald-100">
            <p className="text-2xl font-bold font-display text-emerald-700">{presentCount}</p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">✅ Present</p>
          </div>
          <div className="card p-4 text-center bg-rose-50 border-rose-100">
            <p className="text-2xl font-bold font-display text-rose-700">{absentCount}</p>
            <p className="text-xs text-rose-600 font-medium mt-0.5">⭕ Absent</p>
          </div>
        </div>
      )}

      {/* Search + Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search participants..."
            className="input pl-10"
          />
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm text-surface-500">
            <span className="font-semibold text-surface-800">{filtered.length}</span>{' '}
            participant{filtered.length !== 1 ? 's' : ''}
          </p>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={exporting || filtered.length === 0}
            className="btn-secondary whitespace-nowrap"
          >
            {exporting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-surface-300 border-t-surface-600 rounded-full animate-spin" />
                Exporting...
              </span>
            ) : (
              <>📥 Export CSV</>
            )}
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state card py-16">
          <p className="empty-icon">👤</p>
          <p className="empty-title">
            {search ? 'No results found' : 'No participants yet'}
          </p>
          <p className="empty-desc">
            {search
              ? 'Try a different search term.'
              : "Students haven't registered for this event yet."}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-50 border-b border-surface-100">
                <tr>
                  <th className="table-head rounded-tl-2xl">#</th>
                  <th className="table-head">Student</th>
                  <th className="table-head">Email</th>
                  <th className="table-head">Department</th>
                  <th className="table-head">Roll No.</th>
                  <th className="table-head">Registered On</th>
                  <th className="table-head">Attendance</th>
                  <th className="table-head rounded-tr-2xl">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((reg, i) => (
                  <tr key={reg._id} className="hover:bg-surface-50 transition-colors">
                    <td className="table-cell text-surface-400 font-mono text-xs w-12">
                      {i + 1}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {reg.userId?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="font-semibold text-surface-900">
                          {reg.userId?.name}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell text-surface-500">{reg.userId?.email}</td>
                    <td className="table-cell">
                      {reg.userId?.department || (
                        <span className="text-surface-300">—</span>
                      )}
                    </td>
                    <td className="table-cell font-mono text-xs">
                      {reg.userId?.rollNo || (
                        <span className="text-surface-300">—</span>
                      )}
                    </td>
                    <td className="table-cell text-surface-500">
                      {formatDate(reg.createdAt)}
                    </td>

                    {/* ✅ Attendance Column */}
                    <td className="table-cell">
                      {reg.attendance === 'present' ? (
                        <div className="space-y-0.5">
                          <span className="badge badge-green">✅ Present</span>
                          {reg.checkedInAt && (
                            <p className="text-xs text-surface-400 mt-1">
                              {new Date(reg.checkedInAt).toLocaleTimeString('en-IN', {
                                hour:   '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="badge bg-surface-100 text-surface-500">⭕ Absent</span>
                      )}
                    </td>

                    <td className="table-cell">
                      <span className={`badge ${
                        reg.status === 'confirmed' ? 'badge-green' :
                        reg.status === 'pending'   ? 'badge-amber' : 'badge-rose'
                      }`}>
                        {reg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-4 py-3 bg-surface-50 border-t border-surface-100 flex items-center justify-between">
            <p className="text-xs text-surface-500">
              Showing {filtered.length} of {data?.count || 0} participants
              {presentCount > 0 && (
                <span className="ml-2 text-emerald-600 font-semibold">
                  · {presentCount} checked in
                </span>
              )}
            </p>
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="text-xs text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1"
            >
               Export all to CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
};