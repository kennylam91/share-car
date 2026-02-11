"use client";

interface ContactInfoProps {
  phone?: string | null;
  facebookUrl?: string | null;
  zaloUrl?: string | null;
  isExpanded: boolean;
}

const LABEL = {
  title: "Thông tin liên hệ",
  phone_icon: "📞",
  facebook_icon: "👤",
  facebook_label: "Facebook",
  zalo_icon: "💬",
  zalo_label: "Zalo",
};

export default function ContactInfo({
  phone,
  facebookUrl,
  zaloUrl,
  isExpanded,
}: ContactInfoProps) {
  if (!isExpanded) return null;

  const hasContact = phone || facebookUrl || zaloUrl;
  if (!hasContact) return null;

  return (
    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
      <h5 className="text-sm font-semibold text-gray-700 mb-2">
        {LABEL.title}
      </h5>
      <div className="text-sm text-gray-700 space-y-1">
        {phone && (
          <div>
            <span className="font-medium">{LABEL.phone_icon} </span>
            <a
              href={`tel:${phone}`}
              className="text-primary-600 hover:underline"
            >
              {phone}
            </a>
          </div>
        )}
        {facebookUrl && (
          <div>
            <span className="font-medium">{LABEL.facebook_icon} </span>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline break-all"
            >
              {LABEL.facebook_label}
            </a>
          </div>
        )}
        {zaloUrl && (
          <div>
            <span className="font-medium">{LABEL.zalo_icon} </span>
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline break-all"
            >
              {LABEL.zalo_label}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export function hasContactInfo(
  phone?: string | null,
  facebookUrl?: string | null,
  zaloUrl?: string | null,
): boolean {
  return !!(phone || facebookUrl || zaloUrl);
}
