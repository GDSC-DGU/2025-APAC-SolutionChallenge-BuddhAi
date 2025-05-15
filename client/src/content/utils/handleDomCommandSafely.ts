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

      // 공통 retryClick 유틸
const retryClick = (selector: string, maxTry = 5, interval = 300) => {
  let attempt = 0;
  const tryClick = () => {
    const el = document.querySelector(selector);
    if (el instanceof HTMLElement) {
      el.click();
      console.log(`✅ 클릭 성공 (재시도 ${attempt}회): ${selector}`);
    } else if (attempt < maxTry) {
      attempt++;
      console.warn(`⏳ 클릭 재시도 (${attempt}/${maxTry}): ${selector}`);
      setTimeout(tryClick, interval);
    } else {
      console.error(`❌ 클릭 실패: ${selector} - ${maxTry}회 시도 후 포기`);
    }
  };
  tryClick();
      };
      
      // 2. .click()
if (line.includes('.click()')) {
  const selectorMatch = line.match(/querySelector\((['"`].+?['"`])\)/);
  const selector = selectorMatch?.[1]?.slice(1, -1);
  if (!selector) {
    console.error(`❌ 클릭 selector 파싱 실패: ${line}`);
    continue;
  }

  // 자동 재시도 클릭
  retryClick(selector);
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

      if (line.includes('document.evaluate')) {
        try {
          const match = line.match(/document\.evaluate\((.+?)\)\.singleNodeValue\.click\(\)/);
          if (!match) throw new Error('XPath 파싱 실패');
      
          const evalArgs = match[1]; // 괄호 안 전체 문자열
          const fn = new Function(`
            const result = document.evaluate(${evalArgs});
            const el = result.singleNodeValue;
            if (el instanceof HTMLElement) {
              el.click();
              console.log("✅ XPath 클릭 성공");
            } else {
              console.warn("⚠️ XPath로 요소를 찾지 못함");
            }
          `);
      
          fn();
        } catch (e) {
          console.error('❌ XPath 명령어 실행 실패:', e);
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