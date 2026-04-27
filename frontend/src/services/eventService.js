import api from './api';

export const eventService = {
  getAll: async () => {
    const res = await api.get('/events');
    return res.data;
  },

  getOne: async (id) => {
    const res = await api.get(`/events/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/events', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/events/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },
  uploadImage: async (formData) => {
  const res = await api.post('/upload/event-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
},
};
