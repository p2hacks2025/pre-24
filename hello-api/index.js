console.log("index.js loaded");//コンソール確認用[梨本]
const express = require("express");
const app = express();

// JSONを扱えるようにする[門脇]
app.use(express.json());

// 星座・期間の仮のデータベース（メモリ）[門脇]
const starSigns = [];
let nextStarSignID = 1;

//ユーザーの仮のデータベース[青木]
const users = [];
let nextUserID = 1;

//動作確認用[門脇]
app.get("/hello", (req, res) => {
  res.send("Hello World");
});

//ユーザー登録API[青木]
console.log("users API registered");//コンソール確認用[梨本]
app.post("/users", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      error: "必要な項目が不足しています"
    });
  }

  const user = {
    user_id: nextUserID,
    username,
    email,
    password
  };

  users.push(user);   // ← 追加[門脇]
  nextUserID++;       // ← 追加[門脇]

  res.json(user);     // ← 追加[門脇]
});


// ログインAPI（追加）[門脇]
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "ユーザー名またはパスワードが不足しています" });
  }

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "ユーザー名またはパスワードが違います" });
  }

  res.json({ message: "ログイン成功", user_id: user.user_id, username: user.username });
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
    id: nextStarSignID,
    user_id,
    star_name,
    start_date,
    end_date
  };

  //仮DBに保存[門脇]
  starSigns.push(data);

  //保存した内容を返す[門脇]
  res.json(starSigns);
});

// 星座一覧取得API[門脇]
app.get("/stars", (req, res) => {
  res.json(starSigns);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
