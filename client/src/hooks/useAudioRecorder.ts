// src/hooks/useAudioRecorder.ts

type AudioRecorderOptions = {
  durationMs?: number; // 기본 녹음 시간 (default: 5000ms)
  mimeType?: string;   // 기본 MIME (default: "audio/webm")
};

/**
 * 사용자의 음성을 녹음하고 일정 시간 후 자동 종료한 뒤,
 * 녹음된 음성을 File 형태로 콜백에 전달합니다.
 *
 * @param onComplete - 녹음 완료 후 실행되는 콜백 (File 객체 반환)
 * @param options - 녹음 시간 및 형식 설정 (선택)
 */
export const startAudioRecording = async (
  onComplete: (file: File) => void,
  options: AudioRecorderOptions = {}
) => {
  const {
    durationMs = 5000,
    mimeType = "audio/webm",
  } = options;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream, { mimeType });

    const chunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(chunks, { type: mimeType });
      const file = new File([audioBlob], `command.${mimeType.split("/")[1]}`, { type: mimeType });
      onComplete(file);
    };

    mediaRecorder.onerror = (e) => {
      console.error("🎙️ MediaRecorder 에러 발생:", e.error);
      alert("녹음 중 문제가 발생했습니다: " + e.error.message);
    };

    mediaRecorder.start();
    console.log(`[🎤] ${durationMs}ms 동안 음성 녹음 시작`);

    setTimeout(() => {
      mediaRecorder.stop();
      console.log("[🛑] 음성 녹음 종료됨");
    }, durationMs);
  } catch (err) {
    console.error("❌ 마이크 접근 실패:", err);
    alert("마이크 권한 요청에 실패했습니다.");
  }
};
