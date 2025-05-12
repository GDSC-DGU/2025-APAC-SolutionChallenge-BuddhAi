import * as S from './Voice.styles';
import WaveMicResponsive from '../../components/WaveMicResponsive';

export default function Voice() {
  return (
    <S.Container>
      <S.TextBox>
        <S.Text>
          <S.Spoken>Go to the </S.Spoken>
          <S.Suggested>official NASA website.</S.Suggested>
        </S.Text>
      </S.TextBox>
      <S.WaveWrapper>
        <WaveMicResponsive />
      </S.WaveWrapper>
    </S.Container>
  );
}
