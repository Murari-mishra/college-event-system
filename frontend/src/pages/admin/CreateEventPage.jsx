import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';

const CATEGORIES = ['Academic', 'Cultural', 'Sports', 'Technical', 'Workshop', 'Other'];

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', date: '', time: '',
    venue: '', category: 'Technical', maxParticipants: 100,
  });
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [loading, setLoading]         = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return setError('Image must be under 5MB.');
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      let imageUrl     = null;
      let imagePublicId = null;

      // Upload image first if selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await eventService.uploadImage(formData);
        imageUrl      = uploadRes.imageUrl;
        imagePublicId = uploadRes.publicId;
      }

      await eventService.create({ ...form, imageUrl, imagePublicId });
      setSuccess('Event created successfully! Redirecting...');
      setTimeout(() => navigate('/admin/events'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Link to="/admin/events" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-800 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to events
      </Link>

      <div className="page-header">
        <h1 className="page-title">Create New Event</h1>
        <p className="page-subtitle">Fill in the details to publish a new campus event.</p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error   && <div className="alert-error"><span></span>{error}</div>}
          {success && <div className="alert-success"><span></span>{success}</div>}

          {/* Image Upload */}
          <div className="form-group">
            <label className="label">Event Banner Image (optional)</label>
            <div
              className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-colors ${
                imagePreview ? 'border-brand-300' : 'border-surface-200 hover:border-brand-300'
              }`}
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-accent-rose hover:bg-white shadow-md transition-colors"
                  >
                    ✕
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                    Click ✕ to remove
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 cursor-pointer gap-3 p-6">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-2xl">
                    
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-surface-700">
                      Click to upload banner image
                    </p>
                    <p className="text-xs text-surface-400 mt-1">
                      JPG, PNG, WebP up to 5MB · Recommended: 1200×600px
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="label">Event Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Annual Tech Fest 2025"
              className="input text-base"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the event, activities, and what participants can expect..."
              rows={4}
              className="input resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Date *</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="input"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Time *</label>
              <input
                name="time"
                value={form.time}
                onChange={handleChange}
                placeholder="e.g. 10:00 AM"
                className="input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Venue *</label>
            <input
              name="venue"
              value={form.venue}
              onChange={handleChange}
              placeholder="e.g. Main Auditorium, Block A"
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="input">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Max Participants</label>
              <input
                type="number"
                name="maxParticipants"
                value={form.maxParticipants}
                onChange={handleChange}
                className="input"
                min="1"
                max="10000"
              />
            </div>
          </div>

          {/* Live Preview */}
          {form.title && (
            <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl">
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">
                Preview
              </p>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Banner preview"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}
              <p className="font-bold text-surface-900">{form.title}</p>
              {form.date && (
                <p className="text-sm text-surface-600 mt-1">
                  📅 {new Date(form.date).toLocaleDateString('en-IN', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              )}
              {form.venue && <p className="text-sm text-surface-600"> {form.venue}</p>}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Link to="/admin/events" className="btn-secondary flex-1 justify-center">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {imageFile ? 'Uploading & Creating...' : 'Creating...'}
                </span>
              ) : <><span></span> Publish Event</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};