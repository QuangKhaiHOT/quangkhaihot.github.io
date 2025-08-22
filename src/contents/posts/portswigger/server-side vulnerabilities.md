---
title: Server-side vulnerabilities
published: 2025-08-15
description: Tìm hiểu về các lỗ hổng server-side.
tags: [server-side, security]
category: PortSwigger
draft: false
cover: '/post-imgs/sv-side.jpg'
---

# Path traversal
**Path traversal** (hay directory traversal) là lỗ hổng cho phép kẻ tấn công truy cập hoặc chỉnh sửa tệp tùy ý trên máy chủ, bao gồm mã nguồn, thông tin đăng nhập, tệp hệ điều hành… và có thể dẫn đến chiếm quyền kiểm soát máy chủ.
## Đọc các tệp tin tùy ý thông qua path traversal
### Ví dụ
**Lab: File path traversal, simple case**

Để tải một hình ảnh lên ứng dụng thường sẽ sử dụng một HTML như sau:

```http
<img src="/loadImage?filename=55.jpg">
```

Các hình ảnh sẽ được lưu ở vị trí `var/www/images/` từ đó để lấy được ảnh ứng dụng sẽ đọc từ đường dẫn `var/www/images/55.jpg`.

Dựa vào điều này kẻ tấn công có thể thực hiện cuộc tấn công như sau:

```http
GET /image?filename=../../../etc/passwd
```

Điều này khiến ứng dụng sẽ đọc theo đường dẫn `var/www/images/../../../etc/passwd`.

../ nghĩa là quay lại một thư mục cha.

Ví dụ: từ thư mục /var/www/images/, nếu dùng ../../../ thì sẽ lần lượt quay về /var/www/ → /var/ → /, tức là thư mục gốc của hệ thống. Vì vậy, tệp được đọc thực chất nằm ở thư mục `etc/passwd`.

# Access control

**Access control** là cơ chế giới hạn ai hoặc cái gì được phép thực hiện hành động hay truy cập tài nguyên.Trong web app, nó dựa vào:

* Authentication: xác minh người dùng là ai.

* Session management: theo dõi yêu cầu HTTP nào thuộc về người dùng đó.

* Access control: quyết định người dùng có được phép thực hiện hành động hay không.

**Broken access control** là một lỗ hổng rất thường gặp và gây ra lỗ hổng bảo mật nghiêm trọng.

**Vertical privilege escalation** (leo thang đặc quyền theo chiều dọc) là khi kẻ tấn công tăng quyền hạn của mình lên mức cao hơn so với quyền ban đầu.

## Unprotected functionality (Chức năng không được bảo vệ)
### Ví dụ
**Lab: Unprotected admin functionality**

Lab này có một trang quản trị chứa chức năng nhạy cảm. Ứng dụng không có cơ chế bảo vệ, nên bất kỳ người dùng nào cũng có thể truy cập trực tiếp.

Tiến hành truy cập thử `/robot.txt`:

```http
https://0a4b0042044a262682fa10c0001e0026.web-security-academy.net/robots.txt
```
<p align="center"><b>🠋 kết quả có được 🠋</b></p>

```http
User-agent: *
Disallow: /administrator-panel
```

Và từ đó biết được địa chỉ URL `/administrator-panel` tiến hành truy cập vào và thực hiện các chức năng của admin.

Nếu trong trường hợp /robots.txt không chứa URL thì ta vẫn có thể brute-force để dò ra địa chỉ.

**Lab: Unprotected admin functionality with unpredictable URL**

Trong lab này, các chức năng nhạy cảm được che giấu bằng cách đặt cho chúng một URL khó đoán hơn như:

```http
https://insecure-website.com/administrator-panel-yb556
```

Tuy nhiên, ứng dụng vẫn có thể rò rỉ URL cho người dùng. URL có thể được tiết lộ trong JavaScript xây dựng giao diện người dùng dựa trên vai trò của người dùng:

```html
<script>
  var isAdmin = false;
  if (isAdmin) {
     var topLinksTag = document.getElementsByClassName("top-links")[0];
     var adminPanelTag = document.createElement('a');
     adminPanelTag.setAttribute('href', '/admin-dt608z');
     adminPanelTag.innerText = 'Admin panel';
    topLinksTag.append(adminPanelTag);
     var pTag = document.createElement('p');
     pTag.innerText = '|';
    topLinksTag.appendChild(pTag);
  }
</script>
```

