import api from './api';

export const feedbackService = {
  submit: async (data) => {
    const res = await api.post('/feedback', data);
    return res.data;
  },
  getEventFeedback: async (eventId) => {
    const res = await api.get(`/feedback/event/${eventId}`);
    return res.data;
  },
  getMyFeedback: async () => {
    const res = await api.get('/feedback/my');
    return res.data;
  },
};