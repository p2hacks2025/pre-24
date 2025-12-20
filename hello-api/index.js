require("dotenv").config({
  path: __dirname + "/.env"
});

/*==ライブラリ読み取り==*/
const multer = require("multer"); //写真アップロード
const express = require("express"); //サーバー本体
const cors = require("cors"); //フロントと通信
const path = require("path"); //OS依存しないパス操作
const fs = require("fs"); //ファイルの読み書き
const app = express();
const FILE = path.join(__dirname, "albumComments.json"); //コメントをJSONファイルに保存

/* ===== ミドルウェア ===== */
app.use(cors()); //フロントからの通信を許可
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); //画像表示


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const star = req.query.star || "default";
    const dir = path.join(__dirname, "uploads", star);
    fs.mkdirSync(dir, { recursive: true }); // フォルダなければ作る
    cb(null, dir);
  },
  filename: (req, file, cb) => {
  const userId = req.body.user_id || "guest";
  const uniqueName = `${userId}_${Date.now()}_${file.originalname}`;
  cb(null, uniqueName);
}
});

const upload = multer({ storage });

//これが無いとHTMLが表示されない
app.use(express.static(
  path.join(__dirname, "../frontend")
));

/* ===== 仮DB ===== */
const starSigns = [];
let nextStarSignID = 1;

const users = [];
let nextUserID = 1;

let albumComments = [];

if(fs.existsSync(FILE)){
  try{
    albumComments = JSON.parse(fs.readFileSync(FILE, "utf-8"));
  }
  catch(err){
    console.error("albumComments.jsonの読み込みに失敗しました", err);
    albumComments = [];
  }
}

/* ===== API ===== */

/* マップ */

// 牡羊座（４か所）：五稜郭タワー、キャンバス、千代台公園、昭和公園
// かに座（５か所）：函館駅、トランジスタカフェ、函館公園、函館八幡宮、住三吉神社

//　座標を返す
const mapPins = {
  aries:{ //牡羊座
    stars: [
      {id: 1, lat: 41.79470986501921, lng: 140.75401999577832, title: "五稜郭タワー"},
      {id: 2, lat: 41.788607340877235, lng: 140.7533117029856, title: "キャンバス"},
      {id: 3, lat: 41.78594661256195, lng: 140.7459269137736, title: "千代台公園"},
      {id: 4, lat: 41.81513784377538, lng: 140.72646217529504, title: "昭和公園"}
    ],
    lines: [
      [1, 2],
      [2, 3],
      [3, 4]
    ]
  },

  cancer:{
    stars:[
      {id: 1, lat: 41.77381185030415, lng: 140.72645862587342, title: "函館駅"},
      {id: 2, lat: 41.76224261619561, lng: 140.71720025344823, title: "トランジスタカフェ"},
      {id: 3, lat: 41.75640659598397, lng: 140.71582306694003, title: "函館公園"},
      {id: 4, lat: 41.75406576460119, lng: 140.70987519962205, title: "八幡宮"},
      {id: 5, lat: 41.749027741981855, lng: 140.7160248132717, title: "住三吉神社"}
    ],
    lines:[
      [1, 2],
      [2, 3],
      [3, 4],
      [3, 5]
    ]
  }
};

//　星座ごとのマップ情報を取得
app.get("/map/:starsign", (req,res) => {
  const {starsign} = req.params;

  const pins = mapPins[starsign];

  if(!pins){
    return res.status(404).json({error: "対応する星座がありません"});
  }

  res.json(pins);
});

//　動作確認
app.get("/hello", (req, res) => {
  res.send("Hello World");
});

//　星座ごとの画像一覧取得
app.get("/images", (req, res) => {
  const star = req.query.star;
  if (!star) {
    return res.status(400).json({ error: "starが指定されていません" });
  }

  const dir = path.join(__dirname, "uploads", star);

  if (!fs.existsSync(dir)) {
    return res.json([]); //フォルダがなければ空
  }

  const files = fs.readdirSync(dir);

  //画像URLに変換
  const imageUrls = files.map(file =>
    `/uploads/${star}/${file}`
  );

  res.json(imageUrls);
});

//　Google Maps
app.get("/maps", (req, res) => {
  console.log("ENV:", process.env.GOOGLE_MAPS_API_KEY);
  res.json({
    apiKey: process.env.GOOGLE_MAPS_API_KEY
  });
});

/* ユーザー情報 */
// ユーザー
app.post("/users", (req, res) => {
  const {username, email, password} = req.body;

  if(!username || !email || !password) {
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

// POSTログイン
app.post("/login", (req, res) => {
  const {username, password} = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if(!user) {
    return res.status(401).json({ error: "ログイン失敗" });
  }

  res.json({
    message: "ログイン成功",
    user_id: user.user_id,
    username: user.username
  });
});

// GETログイン
app.get("/login", (req, res) => {
  const { username, password } = req.query;

  if (!username || !password) {
    return res.status(400).json({
      error: "username または password が不足しています"
    });
  }

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


//　星座保存
app.post("/stars", (req, res) => {
  const {user_id, star_name, start_date, end_date} = req.body;

  if(!user_id || !star_name || !start_date || !end_date) {
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

/* アルバム */

//写真保存
app.post("/upload", upload.single("photo"), (req, res) => {
  console.log("upload API called");

  //動作確認用
  console.log("query.star =", req.query.star);
  console.log("body.star =", req.body.star);
  console.log(req.file);


  if(!req.file) {
    return res.status(400).json({ error: "ファイルがありません" });
  }

  const star = req.body.star || "default";

  const userId = req.body.user_id || "guest";
  const filePath = `/uploads/${star}/${userId}/${req.file.filename}`;

  res.json({
    message: "アップロード成功",
    filename: req.file.filename,
    path: filePath
  });
});

//星座ごとの写真一覧取得
app.get("/photos/:star/:userId", (req, res) => {
  const { star, userId } = req.params;
  const dir = path.join(__dirname, "uploads", star, userId);

  if (!fs.existsSync(dir)) return res.json([]);

  const files = fs.readdirSync(dir).map(f => ({
    path: `/uploads/${star}/${userId}/${f}`
  }));

  res.json(files);
});

// コメント取得（表示用）
app.get("/albums/:star/comment", (req, res) => {
  const {star} = req.params;

  const comment  = albumComments.find(c => c.star === star);

  if(!comment){
    return res.json({content: ""});
  }

  res.json({
    content: comment.content,
    updated_at: comment.updated_at
  });
});

// コメント保存
app.put("/albums/:star/comment", (req, res) => {
  const {star} = req.params;
  const {content} = req.body;

  const existing = albumComments.find(c => c.star === star);

  if(existing){
    existing.content = content ?? "";
    existing.updated_at = new Date().toISOString();
  }
  else{
    albumComments.push({
      star,
      content: content ?? "",
      updated_at: new Date().toISOString()
    });
  }
  fs.writeFileSync(FILE, JSON.stringify(albumComments, null, 2));

  res.json({message: "コメントを保存しました"})
})

/* ===== 起動 ===== */

console.log("index.js loaded");

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});