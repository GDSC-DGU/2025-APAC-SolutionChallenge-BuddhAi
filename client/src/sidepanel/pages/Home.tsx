import * as S from './Home.styles';
import { useNavigate } from 'react-router-dom';
import logo from '../../../public/icons/logo.png';
import CommonButton from '../../components/CommonButton';
import { useState, useEffect } from 'react';

const TEXT_SEGMENTS = [
  { text: "Let your ", highlight: false },
  { text: "gaze", highlight: "gaze" },
  { text: " lead the way.\nWe'll follow your ", highlight: false },
  { text: "voice", highlight: "voice" },
  { text: ".", highlight: false },
];

export default function Home() {
  const navigate = useNavigate();
  const [typed, setTyped] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (currentIndex >= TEXT_SEGMENTS.length) {
      setDone(true);
      return;
    }

    const segment = TEXT_SEGMENTS[currentIndex];
    const fullText = segment.text;

    if (charIndex < fullText.length) {
      const timeout = setTimeout(() => {
        const updated = [...typed];
        updated[currentIndex] = (updated[currentIndex] || "") + fullText[charIndex];
        setTyped(updated);
        setCharIndex((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setCharIndex(0);
    }
  }, [charIndex, currentIndex]);

  return (
    <S.Container>
      <S.LogoWrapper>
        <img src={logo} alt="Mind Cursor Logo" style={{ width: '200px' }} />
      </S.LogoWrapper>

      <S.TextBox>
        <S.TypingText>
          {typed.map((str, i) => {
            const seg = TEXT_SEGMENTS[i];
            if (seg.highlight === "gaze") {
              return <S.Gaze key={i}>{str}</S.Gaze>;
            }
            if (seg.highlight === "voice") {
              return <S.Voice key={i}>{str}</S.Voice>;
            }
            return <span key={i}>{str}</span>;
          })}
        </S.TypingText>
      </S.TextBox>

      {done && (
        <S.ButtonWrapper>
          <CommonButton
            text="Start"
            onClick={() => navigate('/choice')}
            color="linear-gradient(to right, #B020D3, #0970E7)"
          />
        </S.ButtonWrapper>
      )}
    </S.Container>
  );
}
