import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Choice from './pages/Choice';
import Voice from './pages/Voice';
import Gaze from './pages/gaze/Gaze';
import Layout from '../layout/Layout';

export default function App() {
  return (
    <BrowserRouter basename="/sidepanel.html">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<Layout />}>
          <Route path="/choice" element={<Choice />} />
          <Route path="/voice" element={<Voice />} />
          <Route path="/gaze" element={<Gaze />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
