import { requestMicPermission } from '../core/requestMicPermission';
import { getCurrentHtmlFile } from '../utils/getCurrentHtmlFile';
import { sendVoiceCommand } from './sendVoiceCommand';

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

export const startAudioRecording = async () => {
  const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });

  if (permission.state !== 'granted') {
    console.warn('[Permission] 마이크 권한 없음, 요청 페이지 오픈');
    requestMicPermission();
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  console.log('[Recorder] 마이크 스트림 연결됨');
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
    const audioFile = new File([audioBlob], 'voice-command.mp3', { type: 'audio/mpeg' });

    console.log('[Recorder] 녹음 종료, 파일 생성 완료:', audioFile);

    const htmlFile = getCurrentHtmlFile();
    await sendVoiceCommand(htmlFile, audioFile);
  };

  mediaRecorder.start();
  console.log('[Recorder] 녹음 시작됨');
};

export const stopAudioRecording = () => {
  if (!mediaRecorder) return;
  if (mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    console.log('[Recorder] 녹음 중지 요청');
  }
};
