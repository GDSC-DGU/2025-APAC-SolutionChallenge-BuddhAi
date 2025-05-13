import { getCurrentHtmlFile } from '../utils/getCurrentHtmlFile';

let retryCount = 0;
const MAX_RETRY = 3;
let callCount = 0; // 호출 횟수 카운터


export const sendVoiceCommand = async (htmlFile: File, audioFile: File): Promise<void> => {
  const formData = new FormData();
  formData.append('htmlFile', htmlFile);
  formData.append('commandFile', audioFile);

   // 호출 횟수에 따라 엔드포인트 결정
   const version = callCount % 2 === 0 ? 'mailsender-1' : 'mailsender-2';
   const endpoint = `https://famous-blowfish-plainly.ngrok-free.app/api/v3/${version}`;
   callCount++;
  
  try {
     const res = await fetch(endpoint, {

    // const res = await fetch('https://famous-blowfish-plainly.ngrok-free.app/api/v3/command', {
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

  
    if (responseDto.singleCommand !== true) {
      retryCount += 1;
      console.warn(`[API] 실행 불가 응답 (${retryCount}/${MAX_RETRY})`);

      if (retryCount >= MAX_RETRY) {
        console.error('❌ 최대 재시도 도달. 시스템 초기화 요청');
        retryCount = 0;
        chrome.runtime.sendMessage({ type: 'RESET_SYSTEM' });
        return;
      }

      const newHtmlFile = getCurrentHtmlFile();
      return await sendVoiceCommand(newHtmlFile, audioFile); 
    }

    retryCount = 0; 

    const domCommand = responseDto.domCommand;

    if (typeof domCommand !== 'string' || domCommand.trim().length === 0) {
      console.warn('⚠️ domCommand 없음 또는 부적절:', domCommand);
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];

      if (!currentTab?.id || currentTab.url?.startsWith('chrome-extension://')) {
        console.warn('❌ 확장 내부 탭에는 메시지 전송 불가');
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
