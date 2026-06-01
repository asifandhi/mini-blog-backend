import api from './axiosInstance.js';

export const addComment = (postId, comment) =>
  api.post(`/comments/${postId}`, { comment });

export const deleteComment = (commentId) =>
  api.delete(`/comments/${commentId}`);
