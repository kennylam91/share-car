/**
 * Detects the owner type of a post based on its content
 * @param content - The post content to analyze
 * @returns "passenger" if the post is from a passenger, "driver" if from a driver, or null if uncertain
 */
export function detectPostOwner(content: string): "passenger" | "driver" | null {
  if (!content || typeof content !== "string") {
    return null;
  }

  // Normalize the content to lowercase for case-insensitive matching
  const normalizedContent = content.toLowerCase();

  // Passenger patterns - people looking for rides
  const passengerPatterns = [
    /cần\s+tìm\s+xe/i,           // "cần tìm xe" - need to find car
    /tìm\s+xe/i,                 // "tìm xe" - find car
    /cần\s+xe/i,                 // "cần xe" - need car
    /cần\s+\d+\s+xe/i,           // "cần 1 xe" - need 1 car
    /bao\s+xe/i,                 // "bao xe" - rent/charter a car
  ];

  // Driver patterns - people offering rides/services
  const driverPatterns = [
    /hotline/i,                   // "hotline" - service contact
    /zalo\s*:?\s*\d/i,           // "Zalo: 0xxx" - contact with phone number
    /xe\s+ghép/i,                // "xe ghép" - shared ride service
    /xe\s+tiện\s+chuyến/i,       // "xe tiện chuyến" - convenient ride service
    /báo\s+giá\s+cước/i,         // "báo giá cước" - quote prices
    /phục\s+vụ\s+quý\s+khách/i, // "phục vụ quý khách" - serve customers
    /đưa\s+đón/i,                // "đưa đón" - pick up and drop off service
    /\d{4}[\s.-]?\d{3}[\s.-]?\d{3}/i, // Phone number pattern (xxxx xxx xxx)
    /0\d{9}/i,                    // Vietnamese phone number (0xxxxxxxxx)
    /tuyến\s+cố\s+định/i,        // "tuyến cố định" - fixed routes
    /ghép\s+ghế/i,               // "ghép ghế" - shared seats
    /đội\s+ngũ\s+lái\s+xe/i,    // "đội ngũ lái xe" - driver team
    /hợp\s+đồng\s+du\s+lịch/i,  // "hợp đồng du lịch" - tour contracts
    /rất\s+hân\s+hạnh/i,         // "rất hân hạnh" - very honored to serve
    /đón\s+tận\s+nhà/i,          // "đón tận nhà" - pick up at home
    /trả\s+tận\s+nơi/i,          // "trả tận nơi" - drop off at location
    /[\d,]+k(?:\s*[-–>]\s*[\d,]+k)?/i, // Price patterns like "500k" or "500k-600k"
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
  const hasBaoGiaLuon = /báo\s+giá\s+luôn/i.test(normalizedContent);
  const hasBaoGiaCuoc = /báo\s+giá\s+cước/i.test(normalizedContent);
  
  if (hasBaoGiaLuon && !hasBaoGiaCuoc) {
    passengerScore += 2; // Strong passenger indicator
  }

  // Decision logic
  if (driverScore > passengerScore) {
    return "driver";
  } else if (passengerScore > driverScore) {
    return "passenger";
  }

  // If scores are equal, check for strong indicators
  // Phone numbers and hotlines are stronger driver indicators
  if (/hotline|0\d{9}|zalo\s*:?\s*\d/i.test(normalizedContent)) {
    return "driver";
  }

  // "Tìm xe" or "Cần xe" without driver context is passenger
  if (/tìm\s+xe|cần\s+xe/i.test(normalizedContent)) {
    return "passenger";
  }

  return null;
}
