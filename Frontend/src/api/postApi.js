import api from './axiosInstance.js';


export const createPost = (formData) =>
  api.post('/posts/createpost', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getAllPosts = () => api.get('/posts/getallposts');

export const getPostById = (postId) => api.get(`/posts/${postId}`);

export const deletePost = (postId) => api.delete(`/posts/${postId}`);


export const toggleLike = (postId) => api.post(`/posts/${postId}/like`);
