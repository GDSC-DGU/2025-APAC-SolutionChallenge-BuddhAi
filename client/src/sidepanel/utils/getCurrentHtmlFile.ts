export const getCurrentHtmlFile = (): File => {
  const htmlString = document.documentElement.outerHTML; // 전체 HTML 문자열
  const blob = new Blob([htmlString], { type: "text/html" });

  const file = new File([blob], "page.html", {
    type: "text/html",
    lastModified: Date.now(),
  });

  console.log("[HTML] 현재 DOM을 HTML 파일로 생성:", file);
  return file;
};
