import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Voice() {
  const navigate = useNavigate();

  // 새 창으로 마이크 권한 요청 페이지 열기
  const openPermissionPage = () => {
    const url = chrome.runtime.getURL("permission/index.html");
    window.open(url, "_blank", "width=500,height=600");
  };

  // 메시지 리스너 등록
  useEffect(() => {
    const handlePermissionMessage = (message: any) => {
      if (message.type === "PERMISSION_GRANTED") {
        console.log("Microphone permission granted!");
        // TODO: 음성 인식 로직 연결
        // startSpeechRecognition();
      } else if (message.type === "PERMISSION_DENIED") {
        console.warn("Microphone permission denied.");
        alert("마이크 권한이 필요합니다.");
      }
    };

    chrome.runtime.onMessage.addListener(handlePermissionMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handlePermissionMessage);
    };
  }, []);

  return (
    <div style={{ padding: '16px' }}>
      <h2>Voice Control</h2>
      <p>Press the button to request microphone access.</p>

      <button onClick={openPermissionPage} style={{ marginBottom: '16px' }}>
        Request Microphone Permission
      </button>

      <br />

      <button onClick={() => navigate(-1)}> Go Back</button>
    </div>
  );
}
