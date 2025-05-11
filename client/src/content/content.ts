
import { injectMicrophonePermissionIframe } from "./utils/injectIframe";
import { handleDomCommand } from "./handlers/domCommandHandler";
import { handleVoiceCommand } from "./handlers/commandHandler";

// 초기 태그 수집 로그
const allButtons = document.querySelectorAll("button");
console.log("페이지의 버튼 목록:", allButtons);

const allLinks = document.querySelectorAll("a");
console.log("페이지의 링크 목록:", allLinks);

// 메시지 리스너
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "DOM_COMMAND" && message.domCommand) {
    handleDomCommand(message.domCommand, sendResponse);
    return true; // 비동기 응답 처리
  }

  if (message.action === "injectMicrophonePermissionIframe") {
    injectMicrophonePermissionIframe();
    sendResponse({ status: "success" });
  }

  if (message.type === "COMMAND" && message.command) {
    handleVoiceCommand(message.command);
  }
});
