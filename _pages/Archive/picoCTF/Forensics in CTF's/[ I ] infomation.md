---
title: "[ I ] infomation"
thumbnail: "/assets/img/thumbnail/pico/picoctf.png"
tags: [CTFs,forensics]
date: 2025-05-02

---

# Challenge
--- 

## Description
Files can always be changed in a secret way. Can you find the flag?
![Tropical Paradise](/assets/img/forensics/cat.jpg "Cat")

## Hint
1. Look at the details of the file
2. Make sure to submit the flag as picoCTF{XXXXX}

## Analysis
Base on hint, start examining the image details using **<code>exiftool</code>** on Kali Linux
The output obtained after running exiftool:
```
ExifTool Version Number         : 13.10
File Name                       : cat.jpg
Directory                       : .
File Size                       : 878 kB
File Modification Date/Time     : 2025:04:26 02:12:48-04:00
File Access Date/Time           : 2025:05:01 23:31:00-04:00
File Inode Change Date/Time     : 2025:04:26 02:12:48-04:00
File Permissions                : -rw-rw-r--
File Type                       : JPEG
File Type Extension             : jpg
MIME Type                       : image/jpeg
JFIF Version                    : 1.02
Resolution Unit                 : None
X Resolution                    : 1
Y Resolution                    : 1
Current IPTC Digest             : 7a78f3d9cfb1ce42ab5a3aa30573d617
Copyright Notice                : PicoCTF
Application Record Version      : 4
XMP Toolkit                     : Image::ExifTool 10.80
License                         : cGljb0NURnt0aGVfbTN0YWRhdGFfMXNfbW9kaWZpZWR9
Rights                          : PicoCTF
Image Width                     : 2560
Image Height                    : 1598
Encoding Process                : Baseline DCT, Huffman coding
Bits Per Sample                 : 8
Color Components                : 3
Y Cb Cr Sub Sampling            : YCbCr4:2:0 (2 2)
Image Size                      : 2560x1598
Megapixels                      : 4.1
```
By examining the obtained, we can see the line:
**<code>License: cGljb0NURnt0aGVfbTN0YWRhdGFfMXNfbW9kaWZpZWR9</code>** this is a **Base64-encode string** .
By encoding the string, we will get: 
**<code>picoCTF{the_m3tadata_1s_modified}</code>**
## Flag
> picoCTF{the_m3tadata_1s_modified}
