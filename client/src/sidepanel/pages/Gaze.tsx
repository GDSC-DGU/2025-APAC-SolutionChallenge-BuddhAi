import { useRef, useState, useEffect } from 'react';
import { useGaze } from '../../hooks/useGaze';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/useUIStore';
import * as S from './Gaze.styles';
import { Loading } from '../../components/Loading';
import RingKeyboard from '../../components/keyBoard';
import { GlobalStyle } from './Gaze.styles';

export default function Gaze() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const { isGazeActive } = useUIStore();

  const [dwellTimer, setDwellTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastGazePos, setLastGazePos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const { status, gazePos, simulateClick } = useGaze(videoRef);

  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [ableSubmit, setAbleSubmit] = useState(false);
  const [isPointerVisible, setIsPointerVisible] = useState(false);
  const [isInteractionEnabled, setIsInteractionEnabled] = useState(false);

  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const handleWordComplete = (word: string) => {
    setCompletedWords((prev) => [...prev, word]);
  };

  const GazePointer = ({
    visible,
    x,
    y,
  }: {
    visible: boolean;
    x: number;
    y: number;
  }) => {
    if (!visible) return null;

    return (
      <div
        style={{
          position: 'fixed',
          left: `${x}px`,
          top: `${y}px`,
          width: '15px',
          height: '15px',
          borderRadius: '50%',
          backgroundColor: 'rgba(238, 130, 238, 0.4)',
          border: '2px solid rgba(238, 130, 238, 0.9)',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          transition: 'transform 0.08s ease-out',
          zIndex: 9999,
          backdropFilter: 'blur(2px)',
          boxShadow: '0 0 10px rgba(238, 130, 238, 0.5)',
        }}
      />
    );
  };

  const createClickEffect = (x: number, y: number) => {
    const effect = document.createElement('div');
    effect.style.position = 'fixed';
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    effect.style.width = '20px';
    effect.style.height = '20px';
    effect.style.borderRadius = '50%';
    effect.style.backgroundColor = 'rgba(0, 200, 255, 0.3)';
    effect.style.border = '2px solid rgba(0, 200, 255, 0.5)';
    effect.style.transform = 'translate(-50%, -50%) scale(1)';
    effect.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    effect.style.pointerEvents = 'none';

    document.body.appendChild(effect);

    requestAnimationFrame(() => {
      effect.style.transform = 'translate(-50%, -50%) scale(2)';
      effect.style.opacity = '0';
    });

    setTimeout(() => {
      effect.remove();
    }, 300);
  };

  const handleSubmit = () => {
    const text = completedWords.join('');
    console.log('입력값 전송:', text);

    chrome.runtime.sendMessage({
      action: 'relayInsertInputValue',
      value: text,
    });

    chrome.runtime.sendMessage({ type: 'FOCUS_ON_PAGE' });

    setCompletedWords([]);
  };

  // ✅ 마우스 위치 추적
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // ✅ SidePanel Cursor Toggle
  useEffect(() => {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'showSidePanelCursor') {
        setIsPointerVisible(true);
        setIsInteractionEnabled(true);
      }
      if (message.action === 'hideSidePanelCursor') {
        setIsPointerVisible(false);
        setIsInteractionEnabled(false);
      }
    });
  }, []);

  // ✅ Gaze 비활성화 시 이동
  useEffect(() => {
    if (!isGazeActive) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggleGazePointer',
            visible: false,
          });
        }
      });
      navigate('/choice');
    }
  }, [isGazeActive, navigate]);

  // ✅ Dwell 클릭 로직 (gaze는 유지됨)
  useEffect(() => {
    if (!gazePos) return;

    const isSimilarPosition =
      lastGazePos &&
      Math.abs(lastGazePos.x - gazePos.x) < 50 &&
      Math.abs(lastGazePos.y - gazePos.y) < 50;

    if (isSimilarPosition) {
      if (!dwellTimer) {
        const timer = setTimeout(() => {
          simulateClick();
        }, 400);
        setDwellTimer(timer);
      }
    } else {
      if (dwellTimer) {
        clearTimeout(dwellTimer);
        setDwellTimer(null);
      }
      setLastGazePos(gazePos);
    }

    return () => {
      if (dwellTimer) {
        clearTimeout(dwellTimer);
      }
    };
  }, [gazePos, lastGazePos, dwellTimer, simulateClick]);

  // ✅ Interaction 영역 클릭 효과
  useEffect(() => {
    if (!isInteractionEnabled) return;

    const el = document.elementFromPoint(mousePos.x, mousePos.y);

    createClickEffect(mousePos.x, mousePos.y);

    if (el) {
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    } else {
      console.warn('[SidePanel] 클릭할 요소가 없음');
    }
  }, [mousePos, isInteractionEnabled]);

  // ✅ Submit 활성화 상태 감지
  useEffect(() => {
    const listener = (message: any) => {
      if (message?.type === 'UPDATE_SUBMIT_STATE') {
        setAbleSubmit(message.focused === true);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const isLoading = status !== '시선 추적 활성화';

  return (
    <>
      <GlobalStyle />
      <GazePointer
        visible={isPointerVisible}
        x={mousePos.x} // ✅ 실제 마우스 좌표로 변경
        y={mousePos.y}
      />
      <S.StyledVideo ref={videoRef} autoPlay muted playsInline />
      {isLoading ? (
        <Loading />
      ) : (
        <S.Container>
          <RingKeyboard onWordComplete={handleWordComplete} />
          <S.Submit>
            {completedWords.map((word, i) => (
              <S.SubmitWord key={i}>{word}</S.SubmitWord>
            ))}
          </S.Submit>
          <S.SubmitButton disabled={!ableSubmit} onClick={handleSubmit}>
            Enter
          </S.SubmitButton>
        </S.Container>
      )}
    </>
  );
}
