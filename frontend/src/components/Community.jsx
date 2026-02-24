import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Send,
  Image,
  X,
  MoreVertical,
  Trash2,
  Share2,
  Smile,
  Plus,
  RefreshCw,
  Users
} from "lucide-react";

const Community = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // New post state
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);
  const [newPostImagePreview, setNewPostImagePreview] = useState(null);
  const [posting, setPosting] = useState(false);

  // Comment state
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Menu state
  const [activeMenu, setActiveMenu] = useState(null);

  // Filter state
  const [activeFilter, setActiveFilter] = useState("all"); // "all" or "my"

  const fileInputRef = useRef(null);

  // Theme colors
  const theme = {
    primary: "#403abbff",
    primaryLight: "#2a2dcaff",
    secondary: "#4d40c2ff",
    success: "#10B981",
    danger: "#EF4444",
    warning: "#F59E0B",
    dark: "#1F2937",
    light: "#6B7280",
    bg: "white",
    cardBg: "white",
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token) {
      navigate("/");
      return;
    }

    if (user) {
      try {
        setCurrentUser(JSON.parse(user));
      } catch (e) {
        console.error("Error parsing user", e);
      }
    }

    fetchPosts();
  }, [navigate]);

  const fetchPosts = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/community/posts", {
        headers: { "x-auth-token": token },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
    setLoading(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result);
        setNewPostImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostText.trim()) {
      alert("Please write something for your post");
      return;
    }

    setPosting(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/community/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          description: newPostText,
          imageBase64: newPostImage,
        }),
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts([newPost, ...posts]);
        setNewPostText("");
        setNewPostImage(null);
        setNewPostImagePreview(null);
        setShowNewPost(false);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Something went wrong");
    }
    setPosting(false);
  };

  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:5000/api/community/posts/${postId}/like`, {
        method: "POST",
        headers: { "x-auth-token": token },
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map(p => p._id === postId ? updatedPost : p));
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:5000/api/community/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ text: commentText }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map(p => p._id === postId ? updatedPost : p));
        setCommentText("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
    setSubmittingComment(false);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:5000/api/community/posts/${postId}`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });

      if (response.ok) {
        setPosts(posts.filter(p => p._id !== postId));
      } else {
        const error = await response.json();
        alert(error.message || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
    setActiveMenu(null);
  };

  const handleDeleteComment = async (postId, commentId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:5000/api/community/posts/${postId}/comment/${commentId}`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map(p => p._id === postId ? updatedPost : p));
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const isLikedByUser = (post) => {
    return post.likes?.some(like => like.user === currentUser?.id);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "white",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: theme.dark }}>
          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite" }} />
          Loading community...
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "white",
    }}>
      {/* Header */}
      <header style={{
        background: "white",
        borderBottom: "1px solid #E5E7EB",
        padding: "16px 24px",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: theme.dark,
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Users size={20} color="white" />
              </div>
              <div>
                <h1 style={{ fontSize: "20px", fontWeight: 700, color: theme.dark, margin: 0 }}>Community</h1>
                <p style={{ fontSize: "12px", color: theme.light, margin: 0 }}>
                  {activeFilter === "my"
                    ? `${posts.filter(p => p.user === currentUser?.id).length} of your posts`
                    : `${posts.length} posts`
                  }
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchPosts}
            style={{
              padding: "10px",
              background: theme.bg,
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={18} color={theme.light} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "24px 16px" }}>
        {/* Filter Tabs */}
        <div style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          background: "white",
          padding: "6px",
          borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        }}>
          <button
            onClick={() => setActiveFilter("all")}
            style={{
              flex: 1,
              padding: "12px 20px",
              border: "none",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              background: activeFilter === "all"
                ? `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
                : "transparent",
              color: activeFilter === "all" ? "white" : theme.light,
              transition: "all 0.2s",
            }}
          >
            All Posts
          </button>
          <button
            onClick={() => setActiveFilter("my")}
            style={{
              flex: 1,
              padding: "12px 20px",
              border: "none",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              background: activeFilter === "my"
                ? `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
                : "transparent",
              color: activeFilter === "my" ? "white" : theme.light,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            My Posts
            {posts.filter(p => p.user === currentUser?.id).length > 0 && (
              <span style={{
                background: activeFilter === "my" ? "rgba(255,255,255,0.3)" : `${theme.primary}20`,
                color: activeFilter === "my" ? "white" : theme.primary,
                padding: "2px 8px",
                borderRadius: "10px",
                fontSize: "12px",
              }}>
                {posts.filter(p => p.user === currentUser?.id).length}
              </span>
            )}
          </button>
        </div>

        {/* Create Post Card */}
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "20px",
          marginBottom: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}>
          {!showNewPost ? (
            <div
              onClick={() => setShowNewPost(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
              }}
            >
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "18px",
                fontWeight: 700,
              }}>
                {currentUser?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div style={{
                flex: 1,
                padding: "14px 20px",
                background: theme.bg,
                borderRadius: "25px",
                color: theme.light,
                fontSize: "15px",
              }}>
                Share something with the community...
              </div>
              <button style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: `${theme.primary}15`,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Image size={20} color={theme.primary} />
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                <div style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "18px",
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {currentUser?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: theme.dark, margin: "0 0 2px" }}>
                    {currentUser?.name || "You"}
                  </p>
                  <p style={{ fontSize: "12px", color: theme.light, margin: 0 }}>Posting to Community</p>
                </div>
                <button
                  onClick={() => {
                    setShowNewPost(false);
                    setNewPostText("");
                    setNewPostImage(null);
                    setNewPostImagePreview(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: theme.light,
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <textarea
                placeholder="What's on your mind? Share safety tips, experiences, or support others..."
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "120px",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  fontSize: "16px",
                  lineHeight: 1.5,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />

              {newPostImagePreview && (
                <div style={{ position: "relative", marginTop: "12px" }}>
                  <img
                    src={newPostImagePreview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: "300px",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                  />
                  <button
                    onClick={() => {
                      setNewPostImage(null);
                      setNewPostImagePreview(null);
                    }}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.6)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={16} color="white" />
                  </button>
                </div>
              )}

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: "1px solid #E5E7EB",
              }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: "none" }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: "10px 16px",
                      background: theme.bg,
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: theme.primary,
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    <Image size={18} /> Photo
                  </button>
                </div>

                <button
                  onClick={handleCreatePost}
                  disabled={posting || !newPostText.trim()}
                  style={{
                    padding: "12px 28px",
                    background: newPostText.trim()
                      ? `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
                      : "#E5E7EB",
                    border: "none",
                    borderRadius: "25px",
                    color: newPostText.trim() ? "white" : theme.light,
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: newPostText.trim() ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {posting ? "Posting..." : <>Post <Send size={16} /></>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Posts Feed */}
        {(() => {
          const filteredPosts = activeFilter === "my"
            ? posts.filter(p => p.user === currentUser?.id)
            : posts;

          if (filteredPosts.length === 0) {
            return (
              <div style={{
                background: "white",
                borderRadius: "20px",
                padding: "60px 40px",
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}>
                <Users size={48} color={theme.light} style={{ marginBottom: "16px", opacity: 0.5 }} />
                <h3 style={{ fontSize: "18px", fontWeight: 600, color: theme.dark, margin: "0 0 8px" }}>
                  {activeFilter === "my" ? "You haven't posted yet" : "No posts yet"}
                </h3>
                <p style={{ fontSize: "14px", color: theme.light, margin: 0 }}>
                  {activeFilter === "my"
                    ? "Share your first post with the community!"
                    : "Be the first to share something with the community!"}
                </p>
              </div>
            );
          }

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {filteredPosts.map((post) => (
                <div
                  key={post._id}
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Post Header */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 20px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "18px",
                        fontWeight: 700,
                      }}>
                        {post.userName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p style={{ fontSize: "15px", fontWeight: 600, color: theme.dark, margin: 0 }}>
                          {post.userName}
                        </p>
                        <p style={{ fontSize: "12px", color: theme.light, margin: 0 }}>
                          {formatTimeAgo(post.createdAt)}
                        </p>
                      </div>
                    </div>

                    {post.user === currentUser?.id && (
                      <div style={{ position: "relative" }}>
                        <button
                          onClick={() => setActiveMenu(activeMenu === post._id ? null : post._id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "8px",
                            color: theme.light,
                          }}
                        >
                          <MoreVertical size={20} />
                        </button>
                        {activeMenu === post._id && (
                          <div style={{
                            position: "absolute",
                            right: 0,
                            top: "100%",
                            background: "white",
                            borderRadius: "12px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                            overflow: "hidden",
                            zIndex: 10,
                          }}>
                            <button
                              onClick={() => handleDeletePost(post._id)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "12px 20px",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: theme.danger,
                                fontSize: "14px",
                                fontWeight: 500,
                                width: "100%",
                              }}
                            >
                              <Trash2 size={16} /> Delete Post
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div style={{ padding: "0 20px 16px" }}>
                    <p style={{
                      fontSize: "15px",
                      lineHeight: 1.6,
                      color: theme.dark,
                      margin: 0,
                      whiteSpace: "pre-wrap",
                    }}>
                      {post.description}
                    </p>
                  </div>

                  {/* Post Image */}
                  {post.imageBase64 && (
                    <div style={{ padding: "0 20px 16px" }}>
                      <img
                        src={post.imageBase64}
                        alt="Post"
                        style={{
                          width: "100%",
                          borderRadius: "12px",
                          maxHeight: "500px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}

                  {/* Likes & Comments Count */}
                  {(post.likes?.length > 0 || post.comments?.length > 0) && (
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0 20px 12px",
                      fontSize: "13px",
                      color: theme.light,
                    }}>
                      <span>
                        {post.likes?.length > 0 && `${post.likes.length} like${post.likes.length !== 1 ? 's' : ''}`}
                      </span>
                      <span>
                        {post.comments?.length > 0 && `${post.comments.length} comment${post.comments.length !== 1 ? 's' : ''}`}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{
                    display: "flex",
                    borderTop: "1px solid #E5E7EB",
                    padding: "8px 20px",
                  }}>
                    <button
                      onClick={() => handleLike(post._id)}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "12px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: isLikedByUser(post) ? theme.danger : theme.light,
                        fontSize: "14px",
                        fontWeight: 500,
                        borderRadius: "8px",
                        transition: "background 0.2s",
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = theme.bg}
                      onMouseOut={(e) => e.currentTarget.style.background = "none"}
                    >
                      <Heart
                        size={20}
                        fill={isLikedByUser(post) ? theme.danger : "none"}
                      />
                      Like
                    </button>
                    <button
                      onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "12px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: theme.light,
                        fontSize: "14px",
                        fontWeight: 500,
                        borderRadius: "8px",
                        transition: "background 0.2s",
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = theme.bg}
                      onMouseOut={(e) => e.currentTarget.style.background = "none"}
                    >
                      <MessageCircle size={20} />
                      Comment
                    </button>
                  </div>

                  {/* Comments Section */}
                  {activeCommentPost === post._id && (
                    <div style={{
                      borderTop: "1px solid #E5E7EB",
                      padding: "16px 20px",
                      background: theme.bg,
                    }}>
                      {/* Existing Comments */}
                      {post.comments?.length > 0 && (
                        <div style={{ marginBottom: "16px" }}>
                          {post.comments.map((comment) => (
                            <div
                              key={comment._id}
                              style={{
                                display: "flex",
                                gap: "10px",
                                marginBottom: "12px",
                              }}
                            >
                              <div style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: `linear-gradient(135deg, ${theme.primaryLight} 0%, ${theme.primary} 100%)`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "12px",
                                fontWeight: 700,
                                flexShrink: 0,
                              }}>
                                {comment.userName?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  background: "white",
                                  borderRadius: "12px",
                                  padding: "10px 14px",
                                }}>
                                  <p style={{
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: theme.dark,
                                    margin: "0 0 4px",
                                  }}>
                                    {comment.userName}
                                  </p>
                                  <p style={{
                                    fontSize: "14px",
                                    color: theme.dark,
                                    margin: 0,
                                    lineHeight: 1.4,
                                  }}>
                                    {comment.text}
                                  </p>
                                </div>
                                <div style={{
                                  display: "flex",
                                  gap: "16px",
                                  marginTop: "4px",
                                  paddingLeft: "8px",
                                }}>
                                  <span style={{ fontSize: "11px", color: theme.light }}>
                                    {formatTimeAgo(comment.createdAt)}
                                  </span>
                                  {(comment.user === currentUser?.id || post.user === currentUser?.id) && (
                                    <button
                                      onClick={() => handleDeleteComment(post._id, comment._id)}
                                      style={{
                                        background: "none",
                                        border: "none",
                                        fontSize: "11px",
                                        color: theme.danger,
                                        cursor: "pointer",
                                        padding: 0,
                                      }}
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment Input */}
                      <div style={{ display: "flex", gap: "10px" }}>
                        <div style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "14px",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}>
                          {currentUser?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div style={{
                          flex: 1,
                          display: "flex",
                          background: "white",
                          borderRadius: "25px",
                          overflow: "hidden",
                          border: "1px solid #E5E7EB",
                        }}>
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && !submittingComment) {
                                handleAddComment(post._id);
                              }
                            }}
                            style={{
                              flex: 1,
                              border: "none",
                              outline: "none",
                              padding: "10px 16px",
                              fontSize: "14px",
                            }}
                          />
                          <button
                            onClick={() => handleAddComment(post._id)}
                            disabled={submittingComment || !commentText.trim()}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: commentText.trim() ? "pointer" : "not-allowed",
                              padding: "10px 16px",
                              color: commentText.trim() ? theme.primary : theme.light,
                            }}
                          >
                            <Send size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })()}
      </main>

      {/* Floating New Post Button (Mobile) */}
      <button
        onClick={() => setShowNewPost(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(139, 92, 246, 0.4)",
          zIndex: 50,
        }}
      >
        <Plus size={28} color="white" />
      </button>
    </div>
  );
};

export default Community;
