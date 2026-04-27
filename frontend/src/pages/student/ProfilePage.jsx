import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
  'Business Administration', 'Mathematics', 'Physics', 'Chemistry', 'Other',
];

export const ProfilePage = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', department: '', rollNo: '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: '' });
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        rollNo: user.rollNo || '',
      });
    }
  }, [user]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', {
        name: form.name,
        department: form.department,
        rollNo: form.rollNo,
      });
      // Update localStorage
      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      showToast('Profile updated successfully! ✅');
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return showToast('New passwords do not match.', 'error');
    }
    if (passwords.newPassword.length < 6) {
      return showToast('Password must be at least 6 characters.', 'error');
    }
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed successfully! ✅');
    } catch (err) {
      showToast(err.response?.data?.message || 'Password change failed.', 'error');
    } finally {
      setPwLoading(false);
    }
  };

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Toast */}
      {toast.msg && (
        <div className={`fixed top-20 right-4 z-50 shadow-lg animate-slide-up px-4 py-3 rounded-xl text-sm font-medium ${
          toast.type === 'error' ? 'alert-error' : 'alert-success'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-header mb-0">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account information and password.</p>
      </div>

      {/* Profile Card */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-3xl font-bold font-display flex-shrink-0 shadow-brand">
          {avatarLetter}
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-surface-900">{user?.name}</h2>
          <p className="text-surface-500 text-sm">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="badge badge-blue">🎓 Student</span>
            {user?.department && (
              <span className="badge bg-surface-100 text-surface-600">{user.department}</span>
            )}
            {user?.rollNo && (
              <span className="badge bg-surface-100 text-surface-600 font-mono">{user.rollNo}</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-100 rounded-xl w-fit">
        {['profile', 'password'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
              activeTab === tab
                ? 'bg-white text-surface-900 shadow-card'
                : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            {tab === 'profile' ? '👤 Profile Info' : '🔒 Change Password'}
          </button>
        ))}
      </div>

      {/* Profile Info Tab */}
      {activeTab === 'profile' && (
        <div className="card p-8">
          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div className="form-group">
              <label className="label">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                required
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label className="label">Email Address</label>
              <input
                value={form.email}
                className="input bg-surface-50 text-surface-400 cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-surface-400 mt-1">Email cannot be changed.</p>
            </div>

            <div className="form-group">
              <label className="label">Department</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="input"
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">Roll Number</label>
              <input
                value={form.rollNo}
                onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                className="input"
                placeholder="e.g. CS2024001"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : '💾 Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <div className="card p-8">
          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div className="form-group">
              <label className="label">Current Password</label>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="input"
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">New Password</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="input"
                placeholder="Min. 6 characters"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="input"
                placeholder="Repeat new password"
                required
              />
            </div>

            <button type="submit" disabled={pwLoading} className="btn-primary w-full justify-center py-3">
              {pwLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Changing...
                </span>
              ) : '🔒 Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};