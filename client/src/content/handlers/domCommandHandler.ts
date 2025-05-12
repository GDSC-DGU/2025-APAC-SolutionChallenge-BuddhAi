
export const handleDomCommand = (domCommand: string, sendResponse: Function) => {
  console.log("[ContentScript] 실행할 domCommand 수신:", domCommand);
  try {
    eval(domCommand); // 보안 유의
    sendResponse({ status: "success", message: "명령어 실행됨" });
  } catch (e: any) {
    console.error("⚠️ domCommand 실행 실패:", e);
    sendResponse({ status: "error", message: e.message });
  }
};
