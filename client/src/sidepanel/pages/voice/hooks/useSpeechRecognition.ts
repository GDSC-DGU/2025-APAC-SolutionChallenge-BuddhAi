import { sendCommandToContentScript } from '../utils/sendCommand';

export const startSpeechRecognition = () => {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Your browser does not support Speech Recognition.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'ko-KR'; // 기본은 한국어, 추후 토글 지원 가능
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  console.log("[STT] SpeechRecognition 객체 생성 완료");

  // 음성 인식 결과 수신
  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    console.log("[STT] 인식된 명령어:", transcript);
    sendCommandToContentScript(transcript);
  };

  // 에러 핸들링
  recognition.onerror = (event: any) => {
    console.error("[STT] 에러 발생:", event.error);
    alert("Speech Recognition Error: " + event.error);

    if (event.error === "not-allowed") {
      console.warn("음성 인식이 차단되었습니다. 마이크 권한을 확인해주세요.");
    } else if (event.error === "service-not-allowed") {
      console.warn("브라우저에서 음성 인식 서비스 자체를 사용할 수 없습니다.");
    } else if (event.error === "network") {
      console.warn("네트워크 에러로 음성 인식이 실패했습니다.");
    }
  };

  recognition.onspeechend = () => {
    console.log("[STT] 음성 감지 종료됨");
    recognition.stop();
  };

  recognition.onend = () => {
    console.log("[STT] 인식 종료됨 (다시 시작하려면 버튼을 눌러주세요)");
  };

  // 약간의 지연 후 시작 → 브라우저 포커스 확보를 위해
  setTimeout(() => {
    try {
      recognition.start();
      console.log("[STT] 음성 인식 시작");
    } catch (err) {
      console.error("[STT] recognition.start() 실패:", err);
    }
  }, 500); // 0.5초 지연
};
