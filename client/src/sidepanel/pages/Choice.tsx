import { useNavigate } from 'react-router-dom';

export default function Choice() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 20 }}>
      <h2>Customize your experience</h2>
      <button onClick={() => navigate('/voice')}>Voice Control</button>
      <button onClick={() => navigate('/gaze')}>Gaze Tracking</button>
    </div>
  );
}
