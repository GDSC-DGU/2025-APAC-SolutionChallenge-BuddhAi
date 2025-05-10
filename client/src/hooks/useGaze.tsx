import { useEffect, useState } from 'react';

export function useGaze(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [status, setStatus] = useState('초기화 중...');
  const [gazePos, setGazePos] = useState<{ x: number; y: number } | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isScrollingEnabled, setIsScrollingEnabled] = useState(true);

  const initWebGazer = async () => {
    try {
      // content script 주입
      await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'ensureContentScript' }, (res) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError.message);
          } else {
            resolve(res);
          }
        });
      });

      // 카메라 스트림 연결
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
      });

      if (!videoRef.current) throw new Error('비디오 요소를 찾을 수 없습니다.');
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setStatus('카메라 연결됨');

      // webgazer 스크립트 삽입 또는 재사용
      const existingScript = document.getElementById('webgazer-script');
      if (existingScript) {
        startTracking();
        return;
      }

      const script = document.createElement('script');
      script.id = 'webgazer-script';
      script.src = chrome.runtime.getURL('webgazer.js');
      script.async = true;
      script.onload = () => startTracking();
      script.onerror = () => setStatus('WebGazer 스크립트 로드 실패');
      document.body.appendChild(script);
    } catch (error) {
      setStatus(
        `초기화 실패: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  const startTracking = async () => {
    const webgazer = (window as any).webgazer;
    if (!webgazer) {
      setStatus('WebGazer를 찾을 수 없습니다');
      return;
    }

    webgazer
      .setRegression('ridge')
      .setTracker('TFFacemesh')
      .setGazeListener((data: { x: number; y: number } | null) => {
        if (data && !isNaN(data.x) && !isNaN(data.y)) {
          setGazePos({ x: data.x, y: data.y });

          window.postMessage(
            { type: 'GAZE_POSITION', x: data.x, y: data.y },
            '*'
          );

          chrome.runtime.sendMessage({
            action: 'updateGazePosition',
            gazeData: { x: data.x, y: data.y },
          });
        }
      });

    webgazer.showVideoPreview(false).showPredictionPoints(false);
    await webgazer.begin();

    if (typeof webgazer.setVideo === 'function' && videoRef.current) {
      webgazer.setVideo(videoRef.current);
    }

    setIsTracking(true);
    setStatus('시선 추적 활성화됨');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleGazePointer',
          visible: true,
        });

        // 스크롤 기능 활성화
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleScrolling',
          enabled: isScrollingEnabled,
        });
      }
    });
  };

  const simulateClick = () => {
    if (!gazePos) return;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'performClick' });
      }
    });
  };

  const stopTracking = () => {
    const webgazer = (window as any).webgazer;
    if (webgazer?.end) {
      webgazer.end();
      setIsTracking(false);
      setStatus('시선 추적 중지됨');

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggleGazePointer',
            visible: false,
          });

          // 스크롤 기능 비활성화
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggleScrolling',
            enabled: false,
          });
        }
      });
    }
  };

  // 스크롤 기능 토글
  const toggleScrolling = (enabled: boolean) => {
    setIsScrollingEnabled(enabled);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleScrolling',
          enabled: enabled,
        });
      }
    });
  };

  useEffect(() => {
    initWebGazer();

    return () => {
      const webgazer = (window as any).webgazer;
      if (webgazer?.end) webgazer.end();

      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      setIsTracking(false);
    };
  }, []);

  return {
    status,
    initWebGazer,
    gazePos,
    isTracking,
    stopTracking,
    simulateClick,
    isScrollingEnabled,
    toggleScrolling,
  };
}
