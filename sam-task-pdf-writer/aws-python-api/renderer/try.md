# ยิงปืนนัดเดียวได้นกหลายตัว

ในสนามหญ้าที่กว้างใหญ่แห่งหนึ่ง แทนด้วยระนาบสองมิติ เราจะพิจารณาเฉพาะพิกัดจำนวนเต็มบนแกน $x$ จาก $0$ ถึง $p-1$ และพิกัดจำนวนเต็มบนแกน $y$ จาก $0$ ถึง $p-1$ เช่นกัน เราจะสามารถมองเห็นจุดได้หลายจุด (ทั้งหมด $p^2$ จุดพอดีที่สอดคล้องกับเงื่อนไขข้างต้น)

นักยิงปืนต้องการซ้อมยิงปืน โดยยิงจากบริเวณนอกสนาม (ยืนตรงไหนก็ได้นอกสนาม แม้พิกัดจะไม่เป็นจำนวนเต็มก็ตาม แล้วยิงเข้ามาในสนาม) กระสุนปืนจะทะลุสนามเป็นเส้นตรง

ผู้ฝึกต้องการฝึกพิเศษให้กับนักยิงปืน โดยผู้ฝึกได้จัดวางเป้าหมายนิ่ง คือ "นกนิ่ง" ไว้ทั้งหมด $p$ ตัวในสนามหญ้า (ต้องวางไว้ในพิกัดจำนวนเต็มระหว่าง $0$ ถึง $p-1$ เท่านั้น) โดยไม่มีนกนิ่งสองตัวใด ๆ อยู่ช่องเดียวกัน หลังจากที่ผู้ฝึกได้จัดวางนกนิ่งไว้บนตารางแล้ว นักยิงปืนจะเริ่มฝึก โดยเขาจะพยายามหาจุดยืนนอกสนามสักจุด แล้วยิงให้โดนนกนิ่งมากที่สุด เขาจะได้คะแนนเท่ากับจำนวนนกนิ่งที่เขายิงโดน

เพื่อความยาก เพราะเป็นการฝึกฝน ผู้ฝึกอยากให้ ไม่ว่านักยิงปืนจะพยายามอย่างไรก็ตาม ให้คะแนนมากที่สุดที่เขามีโอกาสทำได้ มีค่าน้อยที่สุดเท่าที่เป็นไปได้

อย่างไรก็ตาม แย่หน่อยที่สนามหญ้านั้นไม่ค่อยราบเรียบ โดยสนามหญ้านี้มีหลุมอยู่ทั้งหมด $F$ หลุม ผู้ฝึกนั้นไม่สามารถวางนกนิ่งไว้ที่พิกัดที่เป็นหลุมเหล่านี้ได้ เราเรียกพิกัดของแต่ละหลุมเป็น $(x[i], y[i])$ สำหรับจำนวนเต็ม $i$ ตั้งแต่ $0$ ถึง $F-1$

หากคุณเป็นผู้ช่วยผู้ฝึก คุณจะเสนอการจัดวาง "นกนิ่ง" ไว้ตรงไหนบ้างในสนามหญ้าเพื่อให้คะแนนมากสุดที่นักยิงปืนทำได้ มีค่าน้อยที่สุดเท่าที่เป็นไปได้

_หมายเหตุ_ ในข้อนี้มีวิธีการให้คะแนนที่แตกต่างจากปกติ ไม่จำเป็นต้องทำให้ได้คำตอบที่ดีที่สุดก็สามารถทำคะแนนได้

## รายละเอียดการเขียนโปรแกรม

คุณจะต้องเขียนฟังก์ชันต่อไปนี้:

```
void setup_birds(int p, int F, vector<int> x, vector<int> y)
```

-   จะมีการเรียกใช้ฟังก์ชันนี้เพียงครั้งเดียวเท่านั้น

```
void deploy_bird(int x, int y)
```

