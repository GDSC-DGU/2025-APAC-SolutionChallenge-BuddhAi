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
  const handleWordComplete = (word: string) => {
    setCompletedWords((prev) => [...prev, word]);
  };

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
          <S.SubmitButton disabled={!ableSubmit}>Enter</S.SubmitButton>
        </S.Container>
      )}
    </>
  );
}
