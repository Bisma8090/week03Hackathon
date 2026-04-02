import API from './axios';

export const getDashboard = () => API.get('/admin/dashboard');
export const getAllUsers = () => API.get('/admin/users');
export const blockUnblockUser = (id) => API.put(`/admin/users/${id}/block`);
export const changeUserRole = (id, role) => API.put(`/admin/users/${id}/role`, { role });