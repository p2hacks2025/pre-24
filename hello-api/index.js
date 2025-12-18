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

// 地図ピン
app.get("/map", (req, res) => {
  res.json([
    { lat: 35.681236, lng: 139.767125, title: "東京駅" },
    { lat: 35.689592, lng: 139.700413, title: "新宿" }
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

console.log("index.js loaded");

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

