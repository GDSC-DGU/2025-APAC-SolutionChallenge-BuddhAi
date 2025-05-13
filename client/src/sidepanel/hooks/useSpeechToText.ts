import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import { useEffect } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useVoiceStore } from '../../store/useVoiceStore';

export const useSpeechToText = () => {
  const { transcript } = useSpeechRecognition();
  const { isVoiceActive } = useUIStore();
  const { setSpokenText } = useVoiceStore();

  useEffect(() => {
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
      console.warn('이 브라우저는 STT를 지원하지 않습니다.');
      return;
    }

    if (isVoiceActive) {
      SpeechRecognition.startListening({ language: 'ko-KR', continuous: true });
      console.log('[SpeechToText] 음성 인식 시작');
    } else {
      SpeechRecognition.stopListening();
      console.log('[SpeechToText] 음성 인식 중지');
    }

    return () => {
      SpeechRecognition.stopListening();
    };
  }, [isVoiceActive]);

  useEffect(() => {
    setSpokenText(transcript);
  }, [transcript, setSpokenText]);

  return { transcript };
};
