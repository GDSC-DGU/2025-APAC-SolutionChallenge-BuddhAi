
export const handleVoiceCommand = (command: string) => {
  console.log("[ContentScript] Received voice command:", command);
  if (command.includes("뒤로")) {
    history.back();
  }
  // 여기에 다른 명령어도 추가 가능
};
