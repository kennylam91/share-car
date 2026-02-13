import { describe, it, expect } from "vitest";
import { detectPostOwner } from "../lib/post-owner-detector";

describe("detectPostOwner2", () => {
  it("returns request for passenger phrases", () => {
    expect(detectPostOwner("Tìm xe đi Hà Nội, đi 2 người")).toBe("request");
    expect(detectPostOwner("Cần tìm xe gấp sáng mai")).toBe("request");
    expect(detectPostOwner("Cần xe 1 chiều")).toBe("request");
    expect(
      detectPostOwner(
        "Em cần xe về từ hà nội về cẩm hải đêm 26, báo zá giúp e ạ",
      ),
    ).toBe("request");
    expect(detectPostOwner("Mình cần gửi đồ từ quảng yên lên HN ạ")).toBe(
      "request",
    );
    expect(
      detectPostOwner(
        "Sáng mai nhà em cần 1 xe HN - HL, bao xe, ai có giá tốt nhắn em",
      ),
    ).toBe("request");
    expect(
      detectPostOwner(
        "Sáng mai có xe nào từ Thanh Xuân Hà Nội về Cẩm Phả Mông Dương không ạ ? Cmt e ib hoặc cmt sdt hộ e với ạ !!",
      ),
    ).toBe("request");
    expect(
      detectPostOwner(
        "Có xe tiện chuyến nào từ Mạo Khê về Ninh Giang Hải Dương 5h chiều nay không ạ",
      ),
    ).toBe("request");
    expect(
      detectPostOwner(
        "Em ở ocean park 1 gia lâm cần gửi 5c bánh trưng xuống mạo khê - đông triều QN Ai nhận dc ib e ạ",
      ),
    ).toBe("request");
    expect(
      detectPostOwner(
        "E tìm xe về tối nay 13/2 tầm 10h từ vinsmart về Uông Bí ạ xe 4 chỗ. Báo giá e",
      ),
    ).toBe("request");
    expect(
      detectPostOwner(
        "Em cần tìm xe Limousine ghép chuyến HN -HL ngày 18/2 (mùng 2 Tết), bác nào đi được hay cho nhà em 2 người đi ghép cùng với nhé ạ!",
      ),
    ).toBe("request");
    expect(
      detectPostOwner("Tìm xe từ Thiên Đường Bảo Sơn về Quảng Ninh bây giờ."),
    ).toBe("request");
    expect(
      detectPostOwner(
        "tìm xe bao xe từ tiên lãng HP về đầm hà QN sáng sớm mai",
      ),
    ).toBe("request");
    expect(
      detectPostOwner("Trưa mai 14/2 cần bao 1 xe 4 chỗ Hà Nội- Quảng Yên"),
    ).toBe("request");
    expect(
      detectPostOwner(
        "Sáng 15.2 nhà mình cần xe từ hn về uông bí. Bác nào giá tốt báo em nhé",
      ),
    ).toBe("request");
  });

  it("returns offer when passenger patterns are not present", () => {
    expect(detectPostOwner("Hotline 0123456789, xe ghép giá rẻ")).toBe("offer");
    expect(detectPostOwner("Xe ghép - phục vụ đưa đón tận nhà")).toBe("offer");
  });
});
