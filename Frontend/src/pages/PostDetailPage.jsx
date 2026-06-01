import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostById, deletePost, toggleLike } from '../api/postApi.js';
import { addComment, deleteComment } from '../api/commentApi.js';
import { useAuth } from '../hooks/useAuth.js';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice.js';
import Loader from '../components/Loader.jsx';
import toast from 'react-hot-toast';

export default function PostDetailPage() {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingComment, setDeletingComment] = useState(null);
  const [deletingPost, setDeletingPost] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const MAX_COMMENT = 450;

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await getPostById(postId);
      const data = res.data.data;
      setPost(data);
      setLikeCount(data.likes?.length ?? 0);
      const isLiked = user
        ? data.likes?.some((id) => id === user._id || id?._id === user._id)
        : false;
      setLiked(isLiked);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load post');
      navigate('/feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPost(); }, [postId]);

  // Like toggle
  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    try {
      const res = await toggleLike(postId);
      const data = res.data.data;
      setLiked(data.Likes);
      setLikeCount(data.likedCount);
      if (user) {
        const updatedLikedPosts = data.Likes
          ? [...(user.likedPosts || []), postId]
          : (user.likedPosts || []).filter((id) => id !== postId);
        dispatch(setCredentials({ user: { ...user, likedPosts: updatedLikedPosts } }));
      }
    } catch (err) {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      toast.error(err.response?.data?.message || 'Failed to toggle like');
    } finally {
      setLiking(false);
    }
  };

  // Add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const res = await addComment(postId, comment.trim());
      const newComment = res.data.data;
      // Populate commenter from current user
      newComment.commenter = { _id: user._id, username: user.username, fullname: user.fullname };
      setPost((prev) => ({ ...prev, comments: [...(prev.comments || []), newComment] }));
      setComment('');
      toast.success('Comment added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    setDeletingComment(commentId);
    try {
      await deleteComment(commentId);
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c._id !== commentId),
      }));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    } finally {
      setDeletingComment(null);
    }
  };

  // Delete post
  const handleDeletePost = async () => {
    setDeletingPost(true);
    try {
      await deletePost(postId);
      toast.success('Post deleted');
      navigate('/feed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete post');
      setDeletingPost(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!post) return null;

  const isOwner = user && (post.owner?._id === user._id || post.owner === user._id);
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors duration-150"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>

      {/* Post card */}
      <article className="card overflow-hidden mb-6">
        <img
          src={post.imageOfPost}
          alt={post.title}
          className="w-full object-cover max-h-96"
          onError={(e) => { e.target.src = 'https://placehold.co/800x400/e2e8f0/94a3b8?text=No+Image'; }}
        />
        <div className="p-6">
          {/* Owner */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                {post.owner?.fullname?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{post.owner?.fullname}</p>
                <p className="text-sm text-gray-400">@{post.owner?.username} · {formattedDate}</p>
              </div>
            </div>
            {isOwner && (
              <button
                id="delete-post-btn"
                onClick={() => setShowDeleteModal(true)}
                className="btn-danger text-sm px-3 py-1.5 flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete post
              </button>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

          {/* Like bar */}
          <div className="flex items-center gap-4 py-4 border-t border-b border-gray-100">
            <button
              id="post-like-btn"
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 font-medium text-sm ${
                liked
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500'
              }`}
            >
              <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {liked ? 'Liked' : 'Like'} · {likeCount}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {post.comments?.length ?? 0} comments
            </span>
          </div>
        </div>
      </article>

      {/* Comments section */}
      <section className="card p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Comments ({post.comments?.length ?? 0})</h2>

        {/* Add comment form */}
        <form onSubmit={handleAddComment} className="mb-6">
          <div className="relative">
            <textarea
              id="comment-input"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={MAX_COMMENT}
              rows={3}
              placeholder="Write a comment…"
              className="input-field resize-none pr-16"
            />
            <span className={`absolute bottom-3 right-3 text-xs font-mono ${comment.length >= MAX_COMMENT ? 'text-red-500' : 'text-gray-400'}`}>
              {comment.length}/{MAX_COMMENT}
            </span>
          </div>
          <div className="flex justify-end mt-2">
            <button
              id="submit-comment-btn"
              type="submit"
              disabled={submittingComment || !comment.trim()}
              className="btn-primary text-sm px-5 py-2 flex items-center gap-2"
            >
              {submittingComment ? (
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : null}
              Post comment
            </button>
          </div>
        </form>

        {/* Comments list */}
        {post.comments?.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-6">No comments yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {post.comments.map((c) => {
              const isMyComment = user && (c.commenter?._id === user._id || c.commenter === user._id);
              const commenterDate = new Date(c.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric',
              });
              return (
                <div key={c._id} className="flex gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {c.commenter?.fullname?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-sm font-semibold text-gray-800">{c.commenter?.fullname}</span>
                        <span className="text-xs text-gray-400 ml-2">@{c.commenter?.username} · {commenterDate}</span>
                      </div>
                      {isMyComment && (
                        <button
                          onClick={() => handleDeleteComment(c._id)}
                          disabled={deletingComment === c._id}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 ml-2"
                          aria-label="Delete comment"
                        >
                          {deletingComment === c._id ? (
                            <div className="h-3 w-3 rounded-full border border-red-400 border-t-transparent animate-spin" />
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.comment}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Delete post confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-slide-up">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Delete post?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This will permanently delete your post and all its comments. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-post-btn"
                onClick={handleDeletePost}
                disabled={deletingPost}
                className="btn-danger flex-1 flex items-center justify-center gap-2"
              >
                {deletingPost ? (
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
