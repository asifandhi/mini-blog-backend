import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useAuth } from '../hooks/useAuth.js';
import { updateAccountDetails, changePassword, updateProfilePhoto, deleteAccount } from '../api/userApi.js';
import { updateUser, logout as logoutAction } from '../store/authSlice.js';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'details', label: 'Details', icon: '👤' },
  { id: 'password', label: 'Password', icon: '🔒' },
  { id: 'photo', label: 'Photo', icon: '📷' },
  { id: 'danger', label: 'Delete account', icon: '⚠️' },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar tabs */}
        <nav className="sm:w-44 shrink-0">
          <ul className="space-y-1">
            {TABS.map((tab) => (
              <li key={tab.id}>
                <button
                  id={`settings-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Tab content */}
        <div className="flex-1">
          {activeTab === 'details' && <UpdateDetailsSection user={user} dispatch={dispatch} />}
          {activeTab === 'password' && <ChangePasswordSection />}
          {activeTab === 'photo' && <UpdatePhotoSection user={user} dispatch={dispatch} />}
          {activeTab === 'danger' && <DangerZoneSection dispatch={dispatch} navigate={navigate} />}
        </div>
      </div>
    </div>
  );
}

/* ── Update Details ──────────────────────────────────────── */
function UpdateDetailsSection({ user, dispatch }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { username: user?.username || '', fullname: user?.fullname || '', email: user?.email || '' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await updateAccountDetails(data);
      dispatch(updateUser(res.data.data));
      toast.success('Details updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 animate-slide-up">
      <h2 className="text-base font-bold text-gray-900 mb-5">Update Details</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="settings-fullname" className="label">Full Name</label>
          <input id="settings-fullname" type="text" className={`input-field ${errors.fullname ? 'border-red-400' : ''}`}
            {...register('fullname', { required: 'Required', maxLength: { value: 20, message: 'Max 20 chars' } })} />
          {errors.fullname && <p className="mt-1 text-xs text-red-500">{errors.fullname.message}</p>}
        </div>
        <div>
          <label htmlFor="settings-username" className="label">Username</label>
          <input id="settings-username" type="text" className={`input-field ${errors.username ? 'border-red-400' : ''}`}
            {...register('username', { required: 'Required', minLength: { value: 4, message: 'Min 4 chars' } })} />
          {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
        </div>
        <div>
          <label htmlFor="settings-email" className="label">Email</label>
          <input id="settings-email" type="email" className={`input-field ${errors.email ? 'border-red-400' : ''}`}
            {...register('email', { required: 'Required' })} />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <button type="submit" disabled={loading} id="update-details-btn"
          className="btn-primary flex items-center gap-2">
          {loading && <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
          Save changes
        </button>
      </form>
    </div>
  );
}

/* ── Change Password ─────────────────────────────────────── */
function ChangePasswordSection() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const onSubmit = async ({ oldPassword, newPassword }) => {
    setLoading(true);
    try {
      await changePassword({ oldPassword, newPassword });
      toast.success('Password changed!');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 animate-slide-up">
      <h2 className="text-base font-bold text-gray-900 mb-5">Change Password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="old-password" className="label">Current Password</label>
          <input id="old-password" type="password" placeholder="••••••••" className={`input-field ${errors.oldPassword ? 'border-red-400' : ''}`}
            {...register('oldPassword', { required: 'Current password is required' })} />
          {errors.oldPassword && <p className="mt-1 text-xs text-red-500">{errors.oldPassword.message}</p>}
        </div>
        <div>
          <label htmlFor="new-password" className="label">New Password</label>
          <input id="new-password" type="password" placeholder="Min 8 characters" className={`input-field ${errors.newPassword ? 'border-red-400' : ''}`}
            {...register('newPassword', { required: 'New password is required', minLength: { value: 8, message: 'Min 8 characters' } })} />
          {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>}
        </div>
        <div>
          <label htmlFor="confirm-new-password" className="label">Confirm New Password</label>
          <input id="confirm-new-password" type="password" placeholder="••••••••" className={`input-field ${errors.confirmNew ? 'border-red-400' : ''}`}
            {...register('confirmNew', {
              required: 'Please confirm your new password',
              validate: (v) => v === watch('newPassword') || 'Passwords do not match',
            })} />
          {errors.confirmNew && <p className="mt-1 text-xs text-red-500">{errors.confirmNew.message}</p>}
        </div>
        <button type="submit" disabled={loading} id="change-password-btn" className="btn-primary flex items-center gap-2">
          {loading && <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
          Change password
        </button>
      </form>
    </div>
  );
}

/* ── Update Profile Photo ────────────────────────────────── */
function UpdatePhotoSection({ user, dispatch }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a photo first');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);
      const res = await updateProfilePhoto(formData);
      dispatch(updateUser(res.data.data));
      toast.success('Profile photo updated!');
      setPreview(null);
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 animate-slide-up">
      <h2 className="text-base font-bold text-gray-900 mb-5">Profile Photo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-5">
          <img
            src={preview || user?.profilePhoto}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-4 border-primary-100 shadow-md"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullname || 'U')}&background=7c3aed&color=fff&size=80`;
            }}
          />
          <div>
            <label htmlFor="update-photo-input" className="btn-secondary cursor-pointer text-sm">
              Choose photo
            </label>
            <input
              id="update-photo-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {preview && <p className="text-xs text-primary-600 mt-1.5">New photo selected ✓</p>}
          </div>
        </div>
        <button type="submit" disabled={loading || !file} id="update-photo-btn" className="btn-primary flex items-center gap-2">
          {loading && <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
          Save photo
        </button>
      </form>
    </div>
  );
}

/* ── Danger Zone ─────────────────────────────────────────── */
function DangerZoneSection({ dispatch, navigate }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onDelete = async ({ password, confirmPassword }) => {
    setLoading(true);
    try {
      await deleteAccount({ password, confirmPassword });
      dispatch(logoutAction());
      toast.success('Account deleted. Goodbye!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 border border-red-100 animate-slide-up">
      <h2 className="text-base font-bold text-red-700 mb-2">Delete Account</h2>
      <p className="text-sm text-gray-500 mb-5">
        Once you delete your account, all your posts, comments, and data will be permanently removed. This action cannot be undone.
      </p>
      <button
        id="open-delete-account-modal-btn"
        onClick={() => setShowModal(true)}
        className="btn-danger text-sm"
      >
        Delete my account
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-slide-up">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Delete account?</h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              Enter your password to confirm permanent deletion of your account.
            </p>
            <form onSubmit={handleSubmit(onDelete)} className="space-y-3">
              <div>
                <label htmlFor="del-password" className="label">Password</label>
                <input id="del-password" type="password" placeholder="••••••••" className={`input-field ${errors.password ? 'border-red-400' : ''}`}
                  {...register('password', { required: 'Password is required' })} />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>
              <div>
                <label htmlFor="del-confirm-password" className="label">Confirm Password</label>
                <input id="del-confirm-password" type="password" placeholder="••••••••" className={`input-field ${errors.confirmPassword ? 'border-red-400' : ''}`}
                  {...register('confirmPassword', { required: 'Please confirm your password' })} />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); reset(); }}
                  className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  id="confirm-delete-account-btn"
                  type="submit"
                  disabled={loading}
                  className="btn-danger flex-1 flex items-center justify-center gap-2"
                >
                  {loading && <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                  Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
