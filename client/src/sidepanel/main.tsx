import ReactDOM from 'react-dom/client';
import App from './App';
import '../styles/global.css';
import { useVoiceStore } from '../store/voiceStore';
// import { onPermissionGranted } from '../handlers/onPermissionGranted';

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  console.log('[Global] 수신된 메시지:', message);

  const { setIsRecognizing } = useVoiceStore.getState();

  if (message.type === 'PERMISSION_GRANTED') {
    console.log('[Permission] 권한 허용됨. 음성인식 시작');
    setIsRecognizing(true);
    // onPermissionGranted(); // 여기서 startAudioRecording 호출됨
  }

  if (message.type === 'PERMISSION_DENIED') {
    console.warn('[Permission] 권한 거부됨');
    setIsRecognizing(false);
    alert('마이크 권한이 필요합니다.');
  }

  return true; // 꼭 있어야 안정적으로 메시지 수신됨
});

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
