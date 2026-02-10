"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES, ROUTE_LABELS } from "@/lib/constants";
import type { Post, Route } from "@/types";

export default function PassengerClient({
  initialPosts,
}: {
  initialPosts: Post[];
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selectedRoute, setSelectedRoute] = useState<Route | "all">("all");
  const [showPostForm, setShowPostForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
            <h1 className="text-2xl font-bold text-primary-600">
              🚗 Share Car
            </h1>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Logout
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">Passenger Dashboard</p>
        </div>
      </header>

      {/* Route Filter */}
      <div className="bg-white border-b sticky top-[73px] z-10">
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
              All Routes
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
          <h2 className="text-lg font-semibold mb-4">Available Drivers</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-gray-500">
              No driver posts available for this route
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                      {post.profile?.role === "admin"
                        ? "A"
                        : post.profile?.name?.[0] || "?"}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {post.profile?.role === "admin"
                          ? "Anonymous"
                          : post.profile?.name || "Driver"}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {post.routes.map((route) => (
                          <span
                            key={route}
                            className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                          >
                            {ROUTE_LABELS[route]}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-gray-700">{post.details}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
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
        <PostFormModal
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

function PostFormModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedRoutes, setSelectedRoutes] = useState<Route[]>([]);
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleRoute = (route: Route) => {
    setSelectedRoutes((prev) =>
      prev.includes(route) ? prev.filter((r) => r !== route) : [...prev, route],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoutes.length === 0 || !details.trim()) {
      alert("Please select at least one route and provide details");
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
          post_type: "request",
          routes: selectedRoutes,
          details: details.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      onSuccess();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Request a Ride</h2>
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
              Select Routes
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
              Details
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="When do you need a ride? How many passengers? Any special requirements?"
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading || selectedRoutes.length === 0 || !details.trim()}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? "Posting..." : "Post Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
