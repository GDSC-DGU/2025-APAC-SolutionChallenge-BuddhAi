// src/utils/handleDomCommandSafely.ts

export const handleDomCommandSafely = (command: string) => {
  console.log("[DOM] 안전 실행 시작:", command);

  // window.open("https://...")
  if (command.startsWith("window.open(")) {
    const match = command.match(/window\.open\(['"](.+?)['"]\)/);
    if (match?.[1]) {
      const url = match[1];
      window.open(url, "_blank");
      console.log("✅ 창 열림:", url);
      return;
    }
  }

  // document.querySelector("...").click()
  if (command.includes(".querySelector(") && command.endsWith(".click()")) {
    const selectorMatch = command.match(/querySelector\(['"](.+?)['"]\)/);
    const selector = selectorMatch?.[1];

    if (selector) {
      const el = document.querySelector(selector);
      if (el instanceof HTMLElement) {
        el.click();
        console.log("✅ 클릭 완료:", selector);
      } else {
        console.warn("⚠️ 선택된 요소가 없음 또는 클릭 불가:", selector);
      }
      return;
    }
  }

  // innerText 설정 예시: document.querySelector('...').innerText = '...'
  if (command.includes(".querySelector(") && command.includes(".innerText")) {
    const match = command.match(/querySelector\(['"](.+?)['"]\).*?innerText\s*=\s*['"](.*?)['"]/);
    if (match?.[1] && match[2]) {
      const el = document.querySelector(match[1]);
      if (el instanceof HTMLElement) {
        el.innerText = match[2];
        console.log(`✅ innerText 설정됨 → ${match[1]} = "${match[2]}"`);
      } else {
        console.warn("⚠️ 요소가 존재하지 않음:", match[1]);
      }
      return;
    }
  }

  // fallback
  console.warn("⚠️ 지원되지 않는 명령어 형식입니다:", command);
};
