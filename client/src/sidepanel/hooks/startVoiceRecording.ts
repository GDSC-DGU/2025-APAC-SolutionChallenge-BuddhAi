import { getCurrentHtmlFile } from "../utils/getCurrentHtmlFile";

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

export const startVoiceRecording = () => {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      console.log("[Voice] 마이크 스트림 얻음");
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
const audioFile = new File([audioBlob], 'voice-command.mp3', {
  type: 'audio/mpeg',
});


        console.log("[Voice] 녹음 종료됨. 파일 생성 완료:", audioFile);

        // DOM HTML 파일 생성 -> 나중에 분리 해야 함
        const htmlFile = getCurrentHtmlFile();

        // API 전송 -> 이것도 베이스 url을 따로 관리해야 함
        const formData = new FormData();
        formData.append("htmlFile", htmlFile);         
        formData.append("commandFile", audioFile);     

        fetch("https://famous-blowfish-plainly.ngrok-free.app/api/v3/command", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("[API] 응답 수신:", data);
          })
          .catch((err) => {
            console.error("[API] 전송 실패:", err);
          });
      };

      mediaRecorder.start();
      console.log("[Voice] 녹음 시작됨");

      setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
          console.log("[Voice] 녹음 중지 요청");
        }
      }, 5000);
    })
    .catch((err) => {
      console.error("[Voice] 마이크 접근 실패:", err);
      alert("마이크 권한이 필요합니다.");
    });
};
