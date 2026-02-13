import type { Post, PostType } from "@/types";

/**
 * Detects the owner type of a post based on its content
 * @param content - The post content to analyze
 * @returns "passenger" if the post is from a passenger, "driver" if from a driver, or null if uncertain
 */
export function detectPostOwnerOld(content: string): PostType {
  if (!content || typeof content !== "string") {
    return "request";
  }

  // Normalize the content to lowercase for case-insensitive matching
  const normalizedContent = content.toLowerCase();

  // Passenger patterns - people looking for rides
  const passengerPatterns = [
    /cần\s+tìm\s+xe/, // "cần tìm xe" - need to find car
    /tìm\s+xe/, // "tìm xe" - find car
    /cần\s+xe/, // "cần xe" - need car
    /cần\s+\d+\s+xe/, // "cần 1 xe" - need 1 car
    /bao\s+xe/, // "bao xe" - rent/charter a car
  ];

  // Driver patterns - people offering rides/services
  const driverPatterns = [
    /hotline/, // "hotline" - service contact
    /zalo\s*:?\s*\d/, // "Zalo: 0xxx" - contact with phone number
    /xe\s+ghép/, // "xe ghép" - shared ride service
    /xe\s+tiện\s+chuyến/, // "xe tiện chuyến" - convenient ride service
    /báo\s+giá\s+cước/, // "báo giá cước" - quote prices
    /phục\s+vụ\s+quý\s+khách/, // "phục vụ quý khách" - serve customers
    /đưa\s+đón/, // "đưa đón" - pick up and drop off service
    /\d{4}[\s.-]?\d{3}[\s.-]?\d{3}/, // Phone number pattern (xxxx xxx xxx)
    /0\d{9}/, // Vietnamese phone number (0xxxxxxxxx)
    /tuyến\s+cố\s+định/, // "tuyến cố định" - fixed routes
    /ghép\s+ghế/, // "ghép ghế" - shared seats
    /đội\s+ngũ\s+lái\s+xe/, // "đội ngũ lái xe" - driver team
    /hợp\s+đồng\s+du\s+lịch/, // "hợp đồng du lịch" - tour contracts
    /rất\s+hân\s+hạnh/, // "rất hân hạnh" - very honored to serve
    /đón\s+tận\s+nhà/, // "đón tận nhà" - pick up at home
    /trả\s+tận\s+nơi/, // "trả tận nơi" - drop off at location
    /[\d,]+k(?:\s*[-–>]\s*[\d,]+k)?/, // Price patterns like "500k" or "500k-600k"
  ];

  // Count matches for each type
  let passengerScore = 0;
  let driverScore = 0;

  // Check passenger patterns
  for (const pattern of passengerPatterns) {
    if (pattern.test(normalizedContent)) {
      passengerScore++;
    }
  }

  // Check driver patterns
  for (const pattern of driverPatterns) {
    if (pattern.test(normalizedContent)) {
      driverScore++;
    }
  }

  // Special case: if contains "báo giá" with context
  // "báo giá luôn" (in passenger context) vs "báo giá cước" (in driver context)
  const hasBaoGiaLuon = /báo\s+giá\s+luôn/.test(normalizedContent);
  const hasBaoGiaCuoc = /báo\s+giá\s+cước/.test(normalizedContent);

  if (hasBaoGiaLuon && !hasBaoGiaCuoc) {
    passengerScore += 2; // Strong passenger indicator
  }

  // Decision logic
  if (driverScore > passengerScore) {
    return "offer";
  } else if (passengerScore > driverScore) {
    return "request";
  }

  // If scores are equal, check for strong indicators
  // Phone numbers and hotlines are stronger driver indicators
  const strongDriverPatterns = [
    /hotline/, // "hotline" - service contact
    /zalo\s*:?\s*\d/, // "Zalo: 0xxx" - contact with phone number
  ];

  const hasStrongDriverIndicator = strongDriverPatterns.some((pattern) =>
    pattern.test(normalizedContent),
  );

  if (hasStrongDriverIndicator) {
    return "offer";
  }

  // "Tìm xe" or "Cần xe" without driver context is passenger
  const strongPassengerPatterns = [
    /cần\s+tìm\s+xe/, // "cần tìm xe" - need to find car
    /tìm\s+xe/, // "tìm xe" - find car
    /cần\s+xe/, // "cần xe" - need car
  ];

  const hasPassengerIndicator = strongPassengerPatterns.some((pattern) =>
    pattern.test(normalizedContent),
  );

  if (hasPassengerIndicator) {
    return "request";
  }

  return "request";
}

export function detectPostOwner(content: string): PostType {
  const strongPassengerPatterns = [
    /cần\s+tìm\s+xe/, // "cần tìm xe" - need to find car
    /tìm\s+xe/, // "tìm xe" - find car
    /cần\s+xe/, // "cần xe" - need car
    /cần\s+bao\s+\d{0,1}\s+xe/,
    /cần\s+gửi/,
    /có\s+xe\s+tiện\s+chuyến\s+nào/,
    /có\s+xe\s+nào/, // "có xe nào"
    /nhà\s+em/,
    /cần\s+\d+\s+xe/, // "cần 1 xe"
  ];

  const normalizedContent = content.toLowerCase();

  const hasPassengerIndicator = strongPassengerPatterns.some((pattern) =>
    pattern.test(normalizedContent),
  );

  if (hasPassengerIndicator) {
    return "request";
  }

  return "offer";
}
