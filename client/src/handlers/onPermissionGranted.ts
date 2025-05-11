import { startAudioRecording } from "../hooks/useAudioRecorder";
import { sendDomCommandToContent } from "../utils/sendDomCommandToContent";

export const onPermissionGranted = () => {
  startAudioRecording((commandFile) => {
    const htmlString = document.documentElement.outerHTML;
    const htmlBlob = new Blob([htmlString], { type: "text/html" });
    const htmlFile = new File([htmlBlob], "page.html", { type: "text/html" });

    const formData = new FormData();
    formData.append("htmlSource", htmlFile);
    formData.append("commandFile", commandFile);

    fetch("https://famous-blowfish-plainly.ngrok-free.app/api/v3/command", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        const domCommand = data?.responseDto?.domCommand;
        if (domCommand) {
          sendDomCommandToContent(domCommand);
        } else {
          console.warn("⚠️ domCommand 없음:", data);
        }
      })
      .catch((err) => {
        console.error("❌ API 호출 실패:", err);
      });
  });
};