-   คุณสามารถเรียกใช้ฟังก์ชันนี้ได้ทั้งหมด $P$ ครั้งพอดี

## ข้อจำกัด

-   $2 \leq p \leq  50\,000$
-   $p$ เป็น **จำนวนเฉพาะ**
-   $0 \leq F &lt; p-1$
-   $0 \leq x[i], y[i] \leq p-1$ สำหรับทุกจำนวนเต็ม $0 \leq i &lt; F-1$

## ปัญหาย่อย

1. (17 คะแนน) $p \leq 8$
2. (24 คะแนน) $p \leq 80$ และ $F = 0$
3. (8 คะแนน) $p \leq 800$ และ $F = 0$
4. (16 คะแนน) $F = 0$
5. (5 คะแนน) $F = p-1$ โดย $x[i] = 0$ และ $y[i] = p-i-1$ สำหรับทุก $i$ ตั้งแต่ $0$ ถึง $F$
6. (30 คะแนน) ไม่มีเงื่อนไขเพิ่มเติม

## การให้คะแนน

สำหรับทุกปัญหาย่อยในข้อนี้ หากให้ $G$ แทนคะแนนเต็มของปัญหาย่อย พิจารณาข้อมูลทดสอบย่อยแต่ละข้อมูล หาก $T$ คือคะแนนมากสุดของนักยิงปืนที่น้อยที่สุดที่กรรมการสามารถหาได้ และ $S$ คือคะแนนมากสุดของนักยิงปืนที่น้อยที่สุดที่ผู้เข้าแข่งขันสามารถหาได้ ผู้เข้าแข่งขันจะได้คะแนน $\frac{GT}{S}$ คะแนนสำหรับข้อมูลทดสอบนี้ และคะแนนของปัญหาย่อยคือคะแนนน้อยสุดระหว่างคะแนนของข้อมูลทดสอบแต่ละข้อมูลในปัญหาย่อยเดียวกัน

## ตัวอย่าง

**<span style="color: red;">(ยังไม่เสร็จ)</span>**

## เกรดเดอร์ตัวอย่าง

**<span style="color: red;">(ยังไม่เสร็จ)</span>**

## Limits

-   Time limit: 1 second
-   Memory limit: 256 MB

# แนวคิด (เดี๋ยวลบ)

