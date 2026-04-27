import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
  'Business Administration', 'Mathematics', 'Physics', 'Chemistry', 'Other',
];

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', department: '', rollNo: '', adminKey: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = form;
      const data = await register(submitData);
      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh-brand bg-surface-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-brand mb-4">
            <span className="text-white text-2xl font-bold font-display">E</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-surface-900">Create account</h1>
          <p className="text-surface-500 mt-1 text-sm">Join the EduEvent college portal</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="alert-error">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Role selector */}
            <div className="form-group">
              <label className="label">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['student', 'admin'].map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      form.role === r
                        ? 'border-brand-400 bg-brand-50 text-brand-700'
                        : 'border-surface-200 hover:border-surface-300'
                    }`}
                  >
                    <input type="radio" name="role" value={r} checked={form.role === r} onChange={handleChange} className="sr-only" />
                    <span className="text-lg">{r === 'admin' ? '👑' : '🎓'}</span>
                    <span className="text-sm font-semibold capitalize">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Admin Secret Key — only shown when Admin is selected */}
            {form.role === 'admin' && (
              <div className="form-group">
                <label className="label">Admin Secret Key</label>
                <input
                  type="password"
                  name="adminKey"
                  value={form.adminKey}
                  onChange={handleChange}
                  placeholder="Enter admin authorization key"
                  className="input border-amber-300 focus:border-amber-400 focus:ring-amber-100"
                  required
                />
                <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                  🔐 This key is provided only to authorized administrators.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className="input" required />
              </div>
              <div className="form-group">
                <label className="label">Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@college.edu" className="input" required />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Department</label>
              <select name="department" value={form.department} onChange={handleChange} className="input">
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {form.role === 'student' && (
              <div className="form-group">
                <label className="label">Roll Number</label>
                <input name="rollNo" value={form.rollNo} onChange={handleChange} placeholder="e.g. CS2024001" className="input" />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" className="input" required />
              </div>
              <div className="form-group">
                <label className="label">Confirm Password</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" className="input" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account →'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-surface-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
};