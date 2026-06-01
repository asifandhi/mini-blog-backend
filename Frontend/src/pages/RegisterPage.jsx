import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { registerUser, loginUser, getCurrentUser } from '../api/userApi.js';
import { setCredentials } from '../store/authSlice.js';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async ({ username, fullname, email, password, profilePhoto }) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('fullname', fullname);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('profilePhoto', profilePhoto[0]);

      await registerUser(formData);
      toast.success('Account created! Signing you in…');

      // Auto-login after registration
      const loginRes = await loginUser({ identifier: email, password });
      const data = loginRes.data.data;
      const accessToken = data.acesstoken || data.accesstoken;
      dispatch(setCredentials({ user: data.user, accessToken }));

      // Fetch full user profile
      try {
        const meRes = await getCurrentUser();
        dispatch(setCredentials({ user: meRes.data.data }));
      } catch { /* ignore */ }

      navigate('/feed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 px-4 py-8">
      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-200 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-1">Join MiniBlog and start sharing</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Profile Photo */}
            <div>
              <label className="label">Profile Photo <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <label
                  htmlFor="profilePhoto"
                  className="cursor-pointer btn-secondary text-sm py-2"
                >
                  {preview ? 'Change photo' : 'Upload photo'}
                </label>
                <input
                  id="profilePhoto"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  {...register('profilePhoto', { required: 'Profile photo is required' })}
                  onChange={(e) => {
                    register('profilePhoto').onChange(e);
                    handlePhotoChange(e);
                  }}
                />
              </div>
              {errors.profilePhoto && (
                <p className="mt-1.5 text-xs text-red-500">{errors.profilePhoto.message}</p>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullname" className="label">Full Name</label>
              <input
                id="fullname"
                type="text"
                placeholder="Jane Doe"
                className={`input-field ${errors.fullname ? 'border-red-400 focus:ring-red-400' : ''}`}
                {...register('fullname', {
                  required: 'Full name is required',
                  maxLength: { value: 20, message: 'Max 20 characters' },
                })}
              />
              {errors.fullname && <p className="mt-1.5 text-xs text-red-500">{errors.fullname.message}</p>}
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="label">Username</label>
              <input
                id="username"
                type="text"
                placeholder="janedoe"
                className={`input-field ${errors.username ? 'border-red-400 focus:ring-red-400' : ''}`}
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 4, message: 'Min 4 characters' },
                  pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers, underscores' },
                })}
              />
              {errors.username && <p className="mt-1.5 text-xs text-red-500">{errors.username.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                placeholder="jane@example.com"
                className={`input-field ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                })}
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="label">Password</label>
              <input
                id="reg-password"
                type="password"
                placeholder="Min 8 characters"
                className={`input-field ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Min 8 characters' },
                })}
              />
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-base flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