หลักๆ ผมดัดแปลงจากโจทย์ข้อนึงที่เพื่อนผมส่งมาให้ (Credit: เม้ง Gun Kongarttagarn) ซึ่งเขาก็ไปเอาไอเดียมาจาก Paul Erdős อีกที ดูเพิ่มเติมได้ที่ [<คลิกที่นี่>](https://en.wikipedia.org/wiki/No-three-in-line_problem) โจทย์ดั้งเดิมคือ จงพิสูจน์ว่าในตารางขนาด $p \times p$ เราสามารถเลือก $p$ จุดที่มีพิกัดเป็นจำนวนเต็ม ที่ไม่มีสามจุดใด ๆ อยู่บนเส้นตรงเดียวกันได้

ไอเดียเริ่มต้นคือ ลองสังเกตว่า หากผมเปลี่ยนคำถามเป็นว่าจุดทั้ง $p$ จุดนั้นไม่จำเป็นต้องเป็นจำนวนเต็ม เรามองเป็นจำนวนจริงแทน เราจะทำอย่างไร วิธีที่ง่ายมาก ๆ อันนึงที่ผมคิดออกทันทีคือวาดกราฟ $y = x^2$ หรืออะไรแนว ๆ นี้ หากเราใส่ $x$ ลงไปต่างกัน เราจะได้ $y$ ออกมาต่างกัน แล้วสังเกตว่าไม่มีเส้นตรงเส้นไหนเลยในระนาบที่ตัดกับกราฟ $y = x^2$ เกิน $2$ จุด จึงได้ว่าถ้าเราหยิบจุดมั่ว ๆ ออกมาจากกราฟนี้ $p$ จุด มันจะไม่ collinear แน่ ๆ

แต่ไอเดียเดียวกันนี้เอง พอไปมองกราฟ $y = x^2$ บน $x, y \in \Z_p$ (ก่อนหน้านี้มอง $x, y \in \R$) จะได้ว่าสมบัติที่ว่าไม่มีเส้นตรงเส้นไหนเลยในระนาบที่ตัดกับกราฟนี้เกิน $2$ จุดนั้นยังคงอยู่ (อาจต้องพิสูจน์นิดหน่อย แต่ไอเดียคือเส้นมันดีกรี $2$ มันเลยไม่มีทางที่จะมีเส้นตรงที่ตัดผ่านเกินนี้ได้ ไม่ว่า domain จะเป็น field อะไรก็ตาม)

เราจึงมี constructive algorithm ที่ solve เคส $F = 0$ ได้และรันในเวลา $\mathcal{O}(p)$ ต่อมาเราอยากป้องกันไม่ให้มันไปชนจุดที่เราห้ามไว้ซึ่งมีอยู่ $F \leq p-1$ จุด พิจารณาพหุนาม $P_c(x) = x^2 + c$ หากคิดแบบตอนแรก เราจะสนใจเพียง $y = P_0(x)$ เท่านั้น คราวนี้ผมเคลมว่าสำหรับทุก $c \in \Z_p$ นั้น เซต $S_c = \{(x, P_c(x)) \colon x \in \Z_p\}$ จะไม่มีจุดสามจุดบนเส้นตรงเดียวกัน เหตุผลของข้ออ้างนี้ยังคงเป็นเหตุผลเดิมว่า หากมอง $P_c$ ใน $\R$ แทน $\Z_p$ แล้วจะเห็นได้เลยว่ามันก็แค่เลื่อน $P_0$ เพิ่มไป $c$ หน่วย

ต่อมาผมเคลมว่ามี $c \in \Z_p$ ที่ $S_c$ ไม่มีจุดต้องห้ามเลย จะแสดงโดยข้อขัดแย้งดังนี้ สมมติว่าทุก $c \in \Z_p$ นั้น $S_c$ มีจุดต้องห้ามเสมอ เนื่องจากเรารู้แล้วว่า $\{S_i\}_{i=0}^{p-1}$ นั้น pairwise disjoint จึงทำให้รู้ว่าถ้า $S_c$ จุดต้องห้ามสำหรับทุก $c$ แล้วจุดต้องห้ามทั้งหมดจะมีอย่างน้อย $p$ จุด ขัดแย้งกับที่โจทย์กำหนดไว้ว่ามีไม่เกิน $p-1$ จุด

## โบนัส (ไม่รู้ทำได้มั้ย?)

ถ้า $F \geq p$ จะเกิดอะไรขึ้น เราจะ bound ไว้ได้แค่ไหน (ยังไม่ได้คิด ไว้ว่าง ๆ จะคิดต่อ) หรือต่อให้มันไม่ collinear แล้ว เราจะ bound minimum score ของนักยิงปืน ไว้ได้แค่ไหน เทียบกับ $F$ ที่เพิ่มขึ้นเรื่อย ๆ จนถึง $p^2-p$

_หมายเหตุ_ แต่เอาจริง ๆ ผมว่าถ้า $F \geq p$ มันจะเริ่มไม่แฟร์แล้ว เพราะเราสามารถ generate solution โดยใช้ polynomial แปลก ๆ แล้วอัดของที่ไม่อยู่ใน solution เข้า $F$ ไป แล้วต้องให้ผู้เข้าแข่งขันมานั่งเดาเอาให้มันได้ เว้นแต่ว่ามันจะมีวิธีที่ justified แล้วว่าจะมอบ optimal solution ให้เสมอไม่ว่าจุดต้องห้ามทั้ง $F$ จุด หน้าตาเป็นยังไง
