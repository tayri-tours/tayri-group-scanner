const express = require("express");
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Tayri Group Scanner is running!");
});

// בעתיד נוסיף כאן קוד שיקבל הודעות מהקבוצות

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
const fs = require("fs");
const path = require("path");

// טען קבצי הגדרות
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json")));
const groups = JSON.parse(fs.readFileSync(path.join(__dirname, "groups.json")));

// סימולציה של הודעות נכנסות בקבוצות
const mockMessages = [
  { groupId: "123456789@g.us", sender: "דוד כהן", text: "יש לי מונית חזור מתל אביב לאשקלון ב-22:00" },
  { groupId: "987654321@g.us", sender: "משה", text: "נסיעה לירושלים פנויה" }
];

// בדוק אם טקסט כולל מילת מפתח
function hasKeyword(text) {
  return config.keywords.some(keyword => text.includes(keyword));
}

// סרוק הודעות
mockMessages.forEach(msg => {
  const group = groups.find(g => g.groupId === msg.groupId);
  if (!group) return;

  if (hasKeyword(msg.text)) {
    console.log("📣 נמצאה הודעה רלוונטית!");
    console.log(`📍 קבוצה: ${group.groupName}`);
    console.log(`👤 מפרסם: ${msg.sender}`);
    console.log(`💬 הודעה: ${msg.text}`);
    console.log(`[🔘 שלח עכשיו תגובה] [🔗 קישור להודעה]\n`);
  }
});
