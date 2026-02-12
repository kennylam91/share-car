"use client";

import { ROUTE_LABELS } from "@/lib/constants";
import type { Post } from "@/types";

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
}

export default function PostDetailModal({
  post,
  onClose,
}: PostDetailModalProps) {
  const {
    title = "Chi tiết bài đăng",
    routes = "Tuyến đường:",
    details = "Chi tiết:",
    posted = "Đăng lúc:",
    updated = "Cập nhật lúc:",
    close = "Đóng",
    anonymousName = "Ẩn danh",
    adminRole = "Quản trị viên",
    driverRole = "Tài xế",
    passengerRole = "Hành khách",
  } = {};

  const contactPhone = post.contact_phone || post.profile?.phone || "";
  const contactFacebook =
    post.contact_facebook_url || post.profile?.facebook_url || "";
  const contactZalo = post.contact_zalo_url || post.profile?.zalo_url || "";

  const getRoleName = () => {
    if (post.profile?.role === "admin") return adminRole;
    return post.post_type === "offer" ? driverRole : passengerRole;
  };

  const getDisplayName = () => {
    if (post.profile?.role === "admin") return anonymousName;
    return post.profile?.display_name || getRoleName();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-lg">
              {post.profile?.role === "admin"
                ? "A"
                : post.profile?.display_name?.[0] || "?"}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{getDisplayName()}</h3>
              <p className="text-sm text-gray-500">{getRoleName()}</p>
            </div>
          </div>
          {/* Routes */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">{routes}</h4>
            <div className="flex flex-wrap gap-2">
              {post.routes?.map((route) => (
                <span
                  key={route}
                  className="px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full font-medium"
                >
                  {ROUTE_LABELS[route]}
                </span>
              ))}
            </div>
          </div>
          {/* Details */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {details}
            </h4>
            <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
              {post.details}
            </p>
          </div>
          {/* Metadata */}
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">
              {posted} {new Date(post.created_at).toLocaleString()}
            </p>
            {post.created_at !== post.updated_at && (
              <p className="text-xs text-gray-500 mt-1">
                {updated} {new Date(post.updated_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {close}
        </button>
      </div>
    </div>
  );
}
