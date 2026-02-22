import { POST_TRUNCATE_LENGTH } from "@/lib/constants";

export function truncateText(
  text: string,
  maxLength: number = POST_TRUNCATE_LENGTH,
): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function calculateFromTime(time: string) {
  const now = new Date();
  const daysToSubtract = time === "last_2_days" ? 1 : 0;
  const fromTime = new Date(
    Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - daysToSubtract,
      -7,
    ),
  );
  return fromTime;
}
