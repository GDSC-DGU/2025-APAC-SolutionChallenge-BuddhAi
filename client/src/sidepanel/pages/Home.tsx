import * as S from './Home.styles';
import { useNavigate } from 'react-router-dom';
import logo from '../../../public/icons/logo.png';
import CommonButton from '../../components/CommonButton';

export default function Home() {
  const navigate = useNavigate();

  return (
    <S.Container>
      <S.LogoWrapper>
        <img src={logo} alt="Mind Cursor Logo" style={{ width: '200px', height: 'auto' }} />
      </S.LogoWrapper>
      <S.TextBox>
        <S.Text>
          Let your <S.Gaze>gaze</S.Gaze> lead the way.
        </S.Text>
        <S.Text>
          We’ll follow your <S.Voice>voice</S.Voice>.
        </S.Text>
      </S.TextBox>
      <S.ButtonWrapper>
        <CommonButton
          text="Start"
          onClick={() => navigate('/choice')}
          color="linear-gradient(to right, #B020D3, #0970E7)"
        />
      </S.ButtonWrapper>
    </S.Container>
  );
}
