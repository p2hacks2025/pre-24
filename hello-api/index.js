require("dotenv").config({
  path: __dirname + "/.env"
});

const multer = require("multer");
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

/* ===== ミドルウェア ===== */
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); //画像表示


const storage = multer.diskStorage({
  destination: (req, file, cb) => {  //写真アップロード時 → 自動でuploadsの空フォルダに画像が入る
   cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "_" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// ★ これが無いとHTMLが表示されない
app.use(express.static(
  path.join(__dirname, "../frontend")
));

/* ===== 仮DB ===== */
const starSigns = [];
let nextStarSignID = 1;

const users = [];
let nextUserID = 1;

/* ===== API ===== */

/*地図ピン
牡羊座（４か所）：五稜郭タワー、キャンバス、千代台公園、昭和公園
かに座（５か所）：函館駅、トランジスタカフェ、函館公園、函館八幡宮、住三吉神社
*/
app.get("/map", (req, res) => {
  res.json([
    { lat: 41.79470986501921, lng: 140.75401999577832, title: "五稜郭タワー" },
    { lat: 41.788607340877235, lng: 140.7533117029856, title: "キャンバス" },
    { lat: 41.78594661256195, lng: 140.7459269137736, title: "千代台公園" },
    { lat: 41.81513784377538, lng: 140.72646217529504, title: "昭和公園" },
    { lat: 41.77381185030415, lng: 140.72645862587342, title: "函館駅" },
    { lat: 41.76224261619561, lng: 140.71720025344823, title: "トランジスタカフェ" },
    { lat: 41.75640659598397, lng: 140.71582306694003, title: "函館公園" },
    { lat: 41.75406576460119, lng: 140.70987519962205, title: "八幡宮" },
    { lat: 41.749027741981855, lng: 140.7160248132717, title: "住三吉神社" }
    
  ]);
});

// 動作確認
app.get("/hello", (req, res) => {
  res.send("Hello World");
});

// Google Maps APIキー
app.get("/maps", (req, res) => {
  console.log("ENV:", process.env.GOOGLE_MAPS_API_KEY);
  res.json({
    apiKey: process.env.GOOGLE_MAPS_API_KEY
  });
});

// ユーザー登録
app.post("/users", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "必要な項目が不足しています" });
  }

  const user = {
    user_id: nextUserID++,
    username,
    email,
    password
  };

  users.push(user);
  res.json(user);
});

// ログイン
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "ログイン失敗" });
  }

  res.json({
    message: "ログイン成功",
    user_id: user.user_id,
    username: user.username
  });
});

// 星座保存
app.post("/stars", (req, res) => {
  const { user_id, star_name, start_date, end_date } = req.body;

  if (!user_id || !star_name || !start_date || !end_date) {
    return res.status(400).json({ error: "必要な項目が不足しています" });
  }

  const data = {
    id: nextStarSignID++,
    user_id,
    star_name,
    start_date,
    end_date
  };

  starSigns.push(data);
  res.json(starSigns);
});

// 星座一覧
app.get("/stars", (req, res) => {
  res.json(starSigns);
});

//写真保存
app.post("/upload", upload.single("photo"), (req, res) => {
  console.log("upload API called");
  console.log(req.file);

  if (!req.file) {
    return res.status(400).json({ error: "ファイルがありません" });
  }

  res.json({
    message: "アップロード成功",
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`
  });
});


/* ===== 起動 ===== */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

