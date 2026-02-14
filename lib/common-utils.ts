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
