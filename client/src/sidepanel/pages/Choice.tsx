import * as S from './Choice.styles';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/useUIStore';
import CommonButton from '../../components/CommonButton';
import logo from '../../../public/icons/logo.png';

export default function Choice() {
  const navigate = useNavigate();
  const { isGazeActive, isVoiceActive } = useUIStore();

  const handleStart = () => {
    if (isGazeActive && isVoiceActive) {
      navigate('/combined'); // 둘 다 켜졌을 때 가는 페이지 추가 예정
    } else if (isGazeActive) {
      navigate('/gaze');
    } else if (isVoiceActive) {
      navigate('/voice');
    } else {
      alert('Please activate at least one mode (Gaze or Voice).');
    }
  };

  return (
    <S.Container>
      <S.LogoWrapper>
        <img src={logo} alt="Logo" style={{ width: '120px' }} />
      </S.LogoWrapper>

      <S.Text>Customize your experience.</S.Text>

      <S.ButtonGroup>
        <CommonButton text="Start" onClick={handleStart} />
      </S.ButtonGroup>
    </S.Container>
  );
}
