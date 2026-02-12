# Post Owner Detection Function

This module provides functionality to detect whether a post is from a passenger or driver based on its content.

## Usage

```typescript
import { detectPostOwner } from '@/lib/post-owner-detector';

const postContent = "Cần Tìm Xe Giá tiện chuyến Cho 2 Mẹ con từ Miêu Nha -Tây Mỗ Về Hạ Long. Tối nay hoặc sáng mai có xe là về ạ";
const result = detectPostOwner(postContent);
console.log(result); // Output: "passenger"
```

## Function Signature

```typescript
function detectPostOwner(content: string): "passenger" | "driver" | null
```

### Parameters

- `content` (string): The post content to analyze

### Returns

- `"passenger"`: If the post is from a passenger looking for a ride
- `"driver"`: If the post is from a driver offering a ride or service
- `null`: If the post type cannot be determined

## Detection Patterns

### Passenger Patterns
Posts are classified as "passenger" when they contain phrases like:
- "cần tìm xe" (need to find car)
- "tìm xe" (find car)
- "cần xe" (need car)
- "cần 1 xe" (need 1 car)
- "bao xe" (charter a car)
- "báo giá luôn" (quote price immediately - passenger context)

### Driver Patterns
Posts are classified as "driver" when they contain:
- "hotline" (service contact)
- "zalo: 0xxx" (contact with phone number)
- "xe ghép" (shared ride service)
- "xe tiện chuyến" (convenient ride service)
- "báo giá cước" (quote prices - driver context)
- "phục vụ quý khách" (serve customers)
- "đưa đón" (pick up and drop off service)
- Phone number patterns (e.g., 0xxxxxxxxx)
- "tuyến cố định" (fixed routes)
- "ghép ghế" (shared seats)
- "đội ngũ lái xe" (driver team)
- "hợp đồng du lịch" (tour contracts)
- "đón tận nhà" (pick up at home)
- "trả tận nơi" (drop off at location)
- Price patterns (e.g., "500k", "500k-600k")

## Examples

### Passenger Posts

```typescript
detectPostOwner("Cần Tìm Xe Giá Tiện Chuyến Cho 2 Mẹ con từ Miêu Nha -Tây Mỗ Về Hạ Long. Tối nay hoặc sáng mai có xe là về ạ");
// Returns: "passenger"

detectPostOwner("trưa mai cần 1 xe 5c hp đi sân bay hn .báo giá luôn giúp e");
// Returns: "passenger"

detectPostOwner("Tìm xe về Hà Nội về Hạ Long 13/2 19h tối bao xe");
// Returns: "passenger"
```

### Driver Posts

```typescript
detectPostOwner("Xe Ghép Xe Tiện Chuyến Hà Nội - Hải Phòng -Quảng Ninh HOTLINE 0378749434.");
// Returns: "driver"

detectPostOwner("Hotline/Zalo: 0906.123.868/ 0799223868 • Xe đưa đón Sân bay • Xe ghép 4 – 7 – 16 chỗ • Tuyến cố định: Bắc Giang – Bắc Ninh – Hà Nội – Hạ Long-Hải Phòng.");
// Returns: "driver"
```

## Implementation Details

The function uses a scoring system:
1. Counts matches for passenger-specific patterns
2. Counts matches for driver-specific patterns
3. Compares scores to determine the post owner type
4. Uses strong indicators (like phone numbers) as tie-breakers
5. Returns `null` if unable to determine with confidence
