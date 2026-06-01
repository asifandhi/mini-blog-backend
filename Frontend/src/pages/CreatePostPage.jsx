import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createPost } from '../api/postApi.js';
import toast from 'react-hot-toast';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async ({ title, imageOfPost }) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('imageOfPost', imageOfPost[0]);

      await createPost(formData);
      toast.success('Post created!');
      navigate('/feed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors duration-150"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create new post</h1>
        <p className="text-gray-500 text-sm mt-1">Share something with the world</p>
      </div>

      <div className="card p-6 animate-slide-up">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="post-title" className="label text-base">Post Title</label>
            <input
              id="post-title"
              type="text"
              placeholder="Write a captivating title…"
              className={`input-field text-base ${errors.title ? 'border-red-400 focus:ring-red-400' : ''}`}
              {...register('title', {
                required: 'Title is required',
                minLength: { value: 3, message: 'Title must be at least 3 characters' },
              })}
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Image upload */}
          <div>
            <label className="label text-base">Post Image <span className="text-red-500">*</span></label>
            {preview ? (
              <div className="relative rounded-xl overflow-hidden mb-3 aspect-video bg-gray-100">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs transition-colors"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label
                htmlFor="imageOfPost"
                className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-all duration-200"
              >
                <div className="text-center p-6">
                  <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 text-sm font-medium">Click to upload image</p>
                  <p className="text-gray-400 text-xs mt-1">PNG, JPG, GIF, WEBP</p>
                </div>
              </label>
            )}
            <input
              id="imageOfPost"
              type="file"
              accept="image/*"
              className="hidden"
              {...register('imageOfPost', { required: 'Post image is required' })}
              onChange={(e) => {
                register('imageOfPost').onChange(e);
                handleImageChange(e);
              }}
            />
            {errors.imageOfPost && (
              <p className="mt-1.5 text-xs text-red-500">{errors.imageOfPost.message}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              id="create-post-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Publishing…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Publish post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
