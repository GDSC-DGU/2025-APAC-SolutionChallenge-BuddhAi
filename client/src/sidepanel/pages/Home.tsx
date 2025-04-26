import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 20 }}>
      <h2>Let your gaze lead the way. We’ll follow your voice.</h2>
      <button onClick={() => navigate('/choice')}>start</button>
    </div>
  );
}
