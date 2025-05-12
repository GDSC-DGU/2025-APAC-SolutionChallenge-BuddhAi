let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

export const startAudioRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];

  mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
  mediaRecorder.start();
  console.log('[녹음 시작]');
};

export const stopAudioRecording = () => {
  if (!mediaRecorder) return;
  mediaRecorder.stop();
  mediaRecorder.onstop = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    console.log('[녹음 종료] Blob:', audioBlob);
    // 업로드 or 저장 로직 추가
  };
};
