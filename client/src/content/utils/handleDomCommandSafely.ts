export const handleDomCommandSafely = (command: any) => {
  console.log("[DOM] 안전 실행 시작:", command);

  if (typeof command !== "string") {
    console.warn("❌ domCommand는 문자열이 아님:", command);
    return;
  }

  // 1. 직접 실행 시도 -> 버전 이슈로 안 됨.
  try {
    console.log("🧪 eval 시도 중:", command);
    // eslint-disable-next-line no-eval
    eval(command);
    console.log("✅ eval 실행 성공");
    return;
  } catch (err) {
    console.warn("⚠️ eval 실행 실패. fallback 실행 시도:", err);
  }

  // 2. fallback 처리 시작

  const lines = command
    .split(';')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  for (const line of lines) {
    try {
      // 1. window.open("...")
      if (line.startsWith('window.open(')) {
        const match = line.match(/window\.open\(['"](.+?)['"]\)/);
        const url = match?.[1];
        if (url) {
          window.open(url, '_blank');
          console.log(`✅ 창 열림: ${url}`);
        } else {
          console.warn('⚠️ window.open 파싱 실패:', line);
        }
        continue;
      }

      // 2. .click()
      if (line.includes('.click()')) {
        const selectorMatch = line.match(/querySelector\((['"`].+?['"`])\)/);
        const selector = selectorMatch?.[1]?.slice(1, -1);
        if (!selector) throw new Error(`클릭 selector 파싱 실패: ${line}`);

        const el = document.querySelector(selector);
        if (el instanceof HTMLElement) {
          el.click();
          console.log(`✅ 클릭 완료: ${selector}`);
        } else {
          console.warn(`⚠️ 클릭 요소 없음 or 클릭 불가: ${selector}`);
        }
        continue;
      }

      // 3. .value = "..."
      if (line.includes('.value =')) {
        const selectorMatch = line.match(/querySelector\((['"`].+?['"`])\)/);
        const valueMatch = line.match(/\.value\s*=\s*(['"`])(.*?)\1/);
        const selector = selectorMatch?.[1]?.slice(1, -1);
        const value = valueMatch?.[2];

        if (!selector || value === undefined) {
          throw new Error(`값 설정 파싱 실패: ${line}`);
        }

        const el = document.querySelector(selector);
        if (
          el instanceof HTMLInputElement ||
          el instanceof HTMLTextAreaElement ||
          (el && 'value' in el)
        ) {
          (el as HTMLInputElement).value = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          console.log(`✅ 값 설정 완료: ${selector} → "${value}"`);
        } else {
          console.warn(`⚠️ 값 설정 불가 또는 요소 없음: ${selector}`);
        }
        continue;
      }

      // 4. .innerText = "..."
      if (line.includes('.innerText')) {
        const selectorMatch = line.match(/querySelector\((['"`].+?['"`])\)/);
        const valueMatch = line.match(/\.innerText\s*=\s*(['"`])(.*?)\1/);
        const selector = selectorMatch?.[1]?.slice(1, -1);
        const value = valueMatch?.[2];

        if (!selector || value === undefined) {
          throw new Error(`innerText 설정 파싱 실패: ${line}`);
        }

        const el = document.querySelector(selector);
        if (el instanceof HTMLElement) {
          el.innerText = value;
          console.log(`✅ innerText 설정 완료: ${selector} → "${value}"`);
        } else {
          console.warn(`⚠️ innerText 설정 불가 또는 요소 없음: ${selector}`);
        }
        continue;
      }

      // 5. fallback
      console.warn('⚠️ 지원되지 않는 명령어:', line);
    } catch (e) {
      console.error(`❌ 명령어 실행 실패 [${line}]:`, e);
    }
  }
};