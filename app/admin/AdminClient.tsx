"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES, ROUTE_LABELS } from "@/lib/constants";
import type { Route } from "@/types";

interface AdminStats {
  passengers: number;
  drivers: number;
  totalPosts: number;
}

export default function AdminClient() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const router = useRouter();

  // Form state
  const [postType, setPostType] = useState<"offer" | "request">("offer");
  const [selectedRoutes, setSelectedRoutes] = useState<Route[]>([]);
  const [details, setDetails] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
      } else {
        alert(data.error || "Failed to fetch stats");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      alert("An error occurred while fetching stats");
    } finally {
      setLoading(false);
    }
  };

  const handleRouteToggle = (route: Route) => {
    setSelectedRoutes((prev) =>
      prev.includes(route) ? prev.filter((r) => r !== route) : [...prev, route],
    );
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRoutes.length === 0) {
      alert("Please select at least one route");
      return;
    }

    if (!details.trim()) {
      alert("Please enter post details");
      return;
    }

    setPostLoading(true);
    try {
      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_type: postType,
          routes: selectedRoutes,
          details: details.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Post created successfully!");
        setShowPostForm(false);
        setPostType("offer");
        setSelectedRoutes([]);
        setDetails("");
        fetchStats(); // Refresh stats
      } else {
        alert(data.error || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("An error occurred while creating the post");
    } finally {
      setPostLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/auth/logout");
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary-600">
              <span className="text-2xl">🚗</span>
              <span className="align-middle ml-1">Sekar</span>
            </h1>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Đăng Xuất
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Bảng Điều Khiển Quản Trị</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Tổng Quan Nền Tảng
          </h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Đang tải thống kê...
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Passengers Card */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">
                      Passengers
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      {stats.passengers}
                    </p>
                  </div>
                  <div className="text-4xl opacity-80">🧑</div>
                </div>
              </div>

              {/* Drivers Card */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">
                      Drivers
                    </p>
                    <p className="text-3xl font-bold mt-1">{stats.drivers}</p>
                  </div>
                  <div className="text-4xl opacity-80">🚗</div>
                </div>
              </div>

              {/* Total Posts Card */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">
                      Total Posts
                    </p>
                    <p className="text-3xl font-bold mt-1">
                      {stats.totalPosts}
                    </p>
                  </div>
                  <div className="text-4xl opacity-80">📝</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-red-500">
              Không thể tải thống kê
            </div>
          )}
        </div>

        {/* Create Anonymous Post Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Tạo Bài Đăng
            </h2>
            <button
              onClick={() => setShowPostForm(!showPostForm)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {showPostForm ? "Hủy" : "Bài Đăng Mới"}
            </button>
          </div>

          {showPostForm && (
            <form onSubmit={handleSubmitPost} className="space-y-4">
              {/* Post Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại Bài Đăng
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPostType("offer")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      postType === "offer"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-primary-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">🚗</div>
                    <div className="font-medium">Tìm khách</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType("request")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      postType === "request"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-primary-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">🧑</div>
                    <div className="font-medium">Tìm xe</div>
                  </button>
                </div>
              </div>

              {/* Routes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tuyến Đường (Chọn một hoặc nhiều)
                </label>
                <div className="space-y-2">
                  {ROUTES.map((route) => (
                    <label
                      key={route}
                      className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRoutes.includes(route)}
                        onChange={() => handleRouteToggle(route)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="ml-3 text-gray-700">
                        {ROUTE_LABELS[route]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div>
                <label
                  htmlFor="details"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Chi Tiết
                </label>
                <textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={6}
                  placeholder="Thêm chi tiết về chuyến đi..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={postLoading}
                className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {postLoading ? "Đang tạo..." : "Tạo Bài Đăng"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
