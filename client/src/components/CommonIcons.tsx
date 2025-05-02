type Props = {
  isGazeActive: boolean;
  isVoiceActive: boolean;
  isHelpActive: boolean;
};

export default function CommonIcons({ isGazeActive, isVoiceActive, isHelpActive }: Props) {
  return (
    <>
      {/* Gaze Icon */}
      <div style={{ position: "absolute", top: "16px", left: "16px" }}>
        <img
          src={`/icons/${isGazeActive ? "eye-on" : "eye-off"}.svg`}
          alt="Gaze Icon"
          width={50}
          height={50}
        />
      </div>

      {/* Voice Icon */}
      <div style={{ position: "absolute", top: "16px", right: "16px" }}>
        <img
          src={`/icons/${isVoiceActive ? "mic-on" : "mic-off"}.svg`}
          alt="Voice Icon"
          width={50}
          height={50}
        />
      </div>

      {/* Help Icon */}
      <div style={{ position: "absolute", bottom: "16px", right: "16px" }}>
        <img
          src={`/icons/${isHelpActive ? "help-on" : "help-off"}.svg`}
          alt="Help Icon"
          width={50}
          height={50}
        />
      </div>
    </>
  );
}
