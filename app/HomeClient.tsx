"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES, ROUTE_LABELS } from "@/lib/constants";
import type { Post, Route } from "@/types";
import PostDetailModal from "@/app/components/PostDetailModal";
import ContactInfo, { hasContactInfo } from "@/app/components/ContactInfo";
import PassengerPostFormModal from "@/app/passenger/PassengerPostFormModal";

const label = {
  app_name: "Sekar",
  app_tagline: "Nền tảng xe ghép, xe tiện chuyến",
  login: "Đăng nhập",
  signup: "Đăng ký",
  go_to_dashboard: "Đi đến bảng điều khiển",
  all: "Tất Cả",
  offer: "Tìm khách",
  request: "Tìm xe",
  info_banner_text: "Để đăng bài tìm khách, vui lòng ",
  info_banner_action: "Đăng ký / Đăng nhập →",
  all_posts: "Tất cả bài đăng",
  loading: "Đang tải...",
  no_driver_posts: "Không có bài đăng nào này",
  anonymous: "Ẩn danh",
  driver: "Tài xế",
  see_more: "Xem thêm →",
  hide_contact: "Ẩn liên hệ",
  contact: "Liên hệ",
  create_post_title: "Tạo bài đăng tìm xe",
};

export default function HomeClient({
  initialPosts,
  isAuthenticated,
}: {
  initialPosts: Post[];
  isAuthenticated: boolean;
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selectedRoute, setSelectedRoute] = useState<Route | "all">("all");
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [expandedContactIds, setExpandedContactIds] = useState<Set<string>>(
    new Set(),
  );
  const [showPostForm, setShowPostForm] = useState(false);
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
  }, [selectedRoute]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedRoute !== "all") {
        params.append("route", selectedRoute);
      }
      params.append("public", "true");

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
            <div>
              <h1 className="text-3xl font-bold text-primary-600">
                <span className="text-2xl">🚗</span>
                <span className="align-middle ml-1">Sekar</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">{label.app_tagline}</p>
            </div>
            <div className="flex gap-2">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="px-2 py-2 text-primary-600 hover:bg-primary-50 rounded-lg font-medium text-xs transition-colors"
                  >
                    {label.login}
                  </button>
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="px-2 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-xs transition-colors"
                  >
                    {label.signup}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => router.push("/passenger")}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  {label.go_to_dashboard}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Route Filter */}
      <div className="bg-white border-b sticky top-[62px] z-10">
        <div className="max-w-4xl mx-auto px-4 py-1">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedRoute("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedRoute === "all"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label.all}
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
        {/* Info Banner for Non-Authenticated Users */}
        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 text-xl">ℹ️</div>
              <div className="flex-1">
                <p>
                  <span className="text-sm text-blue-800 mb-2">
                    {label.info_banner_text}
                  </span>
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 underline cursor-pointer"
                  >
                    {label.info_banner_action}
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">{label.all_posts}</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              {label.loading}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-gray-500">
              {label.no_driver_posts}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                        {["admin", "anonymous"].includes(post.profile.role)
                          ? "A"
                          : post.profile.display_name?.[0] || "D"}
                      </div>
                      <h3 className="font-medium text-sm">
                        {["admin", "anonymous"].includes(post.profile.role)
                          ? label.anonymous
                          : post.profile?.display_name || label.driver}
                      </h3>
                    </div>
                    {/* post type tag */}
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-lg ${
                        post.post_type === "offer"
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {post.post_type === "offer" ? label.offer : label.request}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.routes?.map((route) => (
                        <span
                          key={route}
                          className="px-2 py-1 bg-primary-50 text-primary-700 text-sm rounded-full"
                        >
                          {ROUTE_LABELS[route]}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-gray-700 text-sm wrap-break-word">
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
                            {label.see_more}
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
                              ? label.hide_contact
                              : label.contact}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Post Button (Floating Action Button) */}
        <button
          onClick={() => setShowPostForm(true)}
          className="fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-colors"
          title={label.create_post_title}
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

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {/* Post Form Modal */}
      {showPostForm && (
        <PassengerPostFormModal
          postType="offer"
          requireContact={!isAuthenticated}
          onClose={() => setShowPostForm(false)}
          onSuccess={() => {
            setShowPostForm(false);
            fetchPosts();
          }}
        />
      )}
    </div>
  );
}
