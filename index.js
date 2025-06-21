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
