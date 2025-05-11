import { getCurrentHtmlFile } from "../utils/getCurrentHtmlFile";
import { requestMicPermission } from "../core/requestMicPermission";

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

export const startVoiceRecording = () => {
  navigator.permissions.query({ name: "microphone" as PermissionName }).then((result) => {
    if (result.state === "granted") {
      console.log("[Permission] 이미 마이크 권한 허용됨");
      recordVoice();
    } else {
      console.log("[Permission] 마이크 권한 미허용. 요청 페이지 열기");
      requestMicPermission(); // 별도 창에서 권한 요청
    }
  }).catch((err) => {
    console.error("[Permission] 권한 확인 실패:", err);
    alert("브라우저에서 마이크 권한 상태를 확인할 수 없습니다.");
  });
};

function recordVoice() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      console.log("[Voice] 마이크 스트림 얻음");
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
        const audioFile = new File([audioBlob], "voice-command.mp3", {
          type: "audio/mpeg",
        });

        console.log("[Voice] 녹음 종료됨. 파일 생성 완료:", audioFile);
        const htmlFile = getCurrentHtmlFile();

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


            const domCommand = data.responseDto?.dom_command;
            if (!domCommand) {
              console.warn("⚠️ domCommand 없음");
              return;
            }
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              console.log("현재 탭 정보:", tabs[0]?.url);

              const currentTab = tabs[0];
              if (!currentTab?.id || currentTab.url?.startsWith("chrome-extension://")) {
                console.warn("❌ 현재 탭은 확장 내부이므로 메시지 전송 불가");
                return;
              }

              chrome.tabs.sendMessage(currentTab.id, {
                type: "DOM_COMMAND",
                domCommand,
              });
            // 디버깅
              chrome.runtime.sendMessage({
                type: "FROM_POPUP",
                message: "팝업에서 보냄",
              });
              console.log("[Popup] 메시지 전송됨");

              console.log("[Message] domCommand 전달됨:", domCommand);
            });

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
}
