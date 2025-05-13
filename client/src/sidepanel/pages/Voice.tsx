import * as S from './Voice.styles';
import WaveMicResponsive from '../../components/WaveMicResponsive';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useVoiceStore } from '../../store/useVoiceStore';

export default function Voice() {
  useSpeechToText();
  const spokenText = useVoiceStore((state) => state.spokenText);

  return (
    <S.Container>
      <S.TextBox>
        <S.Text>
          <S.Spoken>{spokenText}</S.Spoken>
          <S.Suggested>official NASA website.</S.Suggested>
        </S.Text>
      </S.TextBox>
      <S.WaveWrapper>
        <WaveMicResponsive />
      </S.WaveWrapper>
    </S.Container>
  );
}
