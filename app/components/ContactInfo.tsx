"use client";

interface ContactInfoProps {
  phone?: string | null;
  contactFacebookUrl?: string | null; // Author profile/contact
  facebookPostUrl?: string | null; // Original post
  zaloUrl?: string | null;
  isExpanded: boolean;
}

const LABEL = {
  title: "Thông tin liên hệ",
  phone_icon: "📞",
  facebook_icon: "👤",
  facebook_label: "Facebook cá nhân",
  facebook_post_icon: "🔗",
  facebook_post_label: "Bài đăng trên Facebook",
  zalo_icon: "💬",
  zalo_label: "Zalo",
};

export default function ContactInfo({
  phone,
  contactFacebookUrl,
  facebookPostUrl,
  zaloUrl,
  isExpanded,
}: ContactInfoProps) {
  if (!isExpanded) return null;

  const hasContact = phone || contactFacebookUrl || zaloUrl || facebookPostUrl;
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
        {contactFacebookUrl && (
          <div>
            <span className="font-medium">{LABEL.facebook_icon} </span>
            <a
              href={contactFacebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline break-all"
            >
              {LABEL.facebook_label}
            </a>
          </div>
        )}
        {facebookPostUrl && (
          <div>
            <span className="font-medium">{LABEL.facebook_post_icon} </span>
            <a
              href={facebookPostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {LABEL.facebook_post_label}
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

import type { Post } from "@/types";

export function hasContactInfo(post: Partial<Post>): boolean {
  return !!(
    post.contact_phone ||
    post.contact_facebook_url ||
    post.contact_zalo_url ||
    post.facebook_url
  );
}
