"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Profile, Post, PostEditState } from "@/types";
import { ROUTES, ROUTE_LABELS, POST_TRUNCATE_LENGTH } from "@/lib/constants";
import { truncateText } from "@/lib/common-utils";
import ProfilePostEditForm from "@/app/components/ProfilePostEditForm";

// ---------------------------------------------------------------------------
// Labels (module-level, consistent with DriverClient / PassengerClient)
// ---------------------------------------------------------------------------
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
  post_offer: "Tìm khách",
  post_request: "Tìm xe",
  edit: "Sửa",
  delete: "Xóa",
  read_more: "Xem thêm",
  collapse: "Thu gọn",
  posted_at: "Đăng lúc:",
  updated: "Cập nhật:",
  confirm_delete: "Bạn có chắc muốn xóa bài đăng này không?",
  error_details_min_length: "Chi tiết phải có ít nhất 10 ký tự",
};

// ---------------------------------------------------------------------------
// Helper to build PostEditState from a Post
// ---------------------------------------------------------------------------
function toEditState(post: Post): PostEditState {
  return {
    id: post.id,
    post_type: post.post_type,
    routes: post.routes ?? [],
    details: post.details,
    contact_phone: post.contact_phone ?? "",
    contact_facebook_url: post.contact_facebook_url ?? "",
    contact_zalo_url: post.contact_zalo_url ?? "",
  };
}

export default function ProfileClient() {
  // -- data --
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // -- notification --
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // -- profile form --
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [zaloUrl, setZaloUrl] = useState("");

  // -- post edit (single object replaces 7 individual state vars) --
  const [editingPost, setEditingPost] = useState<PostEditState | null>(null);

  // -- text expansion --
  const [expandedPostIds, setExpandedPostIds] = useState<Set<string>>(
    new Set(),
  );

  const router = useRouter();

  // -- initial data load (parallel) --
  useEffect(() => {
    Promise.all([fetchProfile(), fetchUserPosts()]).finally(() =>
      setLoading(false),
    );
  }, []);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
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
    } catch {
      setError(LABEL.error_load_profile);
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

  // ---------------------------------------------------------------------------
  // Profile handlers
  // ---------------------------------------------------------------------------
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
          phone,
          facebook_url: facebookUrl,
          zalo_url: zaloUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
        showSuccess(LABEL.success_update_profile);
      } else {
        setError(data.error || LABEL.error_update_profile);
      }
    } catch {
      setError(LABEL.error_update_profile);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/auth/logout");
    router.push("/auth/login");
    router.refresh();
  };

  // ---------------------------------------------------------------------------
  // Post handlers
  // ---------------------------------------------------------------------------
  const handleEditPost = (post: Post) => setEditingPost(toEditState(post));

  const handleCancelEdit = () => setEditingPost(null);

  const handleUpdatePost = async () => {
    if (!editingPost) return;
    setError("");
    setSuccess("");

    if (editingPost.details.trim().length < 10) {
      setError(LABEL.error_details_min_length);
      return;
    }

    try {
      const response = await fetch(`/api/posts/${editingPost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_type: editingPost.post_type,
          routes: editingPost.routes,
          details: editingPost.details,
          contact_phone: editingPost.contact_phone,
          contact_facebook_url: editingPost.contact_facebook_url,
          contact_zalo_url: editingPost.contact_zalo_url,
          user_id: profile?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess(LABEL.success_update_post);
        setEditingPost(null);
        fetchUserPosts();
      } else {
        setError(data.error || LABEL.error_update_post);
      }
    } catch {
      setError(LABEL.error_update_post);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm(LABEL.confirm_delete)) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showSuccess(LABEL.success_delete_post);
        fetchUserPosts();
      } else {
        const data = await response.json();
        setError(data.error || LABEL.error_delete_post);
      }
    } catch {
      setError(LABEL.error_delete_post);
    }
  };

  const togglePostExpansion = (postId: string) => {
    setExpandedPostIds((prev) => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  // ---------------------------------------------------------------------------
  // Notification helper
  // ---------------------------------------------------------------------------
  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
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

        {/* My Posts */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            {LABEL.my_posts}
          </h2>

          {userPosts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{LABEL.no_posts}</p>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isEditing={editingPost?.id === post.id}
                  editState={editingPost?.id === post.id ? editingPost : null}
                  isAnonymous={profile?.role === "anonymous"}
                  isExpanded={expandedPostIds.has(post.id)}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                  onSave={handleUpdatePost}
                  onCancel={handleCancelEdit}
                  onEditChange={setEditingPost}
                  onToggleExpand={togglePostExpansion}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PostCard — separates per-post view/edit rendering from the parent component
// ---------------------------------------------------------------------------
interface PostCardProps {
  post: Post;
  isEditing: boolean;
  editState: PostEditState | null;
  isAnonymous?: boolean;
  isExpanded: boolean;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onEditChange: (state: PostEditState) => void;
  onToggleExpand: (postId: string) => void;
}

function PostCard({
  post,
  isEditing,
  editState,
  isAnonymous = false,
  isExpanded,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onEditChange,
  onToggleExpand,
}: PostCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      {isEditing && editState ? (
        <ProfilePostEditForm
          editState={editState}
          isAnonymous={isAnonymous}
          onChange={onEditChange}
          onSave={onSave}
          onCancel={onCancel}
        />
      ) : (
        <PostCardView
          post={post}
          isExpanded={isExpanded}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleExpand={onToggleExpand}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PostCardView — read-only view of a single post
// ---------------------------------------------------------------------------
interface PostCardViewProps {
  post: Post;
  isExpanded: boolean;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
  onToggleExpand: (postId: string) => void;
}

function PostCardView({
  post,
  isExpanded,
  onEdit,
  onDelete,
  onToggleExpand,
}: PostCardViewProps) {
  const isLong = post.details.length > POST_TRUNCATE_LENGTH;

  return (
    <>
      <div className="flex justify-between items-start mb-2">
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
            post.post_type === "offer"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {post.post_type === "offer" ? LABEL.post_offer : LABEL.post_request}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(post)}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            {LABEL.edit}
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="text-red-600 hover:text-red-800 font-medium text-sm"
          >
            {LABEL.delete}
          </button>
        </div>
      </div>

      {post.routes && post.routes.length > 0 && (
        <div className="mb-2">
          <span className="font-semibold text-gray-700">
            {LABEL.select_route}:{" "}
          </span>
          {post.routes.map((r) => ROUTE_LABELS[r]).join(", ")}
        </div>
      )}

      <p className="text-gray-600 mb-2 whitespace-pre-wrap text-sm">
        {isExpanded ? post.details : truncateText(post.details)}
      </p>

      {isLong && (
        <button
          onClick={() => onToggleExpand(post.id)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-2"
        >
          {isExpanded ? LABEL.collapse : LABEL.read_more}
        </button>
      )}

      <p className="text-xs text-gray-400">
        {LABEL.posted_at} {new Date(post.created_at).toLocaleString()}
      </p>
      {post.created_at !== post.updated_at && (
        <p className="text-xs text-gray-400">
          {LABEL.updated} {new Date(post.updated_at).toLocaleString()}
        </p>
      )}
    </>
  );
}
