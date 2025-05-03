import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

export default function Gaze() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState('초기화 중...');

  // WebGazer 초기화 및 실행
  const initWebGazer = async () => {
    try {
      // 카메라 스트림 가져오기
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      // 비디오 요소에 스트림 연결
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus('카메라 연결됨');

        // WebGazer 스크립트 로딩
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('webgazer.js');
        script.async = true;

        script.onload = async () => {
          const webgazer = (window as any).webgazer;
          if (!webgazer) {
            setStatus('WebGazer 라이브러리 로드 실패');
            return;
          }

          // 가짜 커서 생성
          const fakeCursor = document.createElement('div');
          fakeCursor.id = 'fake-cursor';
          Object.assign(fakeCursor.style, {
            position: 'fixed',
            top: '0px',
            left: '0px',
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            backgroundColor: 'red',
            pointerEvents: 'none',
            zIndex: '9999',
            transition: 'top 0.1s ease, left 0.1s ease',
          });
          document.body.appendChild(fakeCursor);

          // WebGazer 설정
          webgazer.setRegression('ridge');
          webgazer.setGazeListener((data: { x: number; y: number } | null) => {
            if (data && fakeCursor) {
              fakeCursor.style.left = `${data.x - 7.5}px`;
              fakeCursor.style.top = `${data.y - 7.5}px`;
            }
          });

          try {
            // WebGazer 옵션 설정: 내부 비디오와 디버그 캔버스 숨김
            webgazer.showVideoPreview(false); // 내부 비디오 숨김
            webgazer.showPredictionPoints(true); // 예측 점은 표시 (가짜 커서)
            webgazer.showFaceOverlay(false); // 얼굴 오버레이 숨김
            webgazer.showFaceFeedbackBox(false); // 얼굴 피드백 박스 숨김

            // WebGazer 시작
            await webgazer.begin();

            // ID로 비디오 요소 인식하도록 설정
            if (typeof webgazer.setVideo === 'function' && videoRef.current) {
              webgazer.setVideo(videoRef.current);
            }

            setStatus('시선 추적 활성화됨');
          } catch (error) {
            setStatus(
              `WebGazer 초기화 실패: ${
                error instanceof Error ? error.message : '알 수 없는 오류'
              }`
            );
          }
        };

        script.onerror = () => {
          setStatus('WebGazer 스크립트 로드 실패');
        };

        document.body.appendChild(script);
      }
    } catch (error) {
      setStatus(
        `카메라 접근 실패: ${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`
      );
    }
  };

  // 컴포넌트 마운트 시 WebGazer 초기화
  useEffect(() => {
    initWebGazer();

    return () => {
      // 비디오 스트림 정리
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      // 가짜 커서 제거
      const fakeCursor = document.getElementById('fake-cursor');
      if (fakeCursor && fakeCursor.parentNode) {
        fakeCursor.parentNode.removeChild(fakeCursor);
      }

      // WebGazer 종료
      const webgazer = (window as any).webgazer;
      if (webgazer && typeof webgazer.end === 'function') {
        webgazer.end();
      }
    };
  }, []);

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>시선 추적</h2>
      <p>상태: {status}</p>

      <div
        style={{
          position: 'relative',
          marginTop: '16px',
          marginBottom: '16px',
        }}
      >
        <video
          ref={videoRef}
          id="webgazer-video"
          style={{ width: '100%', borderRadius: '8px' }}
          autoPlay
          muted
          playsInline
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '16px',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          돌아가기
        </button>

        <button
          onClick={() => initWebGazer()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          다시 시작
        </button>
      </div>

      <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
        <p>
          시선 추적이 활성화되면 빨간색 점이 화면에 나타나 시선을 표시합니다.
        </p>
      </div>
    </div>
  );
}
