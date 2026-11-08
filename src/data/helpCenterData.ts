export interface HelpArticle {
  id: string
  slug: string
  title: string
  summary?: string
  content: string
  bullets?: string[]
  note?: string
  actionLink?: {
    text: string
    url: string
  }
  keywords: string[]
}

export interface HelpCategory {
  id: string
  slug: string
  title: string
  shortTitle?: string
  iconName?: string
  description?: string
  badgeText?: string
  articles: HelpArticle[]
}

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'account',
    slug: 'account',
    title: 'Cài đặt tài khoản',
    shortTitle: 'Cài đặt tài khoản',
    articles: [
      {
        id: 'acc-verify-error',
        slug: 'loi-xac-thuc-tai-khoan',
        title: 'Tôi gặp lỗi khi xác thực tài khoản',
        content:
          'Nếu bạn không nhận được mã xác thực qua email hoặc gặp thông báo lỗi trong quá trình xác minh tài khoản, bạn có thể thực hiện các bước sau:',
        bullets: [
          'Kiểm tra kỹ hòm thư Spam, Quảng cáo hoặc Thư rác trong hộp thư email đã đăng ký.',
          'Đợi 60 giây và nhấn "Gửi lại mã xác thực" để hệ thống tạo mã mới.',
          'Đảm bảo kết nối mạng internet ổn định và địa chỉ email nhập vào hoàn toàn chính xác.',
          'Nếu vẫn chưa nhận được, hãy liên hệ qua Zalo CSKH GJob để được kích hoạt thủ công.',
        ],
        keywords: ['xác thực', 'lỗi tài khoản', 'mã xác thực', 'email kích hoạt', 'đăng ký'],
      },
      {
        id: 'acc-change-email',
        slug: 'thay-doi-email-dang-nhap',
        title: 'Tôi muốn thay đổi email đăng nhập',
        content:
          'Để bảo đảm an toàn dữ liệu và quyền sở hữu hồ sơ ứng viên, bạn có thể cập nhật email đăng nhập theo hướng dẫn:',
        bullets: [
          'Bước 1: Đăng nhập vào tài khoản GJob hiện tại của bạn.',
          'Bước 2: Nhấp vào biểu tượng ảnh đại diện ở góc phải trên cùng và chọn "Cài đặt tài khoản".',
          'Bước 3: Tại mục Thông tin đăng nhập, chọn "Đổi email" và nhập địa chỉ email mới.',
          'Bước 4: Xác thực mã bảo mật được gửi đến cả email cũ và email mới để hoàn tất quy trình.',
        ],
        keywords: ['đổi email', 'thay đổi email', 'email đăng nhập', 'cập nhật tài khoản'],
      },
      {
        id: 'acc-disconnect-social',
        slug: 'ngat-ket-noi-facebook-google',
        title: 'Tôi muốn ngắt kết nối với Facebook / Google',
        content:
          'Bạn hoàn toàn có thể quản lý các tài khoản mạng xã hội liên kết với tài khoản GJob trong phần cài đặt bảo mật:',
        bullets: [
          'Truy cập trang Cài đặt tài khoản > Quản lý liên kết mạng xã hội.',
          'Chọn tài khoản Facebook hoặc Google muốn hủy liên kết và nhấn "Ngắt kết nối".',
          'Lưu ý: Bạn cần tạo mật khẩu riêng cho tài khoản GJob trước khi ngắt kết nối để đảm bảo vẫn đăng nhập được bình thường.',
        ],
        keywords: ['ngắt kết nối', 'facebook', 'google', 'liên kết tài khoản'],
      },
      {
        id: 'acc-change-language',
        slug: 'cai-dat-ngon-ngu',
        title: 'Cài đặt ngôn ngữ trên tài khoản như thế nào?',
        content:
          'GJob hỗ trợ giao diện đa ngôn ngữ giúp ứng viên thuận tiện thao tác:',
        bullets: [
          'GJob hiện hỗ trợ Tiếng Việt và Tiếng Anh trên toàn hệ thống.',
          'Bạn có thể chuyển đổi ngôn ngữ nhanh chóng tại menu hồ sơ cá nhân hoặc phần Cài đặt tài khoản.',
        ],
        keywords: ['ngôn ngữ', 'tiếng việt', 'tiếng anh', 'cài đặt ngôn ngữ'],
      },
      {
        id: 'acc-deactivate',
        slug: 'vo-hieu-hoa-tai-khoan',
        title: 'Tôi muốn vô hiệu hóa hoặc xóa tài khoản',
        content:
          'Nếu bạn không còn nhu cầu tìm việc hoặc muốn tạm dừng hoạt động trên GJob:',
        bullets: [
          'Tắt trạng thái tìm việc: Bạn chỉ cần vào Cài đặt và tắt "Cho phép NTD tìm kiếm hồ sơ" mà không cần xóa tài khoản.',
          'Vô hiệu hóa: Chọn "Tạm khóa tài khoản", hệ thống sẽ ẩn toàn bộ thông tin cá nhân và CV của bạn.',
          'Yêu cầu xóa dữ liệu: Gửi yêu cầu qua kênh Hỗ trợ nếu bạn muốn xóa vĩnh viễn dữ liệu tài khoản.',
        ],
        keywords: ['xóa tài khoản', 'vô hiệu hóa', 'tạm khóa', 'hủy tài khoản'],
      },
    ],
  },
  {
    id: 'upgrade',
    slug: 'upgrade',
    title: 'Nâng cấp tài khoản',
    shortTitle: 'Nâng cấp tài khoản',
    articles: [
      {
        id: 'upgrade-benefits',
        slug: 'quyen-loi-tai-khoan-vip',
        title: 'Quyền lợi khi nâng cấp tài khoản GJob Pro / VIP',
        content:
          'Tài khoản Pro mở khóa toàn bộ các tiện ích độc quyền hỗ trợ tìm việc vượt trội:',
        bullets: [
          'Đẩy top hồ sơ ứng tuyển: CV của bạn được ưu tiên xuất hiện ở đầu danh sách ứng viên đối với nhà tuyển dụng.',
          'Báo cáo AI Matching nâng cao: Xem chi tiết phân tích từng kỹ năng, điểm mạnh và điểm cần cải thiện cho mọi JD.',
          'Không giới hạn lượt tải CV chuẩn in ấn chất lượng cao PDF không bị watermark.',
          'Nhận thông báo việc làm mới siêu tốc sớm hơn 12 giờ so với tài khoản thường.',
        ],
        keywords: ['nâng cấp', 'vip', 'gjob pro', 'quyền lợi', 'ưu tiên'],
      },
      {
        id: 'upgrade-how-to',
        slug: 'huong-dan-nang-cap',
        title: 'Làm thế nào để nâng cấp gói tài khoản?',
        content:
          'Bạn có thể kích hoạt gói GJob Pro nhanh chóng theo các bước:',
        bullets: [
          'Truy cập mục "GJob Pro" trên thanh menu hoặc từ trang cá nhân.',
          'Chọn gói thời hạn phù hợp (1 tháng, 3 tháng hoặc 1 năm).',
          'Thanh toán an toàn qua cổng thanh toán trực tuyến hoặc quét mã chuyển khoản tự động.',
          'Hệ thống sẽ kích hoạt tài khoản Pro ngay lập tức sau khi xác nhận thanh toán thành công.',
        ],
        keywords: ['kích hoạt', 'thanh toán gói', 'nâng cấp pro', 'gói dịch vụ'],
      },
    ],
  },
  {
    id: 'privacy',
    slug: 'privacy',
    title: 'Quyền riêng tư và bảo mật',
    shortTitle: 'Quyền riêng tư và bảo mật',
    articles: [
      {
        id: 'priv-searchable',
        slug: 'che-do-cho-phep-ntd-tim-kiem',
        title: 'Bật/Tắt chế độ Cho phép NTD tìm kiếm hồ sơ như thế nào?',
        content:
          'Tính năng này cho phép bạn chủ động kiểm soát việc nhà tuyển dụng có thể tiếp cận CV của bạn hay không:',
        bullets: [
          'Khi BẬT: Các nhà tuyển dụng đã xác thực trên GJob có thể tìm thấy hồ sơ của bạn và chủ động gửi lời mời làm việc.',
          'Khi TẮT: Hồ sơ của bạn được ẩn hoàn toàn trên thị trường việc làm, chỉ những nhà tuyển dụng mà bạn trực tiếp nộp hồ sơ mới có thể xem được CV.',
          'Cách chỉnh sửa: Vào mục Cài đặt tài khoản > Bật/Tắt công tắc "Cho phép NTD tìm kiếm hồ sơ".',
        ],
        keywords: ['tìm kiếm hồ sơ', 'cho phép ntd', 'ẩn hồ sơ', 'bảo mật', 'quyền riêng tư'],
      },
      {
        id: 'priv-difference-modes',
        slug: 'su-khac-biet-che-do-tim-viec',
        title: 'Sự khác biệt giữa "Trạng thái tìm việc đang bật" và "Cho phép NTD tìm kiếm hồ sơ"',
        content:
          'Hai cài đặt này phục vụ các mục đích riêng biệt nhằm bảo vệ tối đa quyền lợi của ứng viên:',
        bullets: [
          '"Trạng thái tìm việc": Báo hiệu cho hệ thống biết bạn đang sẵn sàng đón nhận cơ hội mới, giúp AI ưu tiên gợi ý việc làm phù hợp cho bạn.',
          '"Cho phép NTD tìm kiếm hồ sơ": Quyết định việc các doanh nghiệp có thể chủ động tìm thấy CV của bạn trong cơ sở dữ liệu ứng viên hay không.',
        ],
        keywords: ['trạng thái tìm việc', 'chế độ tìm việc', 'phân biệt', 'bảo mật'],
      },
    ],
  },
  {
    id: 'job-search',
    slug: 'job-search',
    title: 'Tìm việc và ứng tuyển',
    shortTitle: 'Tìm việc và ứng tuyển',
    articles: [
      {
        id: 'job-toggle-status',
        slug: 'bat-tat-che-do-tim-viec',
        title: 'Bật/Tắt Chế độ tìm việc như thế nào?',
        content:
          'Bạn có thể dễ dàng quản lý trạng thái tìm việc của mình để nhận được những cơ hội việc làm tốt nhất:',
        bullets: [
          'Truy cập trang Tổng quan ứng viên hoặc Cài đặt tài khoản.',
          'Gạt nút chuyển "Đang tìm việc" sang màu xanh để kích hoạt.',
          'Khi không còn nhu cầu tìm việc, chỉ cần gạt tắt để ngừng nhận thông báo gợi ý công việc.',
        ],
        keywords: ['bật tìm việc', 'tắt tìm việc', 'chế độ tìm việc', 'trạng thái'],
      },
      {
        id: 'job-search-filters',
        slug: 'cach-tim-kiem-va-loc-viec-lam',
        title: 'Làm thế nào để tìm kiếm và lọc việc làm hiệu quả?',
        content:
          'Trang Việc làm của GJob được trang bị các bộ lọc đa chiều giúp bạn nhanh chóng thu hẹp danh sách vị trí phù hợp:',
        bullets: [
          'Thanh tìm kiếm: Nhập chức danh công việc, kỹ năng chuyên môn hoặc tên công ty bạn quan tâm.',
          'Lọc theo Ngành nghề & Vị trí: Chọn chính xác lĩnh vực (IT, Marketing, Kinh doanh...) và cấp bậc (Thực tập sinh, Nhân viên, Trưởng nhóm...).',
          'Lọc theo Mức lương & Hình thức: Lọc theo khoảng thu nhập mong muốn hoặc hình thức làm việc (Toàn thời gian, Bán thời gian, Làm từ xa / Remote).',
          'Lọc theo Địa điểm: Chọn tỉnh/thành phố bạn muốn làm việc.',
        ],
        actionLink: {
          text: 'Tìm việc làm ngay',
          url: '/jobs',
        },
        keywords: ['tìm việc', 'bộ lọc việc làm', 'lương', 'địa điểm', 'cấp bậc', 'remote', 'ngành nghề'],
      },
      {
        id: 'job-apply-process',
        slug: 'quy-trinh-ung-tuyen',
        title: 'Quy trình nộp hồ sơ ứng tuyển trực tuyến trên GJob',
        content:
          'Việc nộp hồ sơ trên GJob được thiết kế nhanh chóng và tiện lợi chỉ với vài thao tác:',
        bullets: [
          'Bước 1: Mở tin tuyển dụng mà bạn quan tâm và đọc kỹ các yêu cầu công việc (JD).',
          'Bước 2: Nhấn nút "Ứng tuyển ngay" ở đầu hoặc chân trang chi tiết việc làm.',
          'Bước 3: Hộp thoại nộp hồ sơ xuất hiện, bạn chọn một trong các bản CV đã tạo trên hệ thống.',
          'Bước 4: Nhập thư giới thiệu ngắn (Cover letter) để gây ấn tượng với nhà tuyển dụng, sau đó nhấn "Gửi hồ sơ".',
          'Bước 5: Bạn có thể theo dõi tiến độ xét duyệt hồ sơ tại mục "Việc làm đã ứng tuyển".',
        ],
        keywords: ['ứng tuyển', 'nộp hồ sơ', 'cover letter', 'thư giới thiệu', 'quy trình', 'gửi cv'],
      },
    ],
  },
  {
    id: 'safety',
    slug: 'safety',
    title: 'Tìm việc an toàn',
    shortTitle: 'Tìm việc an toàn',
    badgeText: 'Khuyên đọc',
    articles: [
      {
        id: 'safety-apply-safe',
        slug: 'ung-tuyen-an-toan-nhu-the-nao',
        title: 'Ứng tuyển an toàn như thế nào?',
        content:
          'Để quá trình tìm việc diễn ra suôn sẻ và an toàn, ứng viên hãy luôn ghi nhớ quy tắc vàng "3 NÊN - 3 KHÔNG" dưới đây:',
        bullets: [
          'NÊN tìm hiểu kỹ thông tin công ty, mã số thuế và văn phòng làm việc trước khi nộp đơn hoặc đi phỏng vấn.',
          'NÊN lưu lại toàn bộ tin nhắn, email trao đổi và thông báo mời phỏng vấn làm căn cứ pháp lý.',
          'NÊN phỏng vấn tại địa chỉ trụ sở chính thức của doanh nghiệp vào giờ hành chính.',
          'KHÔNG chuyển bất kỳ khoản tiền nào cho nhà tuyển dụng (tiền cọc, phí hồ sơ, phí giữ chỗ).',
          'KHÔNG cung cấp thông tin tài chính nhạy cảm, mật khẩu hoặc mã xác thực OTP ngân hàng.',
          'KHÔNG ký vào các văn bản thỏa thuận mập mờ về tài chính hoặc nghĩa vụ không rõ ràng.',
        ],
        note: 'GJob cam kết 100% tin tuyển dụng trên hệ thống là hoàn toàn miễn phí ứng tuyển đối với ứng viên.',
        keywords: ['ứng tuyển an toàn', '3 nên 3 không', 'nguyên tắc an toàn', 'lời khuyên', 'bảo vệ bản thân'],
      },
      {
        id: 'safety-report-job',
        slug: 'bao-cao-tin-dang-tuyen-bat-thuong',
        title: 'Báo cáo tin đăng tuyển hoặc Nhà tuyển dụng có dấu hiệu bất thường như thế nào?',
        content:
          'Nếu bạn phát hiện tin tuyển dụng có dấu hiệu lừa đảo, mạo danh hoặc yêu cầu sai quy định, hãy thực hiện các bước sau để GJob kịp thời xử lý:',
        bullets: [
          'Bước 1: Sử dụng nút "Góp ý / Báo cáo" trực tiếp trên trang chi tiết việc làm hoặc từ thanh công cụ nổi Quick Dock.',
          'Bước 2: Chọn lý do báo cáo (Yêu cầu nạp tiền, Thông tin sai sự thật, Mạo danh thương hiệu, Hành vi không chuẩn mực).',
          'Bước 3: Đính kèm ảnh chụp màn hình tin nhắn hoặc bằng chứng nếu có và gửi cho Ban quản trị.',
          'Đội ngũ kiểm duyệt GJob sẽ xác minh trong vòng 24h và gỡ bỏ ngay lập tức nếu phát hiện vi phạm.',
        ],
        keywords: ['báo cáo', 'tố cáo', 'dấu hiệu bất thường', 'tin rác', 'vi phạm'],
      },
      {
        id: 'safety-job-red-flags',
        slug: 'dau-hieu-tin-dang-bat-thuong',
        title: 'GJob cảnh báo tới bạn các dấu hiệu của tin đăng bất thường',
        content:
          'Kẻ gian thường lợi dụng tâm lý cần việc gấp để đưa ra các lời mời hấp dẫn nhưng ẩn chứa rủi ro lừa đảo tài chính:',
        bullets: [
          'Yêu cầu chuyển tiền đặt cọc, nộp lệ phí hồ sơ, phí phỏng vấn hoặc mua tài liệu dự tuyển.',
          'Yêu cầu nạp tiền làm nhiệm vụ, tăng tương tác, mua đơn hàng trực tuyến hoặc chuyển tiền đầu tư trước khi nhận việc.',
          'Hứa hẹn mức lương cao bất thường (việc nhẹ lương cao) mà không đòi hỏi bất kỳ kỹ năng, bằng cấp hay kinh nghiệm nào.',
          'Mô tả công việc mập mờ, không ghi rõ địa điểm làm việc hoặc tên doanh nghiệp đại diện.',
        ],
        note: 'Doanh nghiệp uy tín không bao giờ yêu cầu ứng viên nộp tiền để được đi làm.',
        keywords: ['dấu hiệu bất thường', 'chuyển tiền', 'đặt cọc', 'nộp lệ phí', 'nhiệm vụ', 'bẫy tài chính'],
      },
      {
        id: 'safety-recruiter-red-flags',
        slug: 'dau-hieu-ntd-bat-thuong',
        title: 'GJob cảnh báo tới bạn các NTD có dấu hiệu bất thường',
        content:
          'Cách nhận biết và phòng tránh những đối tượng tuyển dụng thiếu minh bạch:',
        bullets: [
          'Sử dụng email miễn phí (@gmail.com, @yahoo.com) để trao đổi công việc thay vì email tên miền doanh nghiệp chính thức (@company.com).',
          'Yêu cầu phỏng vấn tại các địa điểm bất thường (quán cà phê vắng, khách sạn) ngoài giờ hành chính.',
          'Yêu cầu cung cấp ảnh chụp 2 mặt thẻ ngân hàng, mã số bí mật CVV/CVC hoặc thông tin tài khoản cá nhân nhạy cảm.',
          'Hối thúc ứng viên ký cam kết hoặc nộp tiền nhanh chóng bằng cách đe dọa mất cơ hội việc làm.',
        ],
        keywords: ['nhà tuyển dụng bất thường', 'kiểm tra nhà tuyển dụng', 'mạo danh', 'minh bạch'],
      },
      {
        id: 'safety-scam-recovery',
        slug: 'xu-ly-khi-bi-lua-dao',
        title: 'GJob hướng dẫn bạn cách xử lý nếu không may rơi vào tình trạng bị lừa đảo',
        content:
          'Nếu bạn không may đã chuyển tiền hoặc bị chiếm đoạt thông tin cá nhân, hãy bình tĩnh thực hiện ngay các hành động khẩn cấp:',
        bullets: [
          'Khóa thẻ & đổi mật khẩu: Gọi ngay hotline ngân hàng để tạm khóa tài khoản/thẻ ngân hàng và đổi mật khẩu toàn bộ tài khoản liên quan.',
          'Thu thập bằng chứng: Chụp màn hình toàn bộ tin nhắn, biên lai chuyển tiền, số điện thoại và thông tin kẻ lừa đảo.',
          'Trình báo cơ quan chức năng: Nộp đơn trình báo tại Công an phường/xã hoặc cơ quan điều tra phòng chống tội phạm công nghệ cao.',
          'Thông báo cho GJob: Báo ngay cho Ban quản trị GJob qua hotline hoặc Zalo để chúng tôi khóa tài khoản kẻ gian trên hệ thống.',
        ],
        keywords: ['xử lý lừa đảo', 'bị lừa', 'khóa thẻ', 'trình báo công an', 'bảo vệ tài sản'],
      },
      {
        id: 'safety-gjob-measures',
        slug: 'gjob-phong-chong-lua-dao',
        title: 'GJob đã làm gì để phòng chống lừa đảo',
        content:
          'GJob triển khai hệ thống bảo vệ đa tầng nhằm mang đến môi trường tìm việc an toàn, minh bạch nhất:',
        bullets: [
          'Xác minh pháp lý doanh nghiệp: 100% tài khoản nhà tuyển dụng phải cung cấp giấy phép kinh doanh và mã số thuế hợp lệ trước khi đăng tin.',
          'Kiểm duyệt tin tuyển dụng 2 lớp: Kết hợp trí tuệ nhân tạo (AI) quét từ khóa rủi ro và đội ngũ kiểm duyệt viên kiểm tra thủ công.',
          'Chính sách không thu phí: Nghiêm cấm hoàn toàn mọi hành vi thu tiền ứng viên dưới bất kỳ hình thức nào trên toàn hệ thống.',
          'Kênh tiếp nhận phản ánh 24/7: Sẵn sàng xử lý các báo cáo vi phạm và gỡ bỏ ngay lập tức các tin đăng có dấu hiệu gian lận.',
        ],
        keywords: ['phòng chống lừa đảo', 'xác minh doanh nghiệp', 'kiểm duyệt tin', 'an toàn tuyển dụng'],
      },
      {
        id: 'safety-impersonation-warning',
        slug: 'canh-bao-mao-danh-gjob',
        title: 'Cảnh báo hành vi mạo danh GJob nhằm chiếm đoạt tài sản',
        content:
          'Hiện nay có một số đối tượng lập tài khoản mạo danh ban quản trị hoặc nhân sự GJob để nhắn tin lừa đảo. Bạn hãy lưu ý:',
        bullets: [
          'Website chính thức duy nhất của chúng tôi hoạt động tại địa chỉ tên miền gjob.vn.',
          'Ban quản trị GJob KHÔNG BAO GIỜ nhắn tin riêng yêu cầu bạn chuyển tiền, nộp phí dịch vụ hay tham gia đầu tư tài chính.',
          'Mọi thông báo chính thức đều được gửi từ hòm thư điện tử có đuôi tên miền @gjob.vn hoặc kênh Zalo CSKH chính thức.',
          'Khi nhận được tin nhắn nghi vấn mạo danh, vui lòng liên hệ ngay với chúng tôi để xác thực.',
        ],
        keywords: ['mạo danh gjob', 'lừa đảo mạo danh', 'kênh chính thức', 'cảnh báo mạo danh'],
      },
    ],
  },
  {
    id: 'cv',
    slug: 'cv',
    title: 'Tạo cv ấn tượng',
    shortTitle: 'Tạo cv ấn tượng',
    articles: [
      {
        id: 'cv-create-guide',
        slug: 'huong-dan-tao-cv',
        title: 'Làm sao để tạo CV chuyên nghiệp trên GJob?',
        content:
          'GJob cung cấp thư viện mẫu CV được thiết kế theo tỷ lệ chuẩn A4 in ấn, chia theo hai hướng tiếp cận thuận tiện:',
        bullets: [
          'Tạo CV theo phong cách: Lựa chọn phong cách Đơn giản, Thanh lịch, Ấn tượng hoặc Hiện đại phù hợp với tính cách của bạn.',
          'Tạo CV theo vị trí: Lựa chọn mẫu được tối ưu riêng cho từng ngành nghề (Công nghệ thông tin, Marketing, Kinh doanh, Nhân sự...).',
          'Soạn thảo trực tiếp: Bấm vào từng trường nội dung (Thông tin cá nhân, Học vấn, Kinh nghiệm, Kỹ năng) trên mặt giấy A4 để chỉnh sửa trực tiếp.',
          'Lưu trữ tự động: Nhấn "Lưu CV" để lưu hồ sơ vào tài khoản cá nhân của bạn trên GJob.',
        ],
        actionLink: {
          text: 'Khám phá mẫu CV ngay',
          url: '/candidate/cvs/templates/styles',
        },
        keywords: ['tạo cv', 'mẫu cv', 'soạn thảo cv', 'mẫu theo phong cách', 'mẫu theo ngành', 'chuẩn a4'],
      },
      {
        id: 'cv-download-print',
        slug: 'tai-hoac-in-cv',
        title: 'Làm sao để tải CV định dạng PDF hoặc in CV?',
        content:
          'Sau khi hoàn tất chỉnh sửa và lưu CV, bạn có thể tải về máy hoặc in ấn chuẩn trang A4:',
        bullets: [
          'Bước 1: Truy cập mục "CV của tôi" (/candidate/cvs) trên thanh điều hướng.',
          'Bước 2: Chọn CV bạn muốn tải và bấm "Xem chi tiết".',
          'Bước 3: Nhấn nút "Tải xuống PDF" để tải tệp CV chuẩn in ấn về máy tính hoặc điện thoại.',
          'Bước 4: Bạn cũng có thể chọn tính năng "In CV" để in trực tiếp qua máy in mà không lo vỡ khung hay lỗi bố cục.',
        ],
        actionLink: {
          text: 'Đến danh sách CV của tôi',
          url: '/candidate/cvs',
        },
        keywords: ['tải cv', 'xuất pdf', 'in cv', 'lưu cv', 'file pdf', 'in a4'],
      },
      {
        id: 'cv-tips-ats',
        slug: 'meo-viet-cv-chuan-ats',
        title: 'Mẹo tối ưu nội dung CV giúp ghi điểm với nhà tuyển dụng',
        content:
          'Một bản CV ấn tượng cần có cấu trúc thông tin mạch lạc, nêu bật thành tích đo lường được và khớp với yêu cầu tuyển dụng:',
        bullets: [
          'Sử dụng các số liệu thực tế: Thay vì chỉ liệt kê đầu việc, hãy nêu rõ kết quả đạt được (ví dụ: "Tăng 25% doanh số trong quý 3", "Tối ưu tốc độ tải trang 40%").',
          'Liệt kê kỹ năng trọng tâm: Nêu đúng các kỹ năng chuyên môn mà bạn thành thạo nhất, ưu tiên các kỹ năng trùng khớp với JD.',
          'Trình bày theo thứ tự thời gian đảo ngược: Đưa kinh nghiệm làm việc và học vấn gần nhất lên đầu.',
          'Kiểm tra kỹ lỗi chính tả và phông chữ trước khi gửi hồ sơ ứng tuyển.',
        ],
        keywords: ['mẹo viết cv', 'tối ưu cv', 'ats', 'kinh nghiệm', 'kỹ năng', 'thành tích'],
      },
    ],
  },
  {
    id: 'ai-matching',
    slug: 'ai-matching',
    title: 'GJob Pro',
    shortTitle: 'GJob Pro',
    badgeText: 'Độc quyền GJob',
    articles: [
      {
        id: 'ai-how-it-works',
        slug: 'ai-matching-hoat-dong-nhu-the-nao',
        title: 'AI Matching đánh giá độ phù hợp CV–JD như thế nào?',
        content:
          'Hệ thống AI Matching của GJob sử dụng mô hình đối sánh ngữ nghĩa thông minh giữa hồ sơ ứng viên và bản mô tả công việc của nhà tuyển dụng:',
        bullets: [
          'Phân tích kỹ năng cốt lõi: Đối chiếu các kỹ năng cứng và kỹ năng mềm được nêu trong CV với yêu cầu bắt buộc của JD.',
          'So khớp kinh nghiệm & lĩnh vực: Đánh giá số năm kinh nghiệm, vị trí tương đương và lĩnh vực chuyên môn đã từng làm việc.',
          'Tính toán điểm % tương thích: Đưa ra con số trực quan (ví dụ: 85% phù hợp) giúp bạn đánh giá khả năng trúng tuyển trước khi nộp đơn.',
          'Chỉ ra điểm mạnh & kỹ năng còn thiếu: Gợi ý cụ thể những kỹ năng bạn đã đáp ứng tốt và những tiêu chí bạn cần bổ sung để tăng cơ hội trúng tuyển.',
        ],
        keywords: ['ai matching', 'độ phù hợp', 'tương thích', 'so khớp', 'kỹ năng', 'điểm matching', 'thuật toán'],
      },
      {
        id: 'ai-improve-score',
        slug: 'cach-tang-diem-matching',
        title: 'Làm thế nào để nâng cao điểm số AI Matching cho hồ sơ?',
        content:
          'Để AI nhận diện chính xác nhất thế mạnh của bạn so với yêu cầu của nhà tuyển dụng, hãy lưu ý:',
        bullets: [
          'Bổ sung đầy đủ các từ khóa kỹ năng chuyên môn vào mục "Kỹ năng" trong trình tạo CV.',
          'Mô tả chi tiết các dự án và công nghệ đã sử dụng trong mục "Kinh nghiệm làm việc".',
          'Cập nhật định kỳ hồ sơ cá nhân khi bạn học thêm công nghệ mới hoặc có chứng chỉ chuyên môn.',
        ],
        keywords: ['tăng điểm matching', 'tối ưu từ khóa', 'nâng cao hồ sơ', 'kỹ năng còn thiếu'],
      },
    ],
  },
  {
    id: 'saved-hub',
    slug: 'saved-hub',
    title: 'Quà tặng',
    shortTitle: 'Quà tặng',
    articles: [
      {
        id: 'saved-hub-usage',
        slug: 'quan-ly-viec-lam-va-cong-ty-da-luu',
        title: 'Làm thế nào để lưu việc làm và theo dõi công ty?',
        content:
          'GJob cung cấp trang Saved Hub thống nhất giúp ứng viên không bỏ lỡ bất kỳ cơ hội việc làm đáng chú ý nào:',
        bullets: [
          'Lưu việc làm: Bấm vào biểu tượng Bookmark trên từng thẻ việc làm để lưu lại vị trí bạn quan tâm.',
          'Theo dõi công ty: Bấm nút "Theo dõi" trên trang thông tin doanh nghiệp để theo dõi văn hóa và các đợt tuyển dụng mới.',
          'Quản lý tập trung: Truy cập mục "Mục đã lưu" (/candidate/saved) gồm 2 tab rõ ràng: "Việc làm đã lưu" và "Công ty đang theo dõi".',
        ],
        actionLink: {
          text: 'Mở Mục đã lưu ngay',
          url: '/candidate/saved?tab=jobs',
        },
        keywords: ['mục đã lưu', 'saved hub', 'lưu việc làm', 'theo dõi công ty', 'bookmark', 'quản lý'],
      },
      {
        id: 'gift-promotions',
        slug: 'chuong-trinh-qua-tang-va-uu-dai',
        title: 'Chương trình quà tặng và ưu đãi dành cho ứng viên mới',
        content:
          'GJob thường xuyên có các chương trình tặng lượt tải CV miễn phí và gói dùng thử Pro dành cho ứng viên mới tạo tài khoản.',
        bullets: [
          'Tặng 03 lượt tải CV PDF chuẩn in ấn miễn phí ngay sau khi xác thực email thành công.',
          'Ưu đãi giảm 30% khi kích hoạt gói dịch vụ GJob Pro trong 7 ngày đầu tiên.',
        ],
        keywords: ['quà tặng', 'ưu đãi', 'khuyến mãi', 'miễn phí', 'ứng viên mới'],
      },
    ],
  },
  {
    id: 'group',
    slug: 'group',
    title: 'Nhóm',
    shortTitle: 'Nhóm',
    articles: [
      {
        id: 'group-community',
        slug: 'tham-gia-cong-dong-ung-vien',
        title: 'Tham gia các nhóm nghề nghiệp và cộng đồng ứng viên GJob',
        content:
          'Cộng đồng ứng viên GJob là nơi chia sẻ kinh nghiệm phỏng vấn, mẹo viết CV và trao đổi cơ hội việc làm chất lượng:',
        bullets: [
          'Nhóm ứng viên Công nghệ thông tin (IT): Thảo luận về tech stack, phỏng vấn live coding và văn hóa công ty công nghệ.',
          'Nhóm Marketing & Truyền thông: Cập nhật xu hướng content, performance marketing và xây dựng portfolio chuyên nghiệp.',
          'Nhóm tìm việc sinh viên mới ra trường: Hướng dẫn viết CV khi chưa có nhiều kinh nghiệm và kỹ năng vượt qua vòng phỏng vấn đầu tiên.',
        ],
        keywords: ['nhóm', 'cộng đồng', 'chia sẻ kinh nghiệm', 'hội nhóm nghề nghiệp'],
      },
    ],
  },
  {
    id: 'contact',
    slug: 'contact',
    title: 'Liên hệ',
    shortTitle: 'Liên hệ',
    articles: [
      {
        id: 'contact-zalo',
        slug: 'kenh-ho-tro-zalo',
        title: 'Kênh hỗ trợ trực tuyến qua Zalo CSKH GJob',
        content:
          'Khi gặp sự cố kỹ thuật về tài khoản, nộp hồ sơ hoặc cần giải đáp gấp, bạn có thể nhắn tin trực tiếp qua kênh Zalo chính thức của GJob để được hỗ trợ nhanh chóng trong giờ làm việc.',
        bullets: [
          'Hỗ trợ xử lý lỗi đăng nhập, xác thực tài khoản.',
          'Hỗ trợ khắc phục sự cố nộp hồ sơ, tạo CV hoặc tải file PDF.',
          'Tiếp nhận phản ánh về tin tuyển dụng có dấu hiệu bất thường.',
        ],
        keywords: ['zalo', 'chat zalo', 'hỗ trợ trực tuyến', 'cskh', 'liên hệ trực tiếp'],
      },
      {
        id: 'contact-feedback-channel',
        slug: 'gui-gop-y-san-pham',
        title: 'Gửi ý kiến đóng góp & Báo cáo sự cố cho Ban quản trị',
        content:
          'GJob coi trọng mọi ý kiến đóng góp từ cộng đồng người tìm việc và nhà tuyển dụng. Bạn có thể gửi phản hồi trực tiếp cho chúng tôi:',
        bullets: [
          'Sử dụng nút "Góp ý" trên thanh công cụ nổi (Quick Dock) để gửi đánh giá và nhận xét về tính năng bất kỳ.',
          'Gửi email trực tiếp đến hòm thư Ban quản trị để phản ánh các vấn đề kỹ thuật sâu hơn.',
          'Mọi thông tin phản hồi của bạn đều được bảo mật và chỉ gửi tới Ban quản trị GJob.',
        ],
        keywords: ['góp ý', 'báo cáo sự cố', 'hòm thư', 'ban quản trị', 'phản hồi', 'đóng góp'],
      },
    ],
  },
]

export function getAllHelpArticles(): { article: HelpArticle; category: HelpCategory }[] {
  const result: { article: HelpArticle; category: HelpCategory }[] = []
  for (const cat of HELP_CATEGORIES) {
    for (const art of cat.articles) {
      result.push({ article: art, category: cat })
    }
  }
  return result
}

export function searchHelpArticles(query: string): { article: HelpArticle; category: HelpCategory }[] {
  const cleanQuery = query.trim().toLowerCase()
  if (!cleanQuery) return []

  const all = getAllHelpArticles()
  return all.filter(({ article, category }) => {
    const titleMatch = article.title.toLowerCase().includes(cleanQuery)
    const summaryMatch = article.summary?.toLowerCase().includes(cleanQuery) ?? false
    const contentMatch = article.content.toLowerCase().includes(cleanQuery)
    const categoryMatch = category.title.toLowerCase().includes(cleanQuery)
    const keywordMatch = article.keywords.some((k) => k.toLowerCase().includes(cleanQuery))
    const bulletMatch = article.bullets?.some((b) => b.toLowerCase().includes(cleanQuery)) ?? false

    return titleMatch || summaryMatch || contentMatch || categoryMatch || keywordMatch || bulletMatch
  })
}
