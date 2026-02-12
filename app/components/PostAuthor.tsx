"use client";

export default function PostAuthor({
  profile,
}: {
  profile: { role: string; display_name?: string };
}) {
  const anonymousLabel = "Ẩn danh";

  const isAnon = ["admin", "anonymous"].includes(profile?.role);
  const initial = isAnon ? "A" : profile?.display_name?.[0] || "D";
  const name = isAnon ? anonymousLabel : profile?.display_name;

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
        {initial}
      </div>
      <h3 className="font-medium text-sm">{name}</h3>
    </div>
  );
}
