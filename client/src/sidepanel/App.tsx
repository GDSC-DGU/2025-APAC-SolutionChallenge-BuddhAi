import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Choice from './pages/Choice';
import Voice from './pages/Voice';
import Gaze from './pages/gaze/Gaze';

export default function App() {
  return (
    <BrowserRouter basename="/sidepanel.html">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/choice" element={<Choice />} />
        <Route path="/voice" element={<Voice />} />
        <Route path="/gaze" element={<Gaze />} />
      </Routes>
    </BrowserRouter>
  );
}
