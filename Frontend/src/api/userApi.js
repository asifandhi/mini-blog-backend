import api from './axiosInstance.js';

 
export const registerUser = (formData) =>
  api.post('/users/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

 
export const loginUser = ({ identifier, password }) => {
  const body = { password };
  // identifier can be email or username — send both keys
  if (identifier.includes('@')) {
    body.email = identifier;
  } else {
    body.username = identifier;
  }
  return api.post('/users/login', body);
};

export const logoutUser = () => api.post('/users/logout');

export const getCurrentUser = () => api.get('/users/getcurrentuser');

export const updateAccountDetails = (data) =>
  api.post('/users/updateaccount', data);

export const changePassword = (data) =>
  api.post('/users/changepassword', data);


export const updateProfilePhoto = (formData) =>
  api.post('/users/updatePphoto', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });


export const deleteAccount = (data) => api.delete('/users/delete', { data });
