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

> [File báo cáo - Bảo mật người dùng cuối](https://quangkhaihot.github.io/projects/bmndc/TranQuangKhai-22DH114583-BMNDC.pdf)

Đồ án này tập trung vào việc xây dựng và triển khai một hệ thống bảo mật toàn diện cho **thiết bị đầu cuối (Endpoint)**, kết hợp giữa **IDS/IPS (Suricata trên pfSense)** và **Wazuh** để phát hiện, ngăn chặn và phản ứng với các mối đe dọa an ninh mạng.

## Mục tiêu chính:

* Bảo vệ hệ thống mạng nội bộ khỏi các tấn công như **DDoS**, **Brute-force SSH**.  
* Giám sát và phát hiện phần mềm độc hại, tiến trình bất thường trên thiết bị đầu cuối.  
* Tích hợp **VirusTotal** để phân tích và xử lý file nghi ngờ.  
* Xây dựng mô hình bảo mật đa lớp, kết hợp giữa bảo vệ mạng và bảo vệ thiết bị.  

## Công nghệ sử dụng:

* **Suricata** để giám sát lưu lượng và chặn tấn công.  
* **Wazuh** để giám sát hành vi hệ thống và cảnh báo.  
* **VirusTotal API** để quét và xác minh mã độc.  
* Rule tùy chỉnh cho Suricata và Wazuh để phát hiện tấn công chuyên sâu.  

## Tính năng nổi bật:

* Phát hiện tấn công: **DDoS**, **SSH Brute-force**, port scanning.  
* Giám sát endpoint: tiến trình, file, log hệ thống.  
* Tự động phản ứng: xóa file độc hại, chặn IP tấn công.  
* Cảnh báo thời gian thực qua giao diện của Wazuh và Suricata.  
* Bảo vệ toàn diện: từ mạng đến thiết bị cuối, ngăn chặn cả bên ngoài lẫn nội bộ.  

---

Đồ án không chỉ mang tính học thuật mà còn có giá trị ứng dụng thực tiễn, có thể triển khai trong các mô hình mạng doanh nghiệp vừa và nhỏ để tăng cường an ninh mạng một cách chủ động và hiệu quả.
