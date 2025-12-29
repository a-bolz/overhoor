import { type Track, TRACKS, getTrackLabel } from '../utils/questions';
import type { TimerSetting } from '../utils/storage';
import './TrackSelector.css';

interface TrackSelectorProps {
  currentTrack: Track;
  onSelect: (track: Track) => void;
  onStart: () => void;
  timerSetting: TimerSetting;
  onTimerChange: (setting: TimerSetting) => void;
}

export function TrackSelector({
  currentTrack,
  onSelect,
  onStart,
  timerSetting,
  onTimerChange,
}: TrackSelectorProps) {
  const handleTimerSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    // 0 = off, 1-30 = seconds
    onTimerChange(value === 0 ? 'off' : value);
  };

  const sliderValue = timerSetting === 'off' ? 0 : timerSetting;
  const timerLabel = timerSetting === 'off' ? 'No Timer' : `${timerSetting}s`;

  return (
    <div className="track-selector">
      <h1 className="title">Overhoor</h1>
      <p className="subtitle">Math Practice</p>

      <div className="track-grid">
        {TRACKS.map((track) => (
          <button
            key={track}
            className={`track-button ${track === currentTrack ? 'selected' : ''}`}
            onClick={() => onSelect(track)}
          >
            <span className="track-label">Max</span>
            <span className="track-number">{getTrackLabel(track)}</span>
          </button>
        ))}
      </div>

      {/* Timer Setting */}
      <div className="timer-setting">
        <label className="timer-label">Timer: {timerLabel}</label>
        <input
          type="range"
          min="0"
          max="30"
          value={sliderValue}
          onChange={handleTimerSliderChange}
          className="timer-slider"
        />
        <div className="timer-marks">
          <span>Off</span>
          <span>15s</span>
          <span>30s</span>
        </div>
      </div>

      <button className="start-button" onClick={onStart}>
        Start Practice
      </button>

      <div className="instructions">
        <p>Swipe right = Correct</p>
        <p>Swipe left = Wrong</p>
      </div>
    </div>
  );
}
