const stars = document.getElementById("stars");

// 星を生成
function createStars() {
  if (!stars) return;

  stars.innerHTML = "";
  for (let i = 0; i < 60; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.top = Math.random() * 100 + "%";
    star.style.left = Math.random() * 100 + "%";
    star.style.animationDelay = Math.random() * 3 + "s";
    stars.appendChild(star);
  }
}

// 初期化
const starOn = localStorage.getItem("starEffect") !== "off";
if (starOn) {
  createStars();
}
