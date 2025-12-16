const express = require("express");
const app = express();

// JSONを扱えるようにする[門脇]
app.use(express.json());

// 仮のデータベース（メモリ）[門脇]
const starSelections = [];

//動作確認用[門脇]
app.get("/hello", (req, res) => {
  res.send("Hello World");
});

//星座・期間保存API[門脇]
app.post("/stars", (req, res) => {
  const { user_id, star_name, start_date, end_date } = req.body;

  //[未確定]入力チェック[門脇]
  if (!user_id || !star_name || !start_date || !end_date) {
    return res.status(400).json({
      error: "必要な項目が不足しています"
    });
  }

  const data = {
    user_id,
    star_name,
    start_date,
    end_date
  };

  //仮DBに保存[門脇]
  starSelections.push(data);

  //保存した内容を返す[門脇]
  res.json(data);
});

// 星座一覧取得API[門脇]
app.get("/stars", (req, res) => {
  res.json(starSelections);
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
