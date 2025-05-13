import ReactDOM from 'react-dom/client';
import App from './App';
import '../styles/global.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
