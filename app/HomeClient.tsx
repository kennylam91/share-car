"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES, ROUTE_LABELS } from "@/lib/constants";
import type { Post, Route } from "@/types";
import PostDetailModal from "@/app/components/PostDetailModal";

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
  const router = useRouter();

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedRoute]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("type", "offer");
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
              <p className="text-sm text-gray-600 mt-1">
                Nền tảng xe ghép, xe tiện chuyến
              </p>
            </div>
            <div className="flex gap-2">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="px-2 py-2 text-primary-600 hover:bg-primary-50 rounded-lg font-medium text-xs transition-colors"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="px-2 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-xs transition-colors"
                  >
                    Đăng ký
                  </button>
                </>
              ) : (
                <button
                  onClick={() => router.push("/passenger")}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  Go to Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Route Filter */}
      <div className="bg-white border-b sticky top-[82px] z-10">
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
              Tất Cả
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
                    Để yêu cầu đi nhờ xe hoặc trở thành tài xế, vui lòng &nbsp;
                  </span>
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 underline cursor-pointer"
                  >
                    Đăng ký / Đăng nhập →
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Driver Posts */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Tài Xế Có Sẵn</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Đang tải...</div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-gray-500">
              Không có bài đăng tài xế nào cho tuyến này
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
                        : post.profile?.display_name?.[0] || "D"}
                    </div>
                    <h3 className="font-semibold">
                      {post.profile?.role === "admin"
                        ? "Anonymous"
                        : post.profile?.display_name || "Driver"}
                    </h3>
                  </div>
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2 mt-2">
                      {post.routes.map((route) => (
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
                    <div className="flex justify-between items-center mt-2">
                      {post.details.length > 150 ? (
                        <button
                          onClick={() => setSelectedPost(post)}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-1"
                        >
                          Xem thêm →
                        </button>
                      ) : (
                        <span />
                      )}
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
      </main>

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
