import { requestMicPermission } from '../core/requestMicPermission';
import { getCurrentHtmlFile } from '../utils/getCurrentHtmlFile';
import { sendVoiceCommand } from './sendVoiceCommand';

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

export const startAudioRecording = async (
  onComplete: (commandFile: File) => void
) => {
  const permission = await navigator.permissions.query({
    name: 'microphone' as PermissionName,
  });

  if (permission.state !== 'granted') {
    requestMicPermission();
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
    const audioFile = new File([audioBlob], 'voice-command.mp3', {
      type: 'audio/mpeg',
    });

    const htmlFile = getCurrentHtmlFile();
    await sendVoiceCommand(htmlFile, audioFile);

    onComplete(audioFile);
  };

  mediaRecorder.start();
};

export const stopAudioRecording = () => {
  if (!mediaRecorder) return;
  if (mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
};