Do đó, ta có thể biết được URL chứa chức năng nhạy cảm là `/admin-dt608z`.

## Parameter-based access control methods (Phương thức kiểm soát truy cập dựa trên tham số)

Một số ứng dụng xác định quyền hoặc vai trò truy cập của người dùng khi đăng nhập, sau đó lưu trữ thông tin này ở vị trí có thể kiểm soát người dùng. Ví dụ như:

  * Hidden field.

  * Cookie

  * Tham số được gắn sẵn trong query string.

### Ví dụ

**Lab: User role controlled by request parameter**

Trong lab này ta sử dụng `wiener:peter` để đăng nhập và ta sẽ thấy được ứng dụng dùng cookie để xác thực người dùng:

```http
Cookie: Admin=false; session=GmYFedtYymKl4UuKPUmT7wybU1om7m4y
```

Việc cần làm là sửa lại `Admin=true` để người dùng được xác thực thành `admin`.

## Horizontal privilege escalation (Leo thang đặc quyền ngang)

**Lab: User ID controlled by request parameter, with unpredictable user IDs**

Trong lab này ta sẽ sử dụng `wiener:peter` để đăng nhập. Và sẽ có được URL để truy cập vào trang tài khoản cá nhân:

```http
https://0a9a00a404eed5eb8154073500b90020.web-security-academy.net/my-account?id=bc09318d-81b9-4314-8334-00a39dda29eb
```

Ta có thể thấy ứng dụng dùng GUIDs để định danh tài khoản.

Thử truy cập một vài bài post ta sẽ thấy được một vài thông tin như sau:

```html
<span id=blog-author><a href='/blogs?userId=bc09318d-81b9-4314-8334-00a39dda29eb'>wiener</a></span>
```

Ở trong post này có một thẻ `<span></span>` chứa thông tin `blog-author`. Ta chỉ việc tìm post chứa thông tin về `carlos`.

```html
<span id=blog-author><a href='/blogs?userId=d3a07227-ad80-46cc-b707-b2bbbe436624'>carlos</a></span>
```

Với post của `blog-author` là `carlos` thì ta sẽ có được URL để truy cập trang cá nhân của `carlos` là:

```http
/my-account?id=d3a07227-ad80-46cc-b707-b2bbbe436624
```

## Horizontal to vertical privilege escalation (Sự leo thang theo chiều ngang đến theo chiều dọc)

**Lab: User ID controlled by request parameter with password disclosure**

Trong lab này nếu ta đăng nhặp với thông tin `wiener:peter` thì URL truy cập tài khoản cá nhân sẽ là:

```http
https://0a3e005603da1c33813c3a18002b00d6.web-security-academy.net/my-account?id=wiener
```
và trong trang sẽ có thông tin mật khẩu của tài khoản cá nhân:

```html
<input required type=password name=password value='peter'/>
```

Sau khi thử đổi `my-account?id=administrator` và ta đã truy cập được vào trang `administrator` và có được mật khẩu của `administrator`:

```html
<input required type=password name=password value='eyx7jirp9vmukopt8675'/>
```

Tiến hành đăng nhập với thông tin `administrator:eyx7jirp9vmukopt8675` và thực hiện các chức năng với `admin`.

# Authentication

**So sánh sự khác biệt giữa `Authentication (Xác thực)` và `Authorization (Phân quyền)`**

`Authentication (Xác thực)`

Là quá trình xác minh danh tính của người dùng để đảm bảo họ đúng là người mà họ khai báo. Hệ thống sử dụng các phương thức như mật khẩu, mã OTP, vân tay, khuôn mặt hoặc chứng chỉ số để kiểm tra.

`Authorization (Phân quyền)`

Là quá trình xác định quyền hạn của người dùng sau khi đã được xác thực thành công. Hệ thống quyết định người dùng có được phép truy cập tài nguyên, dữ liệu hoặc thực hiện một hành động cụ thể nào đó trong hệ thống hay không.

## Tấn công Brute-force (Brute-force attacks)

* Tấn công brute-force là phương pháp dùng thử sai để đoán thông tin đăng nhập của người dùng. Quá trình này thường được tự động hóa bằng wordlist và công cụ chuyên dụng, giúp kẻ tấn công thực hiện hàng loạt yêu cầu đăng nhập với tốc độ cao.

* Hiệu quả tấn công có thể tăng lên nếu kẻ tấn công sử dụng logic hoặc thông tin công khai để đưa ra các phán đoán chính xác hơn.

