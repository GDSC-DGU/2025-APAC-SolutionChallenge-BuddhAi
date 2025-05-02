console.log("[ContentScript] 페이지 로딩 완료");

const allButtons = document.querySelectorAll("button");
console.log("페이지의 버튼 목록:", allButtons);

const allLinks = document.querySelectorAll("a");
console.log("페이지의 링크 목록:", allLinks);
