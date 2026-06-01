import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { getAllPosts } from '../api/postApi.js';
import PostCard from '../components/PostCard.jsx';
import Loader from '../components/Loader.jsx';

export default function ProfilePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPosts = async () => {
      setLoading(true);
      try {
        const res = await getAllPosts();
        const allPosts = res.data.data;
        // Filter posts where the owner is the current user
        const myPosts = allPosts.filter(
          (p) => p.owner?._id === user?._id || p.owner === user?._id
        );
        setPosts(myPosts);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchUserPosts();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile header */}
      <div className="card p-6 mb-8 animate-slide-up">
        <div className="flex items-center gap-6">
          <img
            src={user?.profilePhoto}
            alt={user?.fullname}
            className="w-20 h-20 rounded-full object-cover border-4 border-primary-100 shadow-md"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullname || 'U')}&background=7c3aed&color=fff&size=80`;
            }}
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{user?.fullname}</h1>
            <p className="text-gray-500 text-sm">@{user?.username}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-sm font-semibold text-gray-700">
                {posts.length} <span className="font-normal text-gray-500">{posts.length === 1 ? 'post' : 'posts'}</span>
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {user?.likedPosts?.length ?? 0} <span className="font-normal text-gray-500">liked</span>
              </span>
            </div>
          </div>
          <Link to="/settings" className="btn-secondary text-sm flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Edit profile
          </Link>
        </div>
      </div>

      {/* Posts */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">My Posts</h2>

      {loading && <Loader />}

      {!loading && posts.length === 0 && (
        <div className="card p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">No posts yet</h3>
          <p className="text-sm text-gray-500 mb-6">Create your first post and share it with the world!</p>
          <Link to="/create-post" className="btn-primary">Create post</Link>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
