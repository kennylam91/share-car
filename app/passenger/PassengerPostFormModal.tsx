import { useState, useEffect } from "react";
import { ROUTES, ROUTE_LABELS } from "@/lib/constants";
import type { Profile, Route } from "@/types";

const LABEL = {
  create_request: "Yêu cầu tìm xe",
  create_offer: "Tạo bài đăng tìm xe",
  select_route: "Chọn Tuyến Đường",
  details: "Chi Tiết",
  details_placeholder:
    "Khi nào bạn cần xe? Bao nhiêu hành khách? Yêu cầu đặc biệt nào không?",
  alert_select_route_details:
    "Vui lòng chọn ít nhất một tuyến và nhập chi tiết",
  alert_contact_required:
    "Vui lòng cung cấp ít nhất một phương thức liên hệ (điện thoại, Facebook hoặc Zalo)",
  alert_failed_create: "Tạo yêu cầu thất bại. Vui lòng thử lại.",
  contact_info_title: "Thông tin liên hệ",
  contact_phone_placeholder: "Số điện thoại",
  contact_facebook_placeholder: "https://facebook.com/your-profile",
  contact_zalo_placeholder: "https://zalo.me/your-id",
  creating: "Đang tạo...",
  create_request_button: "Tạo Yêu Cầu",
  create_offer_button: "Tạo Bài Đăng",
};

export default function PassengerPostFormModal({
  profile,
  onClose,
  onSuccess,
  postType = "request",
  requireContact = false,
}: {
  profile?: Profile | null;
  onClose: () => void;
  onSuccess: () => void;
  postType?: "request" | "offer";
  requireContact?: boolean;
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

  const isOffer = postType === "offer";

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

    // If caller requests contact to be required (e.g., anonymous offer on Home), enforce at least one
    if (requireContact || (isOffer && !profile)) {
      const hasContact =
        (contactPhone || "").trim() ||
        (contactFacebook || "").trim() ||
        (contactZalo || "").trim();
      if (!hasContact) {
        alert(LABEL.alert_contact_required);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_type: postType,
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
          <h2 className="text-xl font-bold">
            {isOffer ? LABEL.create_offer : LABEL.create_request}
          </h2>
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
            {loading
              ? LABEL.creating
              : isOffer
                ? LABEL.create_offer_button
                : LABEL.create_request_button}
          </button>
        </form>
      </div>
    </div>
  );
}
