"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES, ROUTE_LABELS } from "@/lib/constants";
import type { Post, Route, Profile } from "@/types";
import UserMenu from "@/app/components/UserMenu";
import PostDetailModal from "@/app/components/PostDetailModal";
import ContactInfo, { hasContactInfo } from "@/app/components/ContactInfo";

const LABEL = {
  dashboard: "Bảng Điều Khiển Tài Xế",
  all: "Tất Cả",
  passenger_requests: "Yêu Cầu Của Hành Khách",
  loading: "Đang tải...",
  no_requests: "Không có yêu cầu hành khách nào cho tuyến này",
  see_more: "Xem thêm →",
  create_ride: "Tạo Chuyến Đi",
  select_route: "Chọn Tuyến Đường",
  details: "Chi Tiết",
  details_placeholder: "Bạn đi khi nào? Có bao nhiêu chỗ? Giá mỗi chỗ?",
  posting: "Đang đăng...",
  post_ride: "Đăng Chuyến Đi",
  contact_button: "Liên hệ",
  hide_contact_button: "Ẩn liên hệ",
  contact_info_title: "Thông tin liên hệ (Tùy chọn)",
  contact_phone_placeholder: "Số điện thoại (Để trống để dùng mặc định)",
  contact_facebook_placeholder: "https://facebook.com/your-profile",
  contact_zalo_placeholder: "https://zalo.me/your-id",
  alert_select_route_details:
    "Vui lòng chọn ít nhất một tuyến và nhập chi tiết",
  alert_failed_create: "Tạo chuyến đi thất bại. Vui lòng thử lại.",
};

export default function DriverClient({
  initialPosts,
}: {
  initialPosts: Post[];
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selectedRoute, setSelectedRoute] = useState<Route | "all">("all");
  const [showPostForm, setShowPostForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [expandedContactIds, setExpandedContactIds] = useState<Set<string>>(
    new Set(),
  );
  const router = useRouter();

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  const toggleContactInfo = (postId: string) => {
    setExpandedContactIds((prev) => {
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
    fetchPosts();
    fetchProfile();
  }, [selectedRoute]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      if (response.ok) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("type", "request");
      if (selectedRoute !== "all") {
        params.append("route", selectedRoute);
      }

      const response = await fetch(`/api/posts?${params}`);
      const data = await response.json();

      if (response.ok) {
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-600">🚗 Sekar</h1>
            <UserMenu
              userEmail={profile?.email}
              userName={profile?.display_name || profile?.name}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">{LABEL.dashboard}</p>
        </div>
      </header>

      {/* Route Filter */}
      <div className="bg-white border-b top-[82px] z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedRoute("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedRoute === "all"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {LABEL.all}
            </button>
            {ROUTES.map((route) => (
              <button
                key={route}
                onClick={() => setSelectedRoute(route)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedRoute === route
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {ROUTE_LABELS[route]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Passenger Requests */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {LABEL.passenger_requests}
          </h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              {LABEL.loading}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-gray-500">
              {LABEL.no_requests}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                      {post.profile?.role === "admin"
                        ? "A"
                        : post.profile?.display_name?.[0] || "?"}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {post.profile?.role === "admin"
                          ? "Anonymous"
                          : post.profile?.display_name || "Passenger"}
                      </h3>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.routes.map((route) => (
                      <span
                        key={route}
                        className="px-2 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
                      >
                        {ROUTE_LABELS[route]}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-gray-700">
                    {truncateText(post.details)}
                  </p>

                  {/* Contact Info Section */}
                  {
                    <ContactInfo
                      phone={post.contact_phone}
                      facebookUrl={post.contact_facebook_url}
                      zaloUrl={post.contact_zalo_url}
                      isExpanded={expandedContactIds.has(post.id)}
                    />
                  }

                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2 items-center">
                      {post.details.length > 150 && (
                        <button
                          onClick={() => setSelectedPost(post)}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-1"
                        >
                          {LABEL.see_more}
                        </button>
                      )}
                      {hasContactInfo(
                        post.contact_phone,
                        post.contact_facebook_url,
                        post.contact_zalo_url,
                      ) && (
                        <button
                          onClick={() => toggleContactInfo(post.id)}
                          className="text-sm text-green-600 hover:text-green-800 font-medium mt-1"
                        >
                          {expandedContactIds.has(post.id)
                            ? LABEL.hide_contact_button
                            : LABEL.contact_button}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Offer Ride Button */}
        <button
          onClick={() => setShowPostForm(true)}
          className="fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </main>

      {/* Post Form Modal */}
      {showPostForm && (
        <PostFormModal
          profile={profile}
          onClose={() => setShowPostForm(false)}
          onSuccess={() => {
            setShowPostForm(false);
            fetchPosts();
          }}
        />
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}

function PostFormModal({
  profile,
  onClose,
  onSuccess,
}: {
  profile?: Profile | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedRoutes, setSelectedRoutes] = useState<Route[]>([]);
  const [details, setDetails] = useState("");
  const [contactPhone, setContactPhone] = useState<string>(
    profile?.phone || "",
  );
  const [contactFacebook, setContactFacebook] = useState<string>(
    profile?.facebook_url || "",
  );
  const [contactZalo, setContactZalo] = useState<string>(
    profile?.zalo_url || "",
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setContactPhone(profile?.phone || "");
    setContactFacebook(profile?.facebook_url || "");
    setContactZalo(profile?.zalo_url || "");
  }, [profile]);

  const toggleRoute = (route: Route) => {
    setSelectedRoutes((prev) =>
      prev.includes(route) ? prev.filter((r) => r !== route) : [...prev, route],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoutes.length === 0 || !details.trim()) {
      alert(LABEL.alert_select_route_details);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_type: "offer",
          routes: selectedRoutes,
          details: details.trim(),
          contact_phone: contactPhone?.trim() || null,
          contact_facebook_url: contactFacebook?.trim() || null,
          contact_zalo_url: contactZalo?.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      onSuccess();
    } catch (error) {
      console.error("Error creating post:", error);
      alert(LABEL.alert_failed_create);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{LABEL.create_ride}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {LABEL.select_route}
            </label>
            <div className="space-y-2">
              {ROUTES.map((route) => (
                <label
                  key={route}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoutes.includes(route)}
                    onChange={() => toggleRoute(route)}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm">{ROUTE_LABELS[route]}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {LABEL.details}
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={LABEL.details_placeholder}
              rows={6}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="pt-2 border-t">
            <h3 className="text-sm font-semibold mb-2">
              {LABEL.contact_info_title}
            </h3>
            <div className="space-y-2">
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder={LABEL.contact_phone_placeholder}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <input
                type="url"
                value={contactFacebook}
                onChange={(e) => setContactFacebook(e.target.value)}
                placeholder={LABEL.contact_facebook_placeholder}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <input
                type="url"
                value={contactZalo}
                onChange={(e) => setContactZalo(e.target.value)}
                placeholder={LABEL.contact_zalo_placeholder}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || selectedRoutes.length === 0 || !details.trim()}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? LABEL.posting : LABEL.post_ride}
          </button>
        </form>
      </div>
    </div>
  );
}
