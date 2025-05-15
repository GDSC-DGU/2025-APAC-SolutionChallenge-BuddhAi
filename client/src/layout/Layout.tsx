import { Outlet } from "react-router-dom";
import CommonIcons from "../components/CommonIcons";
import { useUIStore } from "../store/useUIStore";

export default function Layout() {
  const { isGazeActive, isVoiceActive, isHelpActive } = useUIStore();

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <CommonIcons
        isGazeActive={isGazeActive}
        isVoiceActive={isVoiceActive}
        isHelpActive={isHelpActive}
      />
      <Outlet />
    </div>
  );
}
