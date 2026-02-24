"use client";

import { ROUTES, ROUTE_LABELS } from "@/lib/constants";
import type { PostEditState } from "@/types";
import type { Route } from "@/types";

const LABEL = {
  post_offer: "Tìm khách",
  post_request: "Tìm xe",
  select_route: "Tuyến Đường",
  details: "Chi Tiết",
  details_placeholder: "Thêm chi tiết về chuyến đi của bạn...",
  phone: "Số Điện Thoại",
  phone_placeholder: "Nhập số điện thoại của bạn",
  facebook: "Facebook URL",
  facebook_placeholder: "https://facebook.com/your-profile",
  zalo: "Zalo URL",
  zalo_placeholder: "https://zalo.me/your-id",
  save_changes: "Lưu Thay Đổi",
  cancel: "Hủy",
};

interface ProfilePostEditFormProps {
  editState: PostEditState;
  isAnonymous: boolean;
  onChange: (draft: PostEditState) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export default function ProfilePostEditForm({
  editState,
  isAnonymous,
  onChange,
  onSave,
  onCancel,
  isSaving = false,
}: ProfilePostEditFormProps) {
  const handleRouteToggle = (route: Route) => {
    const routes = editState.routes.includes(route)
      ? editState.routes.filter((r) => r !== route)
      : [...editState.routes, route];
    onChange({ ...editState, routes });
  };

  const canSave = editState.details.trim().length >= 10 && !isSaving;

  return (
    <div className="space-y-4">
      {isAnonymous && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post Type
          </label>
          <select
            value={editState.post_type}
            onChange={(e) =>
              onChange({
                ...editState,
                post_type: e.target.value as "offer" | "request",
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="offer">{LABEL.post_offer}</option>
            <option value="request">{LABEL.post_request}</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {LABEL.select_route}
        </label>
        <div className="space-y-2">
          {ROUTES.map((route) => (
            <label key={route} className="flex items-center">
              <input
                type="checkbox"
                checked={editState.routes.includes(route)}
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
          value={editState.details}
          onChange={(e) => onChange({ ...editState, details: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
          value={editState.contact_phone}
          onChange={(e) =>
            onChange({ ...editState, contact_phone: e.target.value })
          }
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
          value={editState.contact_facebook_url}
          onChange={(e) =>
            onChange({ ...editState, contact_facebook_url: e.target.value })
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
          value={editState.contact_zalo_url}
          onChange={(e) =>
            onChange({ ...editState, contact_zalo_url: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={LABEL.zalo_placeholder}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={!canSave}
          className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {LABEL.save_changes}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
        >
          {LABEL.cancel}
        </button>
      </div>
    </div>
  );
}
