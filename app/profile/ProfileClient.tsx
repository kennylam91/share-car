"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Profile, Post, Route } from "@/types";
import { ROUTES, ROUTE_LABELS } from "@/lib/constants";

export default function ProfileClient() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile form state
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");

  // Post edit state
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostType, setEditPostType] = useState<"offer" | "request">(
    "offer",
  );
  const [editRoutes, setEditRoutes] = useState<Route[]>([]);
  const [editDetails, setEditDetails] = useState("");
  const [expandedPostIds, setExpandedPostIds] = useState<Set<string>>(
    new Set(),
  );

  const router = useRouter();

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  const togglePostExpansion = (postId: string) => {
    setExpandedPostIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
        setDisplayName(data.profile.display_name || data.profile.name || "");
        setPhone(data.profile.phone || "");
      } else {
        setError(data.error || "Failed to load profile");
      }
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch("/api/profile/posts");
      const data = await response.json();

      if (response.ok) {
        setUserPosts(data.posts);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          phone: phone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setEditPostType(post.post_type);
    setEditRoutes(post.routes);
    setEditDetails(post.details);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditPostType("offer");
    setEditRoutes([]);
    setEditDetails("");
  };

  const handleUpdatePost = async (postId: string) => {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_type: editPostType,
          routes: editRoutes,
          details: editDetails,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Post updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
        handleCancelEdit();
        fetchUserPosts();
      } else {
        setError(data.error || "Failed to update post");
      }
    } catch (err) {
      setError("Failed to update post");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess("Post deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
        fetchUserPosts();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete post");
      }
    } catch (err) {
      setError("Failed to delete post");
    }
  };

  const handleRouteToggle = (route: Route) => {
    setEditRoutes((prev) =>
      prev.includes(route) ? prev.filter((r) => r !== route) : [...prev, route],
    );
  };

  const handleLogout = async () => {
    await fetch("/auth/logout");
    router.push("/auth/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  router.push(
                    profile?.role === "driver" ? "/driver" : "/passenger",
                  )
                }
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Back
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* My Posts */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            My Posts
          </h2>

          {userPosts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              You haven't created any posts yet.
            </p>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  {editingPostId === post.id ? (
                    // Edit mode
                    <div className="space-y-4">
                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Post Type
                        </label>
                        <select
                          value={editPostType}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="offer">Offering a Ride</option>
                          <option value="request">Looking for a Ride</option>
                        </select>
                      </div> */}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Routes
                        </label>
                        <div className="space-y-2">
                          {ROUTES.map((route) => (
                            <label key={route} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={editRoutes.includes(route)}
                                onChange={() => handleRouteToggle(route)}
                                className="mr-2"
                              />
                              <span>{ROUTE_LABELS[route]}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Details
                        </label>
                        <textarea
                          value={editDetails}
                          onChange={(e) => setEditDetails(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={6}
                          placeholder="Add details about your ride..."
                          required
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdatePost(post.id)}
                          disabled={
                            editRoutes.length === 0 || !editDetails.trim()
                          }
                          className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                              post.post_type === "offer"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {post.post_type === "offer"
                              ? "Offering Ride"
                              : "Looking for Ride"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPost(post)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold text-gray-700">
                          Routes:{" "}
                        </span>
                        {post.routes
                          .map((route) => ROUTE_LABELS[route])
                          .join(", ")}
                      </div>
                      <p className="text-gray-600 mb-2 whitespace-pre-wrap">
                        {expandedPostIds.has(post.id) ||
                        post.details.length <= 150
                          ? post.details
                          : truncateText(post.details)}
                      </p>
                      {post.details.length > 150 && (
                        <button
                          onClick={() => togglePostExpansion(post.id)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-2"
                        >
                          {expandedPostIds.has(post.id)
                            ? "Show less"
                            : "Read more"}
                        </button>
                      )}
                      <p className="text-xs text-gray-400">
                        Posted: {new Date(post.created_at).toLocaleString()}
                      </p>
                      {post.created_at !== post.updated_at && (
                        <p className="text-xs text-gray-400">
                          Updated: {new Date(post.updated_at).toLocaleString()}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-md p-6 ">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Profile Information
          </h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your display name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <input
                type="text"
                value={profile?.role || ""}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed capitalize"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {saving ? "Saving..." : "Update Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
