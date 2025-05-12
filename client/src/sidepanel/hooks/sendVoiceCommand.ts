import { getCurrentHtmlFile } from '../utils/getCurrentHtmlFile';

let retryCount = 0;
const MAX_RETRY = 3;

export const sendVoiceCommand = async (htmlFile: File, audioFile: File): Promise<void> => {
  const formData = new FormData();
  formData.append('htmlFile', htmlFile);
  formData.append('commandFile', audioFile);

  try {
    const res = await fetch('https://famous-blowfish-plainly.ngrok-free.app/api/v3/command', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    console.log('[API] 응답 수신:', data);

    const responseDto = data.responseDto;
    if (!responseDto) {
      console.warn('⚠️ responseDto 없음');
      return;
    }

    if (responseDto.success === false) {
      retryCount += 1;
      console.warn(`[API] 실패 응답 (${retryCount}/${MAX_RETRY})`);

      if (retryCount >= MAX_RETRY) {
        console.error('최대 재시도 횟수 도달. 시스템 중단 또는 초기화 필요');
        retryCount = 0;

        // 여기에서 시스템 리셋 로직 수행 (예시)
        chrome.runtime.sendMessage({ type: 'RESET_SYSTEM' });
        return;
      }

      const newHtmlFile = getCurrentHtmlFile();
      return await sendVoiceCommand(newHtmlFile, audioFile); // 재귀 호출
    }

    retryCount = 0; 

    let domCommand = responseDto.domCommand;
    if (responseDto.singleCommand) {
      console.log('[API] singleCommand 감지 → domCommand 덮어쓰기');
      domCommand = responseDto.singleCommand;
    }

    if (!domCommand) {
      console.warn('⚠️ domCommand 없음');
      return;
    }

    // 명령어 메시지 전송
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (!currentTab?.id || currentTab.url?.startsWith('chrome-extension://')) {
        console.warn('확장 내부 탭에서는 메시지 전송 불가');
        return;
      }

      chrome.tabs.sendMessage(currentTab.id, {
        type: 'DOM_COMMAND',
        domCommand,
      });

      chrome.runtime.sendMessage({
        type: 'FROM_POPUP',
        message: '팝업에서 보냄',
      });

      console.log('[Message] domCommand 전달됨:', domCommand);
    });
  } catch (err) {
    console.error('[API] 전송 실패:', err);
  }
};
