import { useEffect, useRef } from 'react';
import { useAudioStore } from '../store/useAudioStore';
import { useUIStore } from '../store/useUIStore';
import { useVoiceStore } from '../store/useVoiceStore';
import {
  startAudioRecording,
  stopAudioRecording,
} from '../sidepanel/hooks/useAudioRecorder';
import { startSTT, stopSTT } from '../sidepanel/hooks/useSTTController';

export default function WaveMicResponsive() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isRecording, setRecording } = useAudioStore();
  const { isVoiceActive } = useUIStore();
  const { setSpokenText } = useVoiceStore();

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isVoiceActive) {
      console.log('[Audio] isVoiceActive OFF → 정리 수행');

      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioContextRef.current?.close();
      if (recordingTimeoutRef.current)
        clearTimeout(recordingTimeoutRef.current);

      if (useAudioStore.getState().isRecording) {
        stopAudioRecording();
        stopSTT();
        setRecording(false);
      }

      return;
    }

    const setupAudio = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      streamRef.current = stream;
      audioContextRef.current = context;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;

      const intervalId = setInterval(() => {
        if (!useUIStore.getState().isVoiceActive) {
          console.log('[Audio] 감지 중단 (isVoiceActive=false)');
          clearInterval(intervalId);
          return;
        }

        if (!analyserRef.current || !dataArrayRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const volume = Math.max(...dataArrayRef.current);
        const threshold = 150;

        const isCurrentlyRecording = useAudioStore.getState().isRecording;

        if (volume > threshold && !isCurrentlyRecording) {
          console.log('[녹음 시작]');
          setRecording(true);
          startAudioRecording();

          startSTT((text) => setSpokenText(text));

          if (recordingTimeoutRef.current)
            clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = setTimeout(() => {
            console.log('[15초 강제 중단]');
            stopAudioRecording();
            stopSTT();
            setRecording(false);
          }, 15000);
        }

        if (volume <= threshold && isCurrentlyRecording) {
          console.log('[녹음 자동 중단 - 볼륨↓]');
          stopAudioRecording();
          stopSTT();
          setRecording(false);
          if (recordingTimeoutRef.current)
            clearTimeout(recordingTimeoutRef.current);
        }
      }, 300);

      return () => clearInterval(intervalId);
    };

    setupAudio();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioContextRef.current?.close();
      if (recordingTimeoutRef.current)
        clearTimeout(recordingTimeoutRef.current);
    };
  }, [isVoiceActive, setRecording, setSpokenText]);

  // 웨이브 애니메이션
  useEffect(() => {
    if (
      !isRecording ||
      !canvasRef.current ||
      !analyserRef.current ||
      !dataArrayRef.current
    )
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const analyser = analyserRef.current!;
      const dataArray = dataArrayRef.current!;
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const step = canvas.width / dataArray.length;

      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      let prevX = 0;
      let prevY = canvas.height;

      for (let i = 0; i < dataArray.length; i++) {
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

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(
        0,
        getComputedStyle(document.documentElement).getPropertyValue(
          '--color-purple'
        ) || '#a855f7'
      );
      gradient.addColorStop(
        1,
        getComputedStyle(document.documentElement).getPropertyValue(
          '--color-blue'
        ) || '#3b82f6'
      );
      ctx.fillStyle = gradient;
      ctx.fill();

      requestAnimationFrame(draw);
    };

    draw();
  }, [isRecording]);

  if (!isRecording) return null;

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
