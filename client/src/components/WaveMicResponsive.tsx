import { useEffect, useRef, useState } from 'react';

interface Props {
  isActive: boolean; // 마이크가 켜져 있을 때만 웨이브 표시
}

export default function WaveMicResponsive({ isActive }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [animationId, setAnimationId] = useState<number | null>(null);

  useEffect(() => {
    if (!isActive) return; // 비활성 상태면 아무 작업도 하지 않음

    const setupAudio = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 64;

      source.connect(analyserNode);

      setAudioContext(context);
      setAnalyser(analyserNode);
    };

    setupAudio();

    return () => {
      audioContext?.close();
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isActive]);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const step = canvas.width / bufferLength;

    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    let prevX = 0;
    let prevY = canvas.height;

    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i] / 255;
      const x = i * step;
      const y = canvas.height - value * canvas.height * 0.8;

      const ctrlX = (prevX + x) / 2;
      const ctrlY = (prevY + y) / 2;

      ctx.quadraticCurveTo(prevX, prevY, ctrlX, ctrlY);

      prevX = x;
      prevY = y;
    }

      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, getComputedStyle(document.documentElement).getPropertyValue('--color-purple').trim());
      gradient.addColorStop(1, getComputedStyle(document.documentElement).getPropertyValue('--color-blue').trim());
      ctx.fillStyle = gradient;
      ctx.fill();

      const id = requestAnimationFrame(draw);
      setAnimationId(id);
    };

    draw();
  }, [analyser]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={80}
      style={{
        width: '150%',
        height: '80px',
        position: 'absolute',
        bottom: 0,
        left: 0,
        zIndex: 1,
      }}
    />
  );
}
