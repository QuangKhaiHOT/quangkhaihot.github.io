---
title: Bảo mật người dùng cuối
published: 2025-07-07
description: Đồ án xây dựng hệ thống bảo mật người dùng cuối.
tags: [projects, network]
category: Projects
draft: false
cover: '/projects/bmndc/endpoint.png'
---

# Bảo mật người dùng cuối

> [File báo cáo - Bảo mật người dùng cuối](/public/projects/bmndc/TranQuangKhai-22DH114583-BMNDC.pdf)

Đồ án này tập trung vào việc xây dựng và triển khai một hệ thống bảo mật toàn diện cho thiết bị đầu cuối (Endpoint), kết hợp giữa giải pháp IDS/IPS (Suricata trên pfSense) và giám sát hành vi hệ thống (Wazuh) để phát hiện, ngăn chặn và phản ứng với các mối đe dọa an ninh mạng.

Mục tiêu chính:

* Bảo vệ hệ thống mạng nội bộ khỏi các tấn công phổ biến như DDoS, Brute-force SSH.

* Giám sát và phát hiện phần mềm độc hại, tiến trình bất thường trên các thiết bị đầu cuối.

* Tích hợp VirusTotal để tự động phân tích và xử lý file nghi ngờ.

* Xây dựng mô hình bảo mật đa lớp, kết hợp giữa bảo vệ mạng và bảo vệ thiết bị.

Công nghệ sử dụng:

* Suricata (trên pfSense) để giám sát lưu lượng mạng, phát hiện và chặn tấn công.

* Wazuh để giám sát hành vi hệ thống, kiểm tra tính toàn vẹn file, và tích hợp cảnh báo.

* VirusTotal API để quét và xác minh mã độc.

* Các rule tùy chỉnh cho Suricata và Wazuh để phát hiện tấn công chuyên sâu.

Tính năng nổi bật:

* Phát hiện tấn công mạng: DDoS, SSH Brute-force, port scanning.

* Giám sát endpoint: Theo dõi tiến trình, file, log hệ thống.

* Tự động phản ứng: Xóa file độc hại, chặn IP tấn công.

* Cảnh báo thời gian thực: Gửi alert qua giao diện Wazuh và Suricata.

* Bảo vệ toàn diện: Từ mạng đến thiết bị cuối, ngăn chặn cả tấn công từ bên ngoài và nội bộ.

Đồ án không chỉ mang tính học thuật mà còn có giá trị ứng dụng thực tiễn cao, có thể triển khai trong các mô hình mạng doanh nghiệp vừa và nhỏ để tăng cường an ninh mạng một cách chủ động và hiệu quả.