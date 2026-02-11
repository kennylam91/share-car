"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Profile, Post, Route } from "@/types";
import { ROUTES, ROUTE_LABELS } from "@/lib/constants";

export default function ProfileClient() {
  const LABEL = {
    loading: "Đang tải...",
    profile: "Hồ Sơ",
    back: "Quay Lại",
    log_out: "Đăng Xuất",
    error: "Có lỗi: ",
    success_update_profile: "Cập nhật hồ sơ thành công!",
    success_update_post: "Cập nhật bài đăng thành công!",
    success_delete_post: "Xóa bài đăng thành công!",
    error_load_profile: "Không thể tải hồ sơ",
    error_update_profile: "Không thể cập nhật hồ sơ",
    error_update_post: "Không thể cập nhật bài đăng",
    error_delete_post: "Không thể xóa bài đăng",
    my_posts: "Bài Đăng Của Tôi",
    no_posts: "Bạn chưa tạo bài đăng nào.",
    profile_info: "Thông Tin Hồ Sơ",
    email: "Email",
    email_note: "Không thể thay đổi email",
    display_name: "Tên Hiển Thị",
    display_name_placeholder: "Nhập tên hiển thị của bạn",
    phone: "Số Điện Thoại",
    phone_placeholder: "Nhập số điện thoại của bạn",
    facebook: "Facebook URL",
    facebook_placeholder: "https://facebook.com/your-profile",
    zalo: "Zalo URL",
    zalo_placeholder: "https://zalo.me/your-id",
    role: "Vai Trò",
    update_profile: "Cập Nhật Hồ Sơ",
    saving: "Đang lưu...",
    select_route: "Tuyến Đường",
    details: "Chi Tiết",
    details_placeholder: "Thêm chi tiết về chuyến đi của bạn...",
    save_changes: "Lưu Thay Đổi",
    cancel: "Hủy",
    post_offer: "Tìm khách",
    post_request: "Tìm xe",
    edit: "Sửa",
    delete: "Xóa",
    read_more: "Xem thêm",
    collapse: "Thu gọn",
    posted_at: "Đăng lúc:",
    updated: "Cập nhật:",
    confirm_delete: "Bạn có chắc muốn xóa bài đăng này không?",
  };
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile form state
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [zaloUrl, setZaloUrl] = useState("");

  // Post edit state
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostType, setEditPostType] = useState<"offer" | "request">(
    "offer",
  );
  const [editRoutes, setEditRoutes] = useState<Route[]>([]);
  const [editDetails, setEditDetails] = useState("");
  const [editContactPhone, setEditContactPhone] = useState("");
  const [editContactFacebook, setEditContactFacebook] = useState("");
  const [editContactZalo, setEditContactZalo] = useState("");
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
        setFacebookUrl(data.profile.facebook_url || "");
        setZaloUrl(data.profile.zalo_url || "");
      } else {
        setError(data.error || LABEL.error_load_profile);
      }
    } catch (err) {
      setError(LABEL.error_load_profile);
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
          facebook_url: facebookUrl,
          zalo_url: zaloUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
        setSuccess(LABEL.success_update_profile);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || LABEL.error_update_profile);
      }
    } catch (err) {
      setError(LABEL.error_update_profile);
    } finally {
      setSaving(false);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setEditPostType(post.post_type);
    setEditRoutes(post.routes);
    setEditDetails(post.details);
    setEditContactPhone(post.contact_phone || "");
    setEditContactFacebook(post.contact_facebook_url || "");
    setEditContactZalo(post.contact_zalo_url || "");
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditPostType("offer");
    setEditRoutes([]);
    setEditDetails("");
    setEditContactPhone("");
    setEditContactFacebook("");
    setEditContactZalo("");
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
          contact_phone: editContactPhone,
          contact_facebook_url: editContactFacebook,
          contact_zalo_url: editContactZalo,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(LABEL.success_update_post);
        setTimeout(() => setSuccess(""), 3000);
        handleCancelEdit();
        fetchUserPosts();
      } else {
        setError(data.error || LABEL.error_update_post);
      }
    } catch (err) {
      setError(LABEL.error_update_post);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm(LABEL.confirm_delete)) {
      // You may want to localize this confirm as well
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess(LABEL.success_delete_post);
        setTimeout(() => setSuccess(""), 3000);
        fetchUserPosts();
      } else {
        const data = await response.json();
        setError(data.error || LABEL.error_delete_post);
      }
    } catch (err) {
      setError(LABEL.error_delete_post);
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
        <div className="text-lg">{LABEL.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              {LABEL.profile}
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  router.push(
                    profile?.role === "driver" ? "/driver" : "/passenger",
                  )
                }
                className="px-4 py-2 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                {LABEL.back}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs"
              >
                {LABEL.log_out}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {LABEL.error}
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
            {LABEL.my_posts}
          </h2>

          {userPosts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{LABEL.no_posts}</p>
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
                          {LABEL.select_route}
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
                          {LABEL.details}
                        </label>
                        <textarea
                          value={editDetails}
                          onChange={(e) => setEditDetails(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={6}
                          placeholder={LABEL.details_placeholder}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {LABEL.phone}
                        </label>
                        <input
                          type="tel"
                          value={editContactPhone}
                          onChange={(e) => setEditContactPhone(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={LABEL.phone_placeholder}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {LABEL.facebook}
                        </label>
                        <input
                          type="url"
                          value={editContactFacebook}
                          onChange={(e) =>
                            setEditContactFacebook(e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={LABEL.facebook_placeholder}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {LABEL.zalo}
                        </label>
                        <input
                          type="url"
                          value={editContactZalo}
                          onChange={(e) => setEditContactZalo(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={LABEL.zalo_placeholder}
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
                          {LABEL.save_changes}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                        >
                          {LABEL.cancel}
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
                              ? LABEL.post_offer
                              : LABEL.post_request}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPost(post)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          >
                            {LABEL.edit}
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            {LABEL.delete}
                          </button>
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold text-gray-700">
                          {LABEL.select_route} :
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
                            ? LABEL.collapse
                            : LABEL.read_more}
                        </button>
                      )}
                      <p className="text-xs text-gray-400">
                        {LABEL.posted_at}{" "}
                        {new Date(post.created_at).toLocaleString()}
                      </p>
                      {post.created_at !== post.updated_at && (
                        <p className="text-xs text-gray-400">
                          {LABEL.updated}{" "}
                          {new Date(post.updated_at).toLocaleString()}
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
            {LABEL.profile_info}
          </h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {LABEL.email}
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">{LABEL.email_note}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {LABEL.display_name}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={LABEL.display_name_placeholder}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {LABEL.phone}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={LABEL.phone_placeholder}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {LABEL.facebook}
              </label>
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={LABEL.facebook_placeholder}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {LABEL.zalo}
              </label>
              <input
                type="url"
                value={zaloUrl}
                onChange={(e) => setZaloUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={LABEL.zalo_placeholder}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {LABEL.role}
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
              {saving ? LABEL.saving : LABEL.update_profile}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
