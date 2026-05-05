import { useState, useEffect, useRef } from 'react';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
);

const CHART_COLORS = ['#3b6ef5','#8b5cf6','#10b981','#f59e0b','#f43f5e','#06b6d4'];

export const AnalyticsDashboard = () => {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([eventService.getAll(), registrationService.getAll()])
      .then(([evRes, regRes]) => {
        setEvents(evRes.events || []);
        setRegistrations(regRes.registrations || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );

  // ── Registrations per event (top 6) ──────────────────────────────
  const regPerEvent = events
    .map(e => ({
      name: e.title.length > 20 ? e.title.slice(0, 20) + '…' : e.title,
      count: registrations.filter(r => r.eventId?._id === e._id || r.eventId === e._id).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const barData = {
    labels: regPerEvent.map(e => e.name),
    datasets: [{
      label: 'Registrations',
      data: regPerEvent.map(e => e.count),
      backgroundColor: CHART_COLORS,
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  // ── Category distribution ─────────────────────────────────────────
  const categoryCount = {};
  events.forEach(e => {
    categoryCount[e.category || 'Other'] = (categoryCount[e.category || 'Other'] || 0) + 1;
  });

  const doughnutData = {
    labels: Object.keys(categoryCount),
    datasets: [{
      data: Object.values(categoryCount),
      backgroundColor: CHART_COLORS,
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  // ── Department-wise registrations ─────────────────────────────────
  const deptCount = {};
  registrations.forEach(r => {
    const dept = r.userId?.department || 'Unknown';
    deptCount[dept] = (deptCount[dept] || 0) + 1;
  });

  const deptBar = {
    labels: Object.keys(deptCount),
    datasets: [{
      label: 'Students',
      data: Object.values(deptCount),
      backgroundColor: '#3b6ef5',
      borderRadius: 6,
    }],
  };

  // ── Registrations over time (last 7 days) ─────────────────────────
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const lineData = {
    labels: last7.map(d => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
    datasets: [{
      label: 'Registrations',
      data: last7.map(day =>
        registrations.filter(r => {
          const rd = new Date(r.createdAt);
          return rd.toDateString() === day.toDateString();
        }).length
      ),
      borderColor: '#3b6ef5',
      backgroundColor: 'rgba(59,110,245,0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#3b6ef5',
      pointRadius: 5,
    }],
  };

  const chartOpts = (title) => ({
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { backgroundColor: '#0f172a', titleColor: '#e2e8f0', bodyColor: '#94a3b8', padding: 10, cornerRadius: 8 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 11 } }, beginAtZero: true },
    },
  });

  const doughnutOpts = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#475569', padding: 16, font: { size: 11 } } },
      tooltip: { backgroundColor: '#0f172a', titleColor: '#e2e8f0', bodyColor: '#94a3b8', padding: 10, cornerRadius: 8 },
    },
    cutout: '65%',
  };

  const totalRegs = registrations.length;
  const activeEvents = events.filter(e => new Date(e.date) >= new Date()).length;
  const departments = Object.keys(deptCount).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Analytics Dashboard</h1>
        <p className="page-subtitle">Overview of event registrations and participation trends.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: events.length, icon: '', color: 'bg-brand-50' },
          { label: 'Total Registrations', value: totalRegs, icon: '', color: 'bg-violet-50' },
          { label: 'Active Events', value: activeEvents, icon: '', color: 'bg-amber-50' },
          { label: 'Departments', value: departments, icon: '', color: 'bg-emerald-50' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">{s.label}</p>
              <p className="text-3xl font-bold font-display text-surface-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="section-title mb-4">Top Events by Registrations</h2>
          {regPerEvent.length === 0
            ? <p className="text-surface-400 text-sm">No registration data yet.</p>
            : <Bar data={barData} options={chartOpts()} height={180} />}
        </div>
        <div className="card p-6">
          <h2 className="section-title mb-4">Events by Category</h2>
          {Object.keys(categoryCount).length === 0
            ? <p className="text-surface-400 text-sm">No events yet.</p>
            : <Doughnut data={doughnutData} options={doughnutOpts} />}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="section-title mb-4">Registrations (Last 7 Days)</h2>
          <Line data={lineData} options={chartOpts()} height={160} />
        </div>
        <div className="card p-6">
          <h2 className="section-title mb-4">Department-wise Participation</h2>
          {Object.keys(deptCount).length === 0
            ? <p className="text-surface-400 text-sm">No department data yet.</p>
            : <Bar data={deptBar} options={{...chartOpts(), indexAxis: 'y'}} height={160} />}
        </div>
      </div>
    </div>
  );
};