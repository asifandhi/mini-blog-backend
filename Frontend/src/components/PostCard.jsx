import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice.js';
import { toggleLike } from '../api/postApi.js';
import { useAuth } from '../hooks/useAuth.js';
import toast from 'react-hot-toast';


export default function PostCard({ post, onLikeUpdate }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const initiallyLiked = user
    ? post.likes?.some((id) => id === user._id || id?._id === user._id)
    : false;

  const [liked, setLiked] = useState(initiallyLiked);
  const [likeCount, setLikeCount] = useState(post.likes?.length ?? 0);
  const [liking, setLiking] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (liking) return;
    setLiking(true);

    // Optimistic update
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const res = await toggleLike(post._id);
      const data = res.data.data;
      setLiked(data.Likes);
      setLikeCount(data.likedCount);

      // Update user's likedPosts in Redux so other components stay in sync
      if (user) {
        const updatedLikedPosts = data.Likes
          ? [...(user.likedPosts || []), post._id]
          : (user.likedPosts || []).filter((id) => id !== post._id);
        dispatch(setCredentials({ user: { ...user, likedPosts: updatedLikedPosts } }));
      }

      if (onLikeUpdate) onLikeUpdate(post._id, data);
    } catch (err) {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      toast.error(err.response?.data?.message || 'Failed to toggle like');
    } finally {
      setLiking(false);
    }
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article
      className="card overflow-hidden cursor-pointer group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in"
      onClick={() => navigate(`/post/${post._id}`)}
    >
      {/* Post image */}
      <div className="relative overflow-hidden bg-gray-100 aspect-[16/9]">
        <img
          src={post.imageOfPost}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://placehold.co/600x340/e2e8f0/94a3b8?text=No+Image';
          }}
        />
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Owner */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {post.owner?.fullname?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800 leading-none">{post.owner?.fullname}</p>
            <p className="text-xs text-gray-400">@{post.owner?.username}</p>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-base font-semibold text-gray-900 line-clamp-2 mb-3 group-hover:text-primary-700 transition-colors duration-150">
          {post.title}
        </h2>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formattedDate}</span>
          <div className="flex items-center gap-3">
            {/* Like */}
            <button
              id={`like-btn-${post._id}`}
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-1 transition-colors duration-150 ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
              aria-label="Like post"
            >
              <svg className={`w-4 h-4 transition-transform duration-150 ${liking ? 'scale-75' : 'scale-100'}`} fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{likeCount}</span>
            </button>

            {/* Comment count */}
            <span className="flex items-center gap-1 text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments?.length ?? 0}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
