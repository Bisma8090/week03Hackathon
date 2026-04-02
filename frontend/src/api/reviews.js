import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost';

const REVIEWS_BASE = isLocalhost
  ? 'http://localhost:3001/api'
  : 'https://your-reviews-service.vercel.app/api'; // update on deploy

const ReviewsAPI = axios.create({ baseURL: REVIEWS_BASE });

ReviewsAPI.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getProductReviews = (productId) =>
  ReviewsAPI.get(`/reviews/product/${productId}`);

export const getProductReviewsAdmin = (productId) =>
  ReviewsAPI.get(`/reviews/admin/product/${productId}`);

export const getAllReviewsAdmin = () =>
  ReviewsAPI.get(`/reviews/admin/all`);

export const addReview = (data) => ReviewsAPI.post('/reviews', data);

export const addReply = (reviewId, data) =>
  ReviewsAPI.post(`/reviews/${reviewId}/reply`, data);

export const deleteReply = (reviewId, replyId) =>
  ReviewsAPI.delete(`/reviews/${reviewId}/reply/${replyId}`);

export const toggleLike = (reviewId) =>
  ReviewsAPI.patch(`/reviews/${reviewId}/like`);

export const flagReview = (reviewId) =>
  ReviewsAPI.patch(`/reviews/${reviewId}/flag`);

export const deleteReview = (reviewId) =>
  ReviewsAPI.delete(`/reviews/${reviewId}`);
