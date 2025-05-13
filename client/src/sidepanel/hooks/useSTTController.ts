// 안쓰는 코드
let recognition: SpeechRecognition | null = null;

export const startSTT = (onResult: (text: string) => void) => {
  const SpeechRecognitionClass =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    console.warn('STT 미지원');
    return;
  }

  recognition = new SpeechRecognitionClass();

  if (recognition) {
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      
      console.log('[STT] 인식된 텍스트:', transcript); // 콘솔 출력
      onResult(transcript);
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error('STT 오류:', e.error);
    };

    recognition.onend = () => {
      console.log('[STT] 종료됨');
    };

    recognition.start();
    console.log('[STT] 시작됨');
  }
};

export const stopSTT = () => {
  if (recognition) {
    recognition.stop();
    recognition = null;
    console.log('[STT] 수동 종료됨');
  }
};
