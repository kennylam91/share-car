"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES, ROUTE_LABELS } from "@/lib/constants";
import type { Post, Route, Profile } from "@/types";
import UserMenu from "@/app/components/UserMenu";
import PostDetailModal from "@/app/components/PostDetailModal";
import PassengerPostFormModal from "./PassengerPostFormModal";
import ContactInfo, { hasContactInfo } from "@/app/components/ContactInfo";
import PostAuthor from "../components/PostAuthor";
import { truncateText } from "@/lib/common-utils";

const LABEL = {
  dashboard: "Bảng Điều Khiển Hành Khách",
  all: "Tất Cả",
  available_drivers: "Tài Xế Có Sẵn",
  loading: "Đang tải...",
  no_driver_posts: "Không có bài đăng tài xế nào cho tuyến này",
  read_more: "Xem thêm",
  contact_button: "Liên hệ",
  hide_contact_button: "Ẩn liên hệ",
  anonymous: "Ẩn danh",
  driver: "Tài xế",
  create_request: "Yêu cầu tìm xe",
  select_route: "Chọn Tuyến Đường",
  details: "Chi Tiết",
  details_placeholder:
    "Khi nào bạn cần xe? Bao nhiêu hành khách? Yêu cầu đặc biệt nào không?",
  creating: "Đang tạo...",
  create_request_button: "Tạo Yêu Cầu",
  contact_info_title: "Thông tin liên hệ (Tùy chọn)",
  contact_phone_placeholder: "Số điện thoại (Để trống để dùng mặc định)",
  contact_facebook_placeholder: "https://facebook.com/your-profile",
  contact_zalo_placeholder: "https://zalo.me/your-id",
  alert_select_route_details:
    "Vui lòng chọn ít nhất một tuyến và nhập chi tiết",
  alert_failed_create: "Tạo yêu cầu thất bại. Vui lòng thử lại.",
};

export default function PassengerClient({
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
      params.append("type", "offer");
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
      <header className="bg-white shadow-sm sticky top-0 z-1000">
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
      <div className="bg-white border-b ">
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
        {/* Driver Posts */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {LABEL.available_drivers}
          </h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              {LABEL.loading}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-gray-500">
              {LABEL.no_driver_posts}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <PostAuthor profile={post.profile} />

                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.routes?.map((route) => (
                      <span
                        key={route}
                        className="px-2 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
                      >
                        {ROUTE_LABELS[route]}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-gray-700 text-sm">
                    {truncateText(post.details)}
                  </p>

                  {/* Contact Info Section */}
                  {post.profile?.role !== "admin" && (
                    <ContactInfo
                      phone={post.contact_phone}
                      contactFacebookUrl={post.contact_facebook_url}
                      facebookPostUrl={post.facebook_url}
                      zaloUrl={post.contact_zalo_url}
                      isExpanded={expandedContactIds.has(post.id)}
                    />
                  )}

                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-3 items-center">
                      {post.details.length > 150 && (
                        <button
                          onClick={() => setSelectedPost(post)}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-1"
                        >
                          {LABEL.read_more}
                        </button>
                      )}
                      {hasContactInfo(post) &&
                        post.profile?.role !== "admin" && (
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
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Request Button */}
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
        <PassengerPostFormModal
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
