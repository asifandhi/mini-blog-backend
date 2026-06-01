import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { loginUser, getCurrentUser } from '../api/userApi.js';
import { setCredentials } from '../store/authSlice.js';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ identifier, password }) => {
    setLoading(true);
    try {
      const loginRes = await loginUser({ identifier, password });
      const data = loginRes.data.data;

      // Backend has typo: "acesstoken" (one 's')
      const accessToken = data.acesstoken || data.accesstoken;

      // Immediately store the token so subsequent request can use it
      dispatch(setCredentials({ user: data.user, accessToken }));

      // Fetch full user profile (includes likedPosts)
      try {
        const meRes = await getCurrentUser();
        dispatch(setCredentials({ user: meRes.data.data }));
      } catch {
        // If this fails, we still have the basic user from login
      }

      toast.success(`Welcome back, ${data.user.fullname}!`);
      navigate('/feed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-200 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your MiniBlog account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Identifier */}
            <div>
              <label htmlFor="identifier" className="label">Email or Username</label>
              <input
                id="identifier"
                type="text"
                placeholder="you@example.com or @username"
                className={`input-field ${errors.identifier ? 'border-red-400 focus:ring-red-400' : ''}`}
                {...register('identifier', {
                  required: 'Email or username is required',
                  minLength: { value: 3, message: 'Minimum 3 characters' },
                })}
              />
              {errors.identifier && (
                <p className="mt-1.5 text-xs text-red-500">{errors.identifier.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`input-field ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                })}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
