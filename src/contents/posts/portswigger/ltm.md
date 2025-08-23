---
title: Lập trình mạng nâng cao
published: 2025-08-02
description: Đồ án xây dựng hệ thống Client-Server sử dụng Java.
tags: [projects, java]
category: Projects
draft: false
cover: '/projects/ltm/java.jpg'
---

# Đồ án môn học - Lập trình mạng nâng cao
> [File báo cáo - Lập trình mạng nâng cao](./public/projects/ltm/TranQuangKhai-22DH114583-LTMNC.pdf)

> [Source code](https://github.com/QuangKhaiHOT/LapTrinhMangNangCao)

Đồ án này xây dựng một hệ thống client-server bảo mật với các tính năng nổi bật sau:

1. **Xác thực mạnh mẽ thông qua chữ ký số:**
Hệ thống sử dụng thuật toán SHA256withRSA để tạo và xác minh chữ ký số. Mỗi yêu cầu từ client được ký bằng private key, cho phép server xác thực danh tính client và đảm bảo tính toàn vẹn của dữ liệu truyền đi.

2. **Mã hóa hai lớp bảo vệ dữ liệu:**
Khóa công khai (public key) của client được mã hóa bằng thuật toán AES-CBC trước khi truyền đi. Cơ chế này kết hợp ưu điểm của mã hóa đối xứng (hiệu suất cao) và bất đối xứng (bảo mật trong trao đổi khóa), đảm bảo dữ liệu nhạy cảm không bị lộ trong quá trình truyền tải.

3. **Bảo vệ kết nối end-to-end với TLS:**
Toàn bộ đường truyền giữa client và server được mã hóa thông qua giao thức TLS, ngăn chặn hiệu quả các tấn công nghe lén (eavesdropping) và tấn công trung gian (man-in-the-middle).

4. **Quản lý phiên làm việc an toàn:**
Mỗi client được định danh bằng một UUID duy nhất và có bộ khóa mã hóa (AES và IV) riêng biệt được lưu trữ an toàn. Cơ chế này cho phép hệ thống theo dõi và quản lý các phiên làm việc độc lập, đồng thời ngăn chặn việc sử dụng trái phép hay tấn công replay.

5. **Kiểm soát truy cập chặt chẽ:**
Chỉ những client nào vượt qua được quá trình xác thực chữ ký số và giải mã thành công mới được phép thực hiện tác vụ quét subdomain. Điều này đảm bảo rằng các tài nguyên và dịch vụ của server chỉ được truy cập bởi những client hợp lệ.

Thông qua việc kết hợp các công nghệ bảo mật hiện đại này, hệ thống không chỉ đáp ứng được yêu cầu về xác thực và bảo mật mà còn đảm bảo hiệu năng hoạt động ổn định trong môi trường thực tế.