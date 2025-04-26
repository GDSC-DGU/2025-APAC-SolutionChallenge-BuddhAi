import { useNavigate } from 'react-router-dom';

export default function Gaze() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '16px' }}>
      <h2>Gaze 화면</h2>
      <p>여긴 gaze 버전 UI입니다.</p>
      <button onClick={() => navigate(-1)}>선택으로 돌아가기</button>
    </div>
  );
}
