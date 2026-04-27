import api from './api';

export const registrationService = {
  register: async (eventId) => {
    const res = await api.post('/registrations', { eventId });
    return res.data;
  },

  cancel: async (id) => {
    const res = await api.delete(`/registrations/${id}`);
    return res.data;
  },

  getMyRegistrations: async () => {
    const res = await api.get('/registrations/my');
    return res.data;
  },

  getEventParticipants: async (eventId) => {
    const res = await api.get(`/registrations/event/${eventId}`);
    return res.data;
  },

  getAll: async () => {
    const res = await api.get('/registrations/all');
    return res.data;
  },
};
