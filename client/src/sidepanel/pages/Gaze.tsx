import { useRef, useState, useEffect } from 'react';
import { useGaze } from '../../hooks/useGaze';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/useUIStore';
import * as S from './Gaze.styles';
import { Loading } from '../../components/Loading';
import RingKeyboard from '../../components/keyBoard';

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

  useEffect(() => {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'showSidePanelCursor') {
        setIsPointerVisible(true);
      }
      if (message.action === 'hideSidePanelCursor') {
        setIsPointerVisible(false);
      }
    });
  }, []);

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

  useEffect(() => {
    if (!gazePos) return;

    const panelRect = document.body.getBoundingClientRect();
    const isInPanel =
      gazePos.x >= panelRect.left &&
      gazePos.x <= panelRect.right &&
      gazePos.y >= panelRect.top &&
      gazePos.y <= panelRect.bottom;

    if (isInPanel) {
      const x = gazePos.x - panelRect.left;
      const y = gazePos.y - panelRect.top;

      const el = document.elementFromPoint(x, y);
      createClickEffect(x, y);

      if (el) {
        el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      } else {
        console.warn('[SidePanel] 클릭할 요소가 없음');
      }
    }
  }, [gazePos]);

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
      <GazePointer
        visible={isPointerVisible}
        x={gazePos?.x || 0}
        y={gazePos?.y || 0}
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
