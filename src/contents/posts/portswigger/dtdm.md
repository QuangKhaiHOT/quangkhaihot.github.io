---
title: Điện toán đám mây
published: 2025-08-05
description: Tìm hiểu về Kubernetes (K8s).
tags: [projects, cloud]
category: Projects
draft: false
cover: '/projects/dtdm/k8s.jpg'
---

# Điện toán đám mây

> [File báo cáo - Điện toán đám mây](/public/projects/dtdm/Final_Report_TranQuangKhai_22DH114583.pdf)

Đồ án này được thực hiện với mục tiêu nghiên cứu và ứng dụng Kubernetes (K8s) – nền tảng điều phối container hàng đầu trong ngành – để xây dựng một hệ thống dịch vụ web hoàn chỉnh, từ đơn giản đến phức tạp, có khả năng mở rộng và phục hồi cao.

Trong khuôn khổ đồ án, em đã thực hiện các nội dung chính sau:

* Tìm hiểu lý thuyết: Nắm vững kiến thức về kiến trúc, thành phần và cách thức hoạt động của Kubernetes.

* Xây dựng cụm cluster: Cài đặt thủ công cụm Kubernetes gồm 1 master và 2 worker node trên nền tảng Google Cloud Platform (GCP) sử dụng kubeadm.

* Triển khai ứng dụng:

  * Static Web: Triển khai website tĩnh sử dụng Nginx, quản lý thông qua Deployment và Service.

  * Dynamic Web (WordPress): Triển khai WordPress kết nối với cơ sở dữ liệu MySQL, sử dụng Persistent Volume để lưu trữ dữ liệu.

* Backup và Restore: Sử dụng Velero kết hợp với Minio để sao lưu và phục hồi dữ liệu tự động.

Thông qua đồ án đã giúp em hiểu sâu về cách vận hành một hệ thống điều phối container, đồng thời trau dồi kỹ năng triển khai thực tế, quản lý tài nguyên và đảm bảo khả năng sẵn sàng cho ứng dụng.
