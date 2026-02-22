import { describe, it, expect } from "vitest";
import { detectPostType } from "../lib/post-type-detector";

describe("detectPostType", () => {
  it("returns request for passenger phrases", () => {
    expect(detectPostType("Tìm xe đi Hà Nội, đi 2 người")).toBe("request");
    expect(detectPostType("Cần tìm xe gấp sáng mai")).toBe("request");
    expect(detectPostType("Cần xe 1 chiều")).toBe("request");
    expect(
      detectPostType(
        "Ngày mai mùng 6 tết có xe ghép nào từ vân đồn đi Hải Phòng k ạ,cho e một ghế ghép về hải phòng với ạ",
      ),
    ).toBe("request");
    expect(
      detectPostType(
        "6-7h tối nay mình có xe từ hà nội về uông bí quảng yên ai cần xe alo e",
      ),
    ).toBe("offer");
    expect(
      detectPostType(
        "Ngày mai 22/2 e muốn ghép 2 ghế cho người lớn và 1 cháu nhỏ 1 tuổi đi từ trung tâm thị xã Quảng Yên đi về Ecopark Văn Giang- Hưng Yên. Bác tài nào chạy tuyến đó alo e với nha. SĐT 0981785438",
      ),
    ).toBe("request");
    expect(
      detectPostType(
        "Tìm xe từ Thiên Đường Bảo Sơn về Quảng Ninh bây giờ. 0374690364",
      ),
    ).toBe("request");
    expect(detectPostType("Chiều 14/2, cần bao xe 4 chỗ HN- Quảng Yên")).toBe(
      "request",
    );
    expect(
      detectPostType(
        "Em cần xe về từ hà nội về cẩm hải đêm 26, báo zá giúp e ạ",
      ),
    ).toBe("request");
    expect(detectPostType("Mình cần gửi đồ từ quảng yên lên HN ạ")).toBe(
      "request",
    );
    expect(
      detectPostType(
        "Sáng mai nhà em cần 1 xe HN - HL, bao xe, ai có giá tốt nhắn em",
      ),
    ).toBe("request");
    expect(
      detectPostType(
        "Sáng mai có xe nào từ Thanh Xuân Hà Nội về Cẩm Phả Mông Dương không ạ ? Cmt e ib hoặc cmt sdt hộ e với ạ !!",
      ),
    ).toBe("request");
    expect(
      detectPostType(
        "Có xe tiện chuyến nào từ Mạo Khê về Ninh Giang Hải Dương 5h chiều nay không ạ",
      ),
    ).toBe("request");
    expect(
      detectPostType(
        "Em ở ocean park 1 gia lâm cần gửi 5c bánh trưng xuống mạo khê - đông triều QN Ai nhận dc ib e ạ",
      ),
    ).toBe("request");
    expect(
      detectPostType(
        "E tìm xe về tối nay 13/2 tầm 10h từ vinsmart về Uông Bí ạ xe 4 chỗ. Báo giá e",
      ),
    ).toBe("request");
    expect(
      detectPostType(
        "Em cần tìm xe Limousine ghép chuyến HN -HL ngày 18/2 (mùng 2 Tết), bác nào đi được hay cho nhà em 2 người đi ghép cùng với nhé ạ!",
      ),
    ).toBe("request");
    expect(
      detectPostType("Tìm xe từ Thiên Đường Bảo Sơn về Quảng Ninh bây giờ."),
    ).toBe("request");
    expect(
      detectPostType("tìm xe bao xe từ tiên lãng HP về đầm hà QN sáng sớm mai"),
    ).toBe("request");
    expect(
      detectPostType("Trưa mai 14/2 cần bao 1 xe 4 chỗ Hà Nội- Quảng Yên"),
    ).toBe("request");
    expect(
      detectPostType(
        "Sáng 15.2 nhà mình cần xe từ hn về uông bí. Bác nào giá tốt báo em nhé",
      ),
    ).toBe("request");

    expect(
      detectPostType(
        "Mùng 8 bác nào có tiện chuyến Tiền Hải Thái Bình ra Vân ĐỒN QUẢNG Ninh ko ạ.. báo giá e bao xe với ạ.0912600669",
      ),
    ).toBe("request");
    expect(
      detectPostType(
        "km11 - Quảnh Yên đi bạch mai hai bà trưng hà nội chở 1 chiếc xe máy dream ạ e muốn chở xe Ai đi bán tải tiện chợ không ạ",
      ),
    ).toBe("request");
    expect(
      detectPostType(
        "Mùng 8 bác nào có tiện chuyến đông Hưng thái bình ra đông triều quảng ninh k ạ.. báo giá bao xe với ạ.",
      ),
    ).toBe("request");
    expect(
      detectPostType(
        "e muốn hỏi xe từ Uông Bí lên Hà Nội mà nhận chở cả mèo ạ, nếu mà bao được cả xe thì tốt ạ",
      ),
    ).toBe("request");
    expect(
      detectPostType(
        "Xin giá xe tiện chuyến từ sân vận động quảng yên tới đình vũ hải phòng ạ",
      ),
    ).toBe("request");
    expect(
      detectPostType(
        "E cần 1 ghế ! Ghép xe từ bãi cháy đi hà nội a ! 0963118115 ! Chiều nay ạ ! 22/2",
      ),
    ).toBe("request");
    expect(
      detectPostType(
        "Chiều nay còn xe nào trống 1 chỗ ghép từ Mạo Khê lên HN ko a?",
      ),
    ).toBe("request");
    expect(
      detectPostType(
        "Sáng mai e cần 01 ghế xe ghép đi từ cầu Trắng/Hà Tu đi đến cầu Bính trước 06.45 ạ.",
      ),
    ).toBe("request");
    expect(
      detectPostType(
        "Tầm 15h mình cần 1 ghế ghép chạy cao tốc về hạ long.bác nào còn ib e với",
      ),
    ).toBe("request");
    expect(
      detectPostType(
        "E cần chuyến xe từ bigc hải phòng sang tuần châu . Có ai tiện chuyến k ạ",
      ),
    ).toBe("request");
    expect(
      detectPostType(
        "Em cần tìm 2 ghế từ Uông Bí lên HN ạ, bác nào còn ib em giá ạ",
      ),
    ).toBe("request");
    expect(
      detectPostType(
        "Em cần 1 ghế tối nay từ nút giao Tiền Phong lên Hà Nội ạ (19-20-21h)",
      ),
    ).toBe("request");
  });

  it("returns offer when passenger patterns are not present", () => {
    expect(detectPostType("Hotline 0123456789, xe ghép giá rẻ")).toBe("offer");
    expect(detectPostType("Xe ghép - phục vụ đưa đón tận nhà")).toBe("offer");
    expect(
      detectPostType(
        "M6 khoảng 21-23h xe 7c không khách lộ trình Nội Bài - Móng cái, đường nào cũng đc tuỳ khách. Ace tiện chuyến/ bao xe 0977516585",
      ),
    ).toBe("offer");
    expect(
      detectPostType(
        "16h30 mùng 10 âm mình có xe 7 chỗ từ nội bài về hoàng quế bạn nào bắc ninh bắc giang cần xe liên hệ cho mình ạ",
      ),
    ).toBe("offer");
    expect(
      detectPostType(
        "Ngày mai em còn xe trống 5c từ Nam Định về Hải Phòng - Quảng Ninh ưu tiên bao xe bác nào đi được nhắn em zl 0386560525 uy tín đúng h đúng giá ạ",
      ),
    ).toBe("offer");
    expect(
      detectPostType(
        "Xe em 4-7c ở Hải Phòng bắt đầu trống lịch từ 20h ace cần xe lên Hà Nội hay đi các tỉnh alo em đón giá luôn ưu tiên cho khách hàng đặt trước Lh:0846946..",
      ),
    ).toBe("offer");
    expect(
      detectPostType(
        "Ngày mai mùng 7 (5h-6-h sáng )xe 7 chỗ từ MÓNG CÁI-HÀ NỘI khách bao xe-tiện chuyến Lh:0563233999",
      ),
    ).toBe("offer");
  });
});
