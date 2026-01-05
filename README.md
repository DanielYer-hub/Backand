# Forge Your Path – Backend

מאגר זה מכיל את החלק **Backend** של הפרויקט **Forge Your Path**, שנבנה לצורך הדגמת יכולות Full-Stack.  
הפרויקט מדמה קמפיין נרטיבי בעולם Warhammer 40,000: משתמשים נרשמים, בוחרים פלג (Faction), מקבלים כוכבי לכת, יכולים לזרוק אתגר (Challenge) לשחקנים אחרים, לאשר קרבות ולקבל נקודות.

---

##  פונקציונליות

- **רישום והתחברות** (JWT, bcrypt)
- **ניהול משתמשים**: פרופיל, אזור, נקודות, כוכבי לכת
- **BattleLog**:
  - יצירת אתגר (Challenge)
  - קבלה / דחייה של קרב
  - חישוב אוטומטי של נקודות והעברת כוכבי לכת
- **Faction Notes**: הערות אישיות על הצבא נשמרות ב-MongoDB ומוצגות בפרופיל
- **Endpoints ניהוליים** (אפשר להרחבה)

---

##  טכנולוגיות בשימוש

- Node.js + Express  
- MongoDB + Mongoose  
- JWT (אימות והרשאות)  
- bcrypt (הצפנת סיסמאות)  
- nodemon (פיתוח)  
- dotenv (משתני סביבה)

---

##  התקנה והפעלה

### 1. שכפול הפרויקט
```bash
git clone https://github.com/DanielYer-hub/Backand.git
cd Backand
npm install
npx nodemon app.js
Endpoints עיקריים
Auth

POST /api/auth/register – רישום משתמש חדש

POST /api/auth/login – התחברות

GET /api/users/me – קבלת המשתמש הנוכחי

Users

GET /api/users/public/players – רשימת שחקנים (ללא המשתמש עצמו)

PATCH /api/users/me – עדכון פרטים (למשל Faction Notes)

BattleLog

POST /api/battlelog – יצירת אתגר

POST /api/battlelog/confirm – אישור קרב

POST /api/battlelog/cancel – ביטול קרב

GET /api/battlelog/incoming – אתגרים נכנסים

GET /api/battlelog/outgoing – אתגרים יוצאים

איך לבדוק

צרו 2 משתמשים (למשל PlayerA ו-PlayerB).

התחברו עם PlayerA → היכנסו לרשימת השחקנים → זרקו אתגר ל-PlayerB.

התחברו עם PlayerB → בלוח הבקרה יופיע אתגר נכנס → אשרו אותו.

לאחר בחירת תוצאת הקרב (ניצחון / הפסד / תיקו), הנקודות וכוכבי הלכת יתעדכנו אוטומטית.

פתחו את פרופיל המשתמש (PlayerCard ב-Frontend) כדי לראות את השינויים.