* Những website chỉ dựa vào mật khẩu để xác thực sẽ dễ bị tấn công nếu không có cơ chế bảo vệ chống brute-force.

### Brute-force username (Tấn công brute-force tên đăng nhập)

Tên đăng nhập thường dễ bị đoán nếu tuân theo một mẫu đặt tên phổ biến, chẳng hạn như:

* Địa chỉ email theo định dạng: firstname.lastname@company.com.

* Các tên mặc định quen thuộc: admin, administrator.

Khi kiểm thử bảo mật, cần đánh giá xem website có vô tình để lộ tên đăng nhập hay không bằng cách:

* Kiểm tra khả năng truy cập hồ sơ người dùng mà không cần đăng nhập.

* Quan sát tên hiển thị trong hồ sơ, vì đôi khi chúng trùng với tên đăng nhập.

* Phân tích HTTP responses để tìm các địa chỉ email, đặc biệt là của quản trị viên hoặc bộ phận IT, vì đây có thể là các tài khoản có quyền cao.

### Brute-forcing passwords (Tấn công brute-force mật khẩu)

Mật khẩu có thể bị brute-force, nhưng độ khó phụ thuộc vào độ mạnh của mật khẩu.
Nhiều website áp dụng chính sách mật khẩu để tăng độ bảo mật, thường yêu cầu:

* Độ dài tối thiểu.

* Kết hợp chữ hoa và chữ thường.

* Có ít nhất một ký tự đặc biệt.

Mật khẩu phức tạp (high-entropy) thường khó bị brute-force, nhưng thói quen của người dùng lại tạo ra lỗ hổng:

* Người dùng thường biến đổi mật khẩu dễ nhớ để đáp ứng chính sách, 

Ví dụ: mypassword → Mypassword1! hoặc Myp4$$w0rd.

* Khi đổi mật khẩu định kỳ, họ chỉ thay đổi nhỏ và dễ đoán:

Ví dụ: Mypassword1! → Mypassword2!.

Hiểu các mẫu mật khẩu phổ biến giúp kẻ tấn công tinh chỉnh brute-force và tăng hiệu quả tấn công.

### Username enumeration (Liệt kê tên người dùng)

Username enumeration là một kỹ thuật tấn công trong đó kẻ tấn công khai thác sự khác biệt trong phản hồi của website để xác định username nào hợp lệ.

### Ví dụ
**Lab: Username enumeration via different responses**

Trong lab này khi đăng nhập với thông tin `abc:abc` thì sẽ có được phản hổi:

```html
<p class=is-warning>Incorrect password</p>
```

Tiến hành giữ nguyên mật khẩu và brute-force `username:autodiscover` thì sẽ có thêm được một phản hồi mới:

```html
<p class=is-warning>Incorrect password</p>
```
Suy ra `username:autodiscover` đã chính xác, chỉ còn mật khẩu là chưa đúng. Tiến hành giữ nguyên `username:autodiscover` và brute-force mật khẩu thì ta có được `password:joshua`.

### Bypassing two-factor authentication (Bỏ qua xác thực hai yếu tố)

**Lab: 2FA simple bypass**

Trong lab này tiến hành đăng nhập với thông tin `wiener:peter` sau đó nhập mã xác nhận và bạn sẽ được chuyển đến trang cá nhân với URL:

```http 
https://0a5000770462c11b800f857d00a9002c.web-security-academy.net/my-account?id=wiener
```

Thêm một tab khác tiến hành đăng nhập với thông tin `carlos:montoya` khi đến bước xác thực mã thì quay lại tab đầu và sửa URL như sau:

```http 
https://0a5000770462c11b800f857d00a9002c.web-security-academy.net/my-account?id=wiener
                                                                                  🠋
https://0a5000770462c11b800f857d00a9002c.web-security-academy.net/my-account?id=carlos

```

Và ta có thể đăng nhập vào trang cá nhân của `carlos`.

**Nguyên nhân là trong trường hợp này 2FA (two-factor authentication) được triển khai sai. Sau khi người dùng nhập mật khẩu, trang sẽ yêu cầu mã xác thực ở bước tiếp theo, nhưng thực tế trạng thái đăng nhập đã được thiết lập từ bước nhập mật khẩu. Khi đó, có thể thử truy cập trực tiếp vào các trang chỉ dành cho người đã đăng nhập mà không cần nhập mã 2FA.**

# Server-side request forgery (SSRF)