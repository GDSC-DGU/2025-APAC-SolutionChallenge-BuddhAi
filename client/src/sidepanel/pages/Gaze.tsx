import { useRef, useState, useEffect } from 'react';
import { useGaze } from '../../hooks/useGaze';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/useUIStore';
import {
  Container,
  VideoWrapper,
  StyledVideo,
  StatusIndicator,
} from './Gaze.styles';

export default function Gaze() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const { isGazeActive } = useUIStore();
  const [dwellTimer, setDwellTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastGazePos, setLastGazePos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const { status, gazePos, isTracking, simulateClick } = useGaze(videoRef);

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
      Math.abs(lastGazePos.x - gazePos.x) < 30 &&
      Math.abs(lastGazePos.y - gazePos.y) < 30;

    if (isSimilarPosition) {
      if (!dwellTimer) {
        const timer = setTimeout(() => {
          simulateClick();
        }, 500);
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

  return (
    <Container>
      <h2>시선 추적 제어</h2>
      <StatusIndicator active={isTracking}>
        상태: {status}
        {gazePos &&
          ` (X: ${Math.round(gazePos.x)}, Y: ${Math.round(gazePos.y)})`}
      </StatusIndicator>
      <VideoWrapper>
        <StyledVideo ref={videoRef} autoPlay muted playsInline />
      </VideoWrapper>
    </Container>
  );
}
