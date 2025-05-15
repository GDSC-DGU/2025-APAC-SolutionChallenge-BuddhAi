import { useUIStore } from '../store/useUIStore';

type Props = {
  isGazeActive: boolean;
  isVoiceActive: boolean;
  isHelpActive: boolean;
};

export default function CommonIcons({
  isGazeActive,
  isVoiceActive,
  isHelpActive,
}: Props) {
  const { toggleGaze, toggleVoice, toggleHelp } = useUIStore();

  return (
    <>
      {/* Gaze Icon */}
      <div
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 1000,
          cursor: 'pointer',
        }}
        onClick={toggleGaze}
      >
        <img
          src={`/icons/${isGazeActive ? 'eye-on' : 'eye-off'}.svg`}
          alt="Gaze Icon"
          width={24}
          height={24}
        />
      </div>

      {/* Voice Icon */}
      <div
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 1000,
          cursor: 'pointer',
        }}
        onClick={toggleVoice}
      >
        <img
          src={`/icons/${isVoiceActive ? 'mic-on' : 'mic-off'}.svg`}
          alt="Voice Icon"
          width={24}
          height={24}
        />
      </div>

      {/* Help Icon */}
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 1000,
          cursor: 'pointer',
        }}
        onClick={toggleHelp}
      >
        <img
          src={`/icons/${isHelpActive ? 'help-on' : 'help-off'}.svg`}
          alt="Help Icon"
          width={24}
          height={24}
        />
      </div>
    </>
  );
}
