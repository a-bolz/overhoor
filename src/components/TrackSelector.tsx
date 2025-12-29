import { type Track, TRACKS } from '../utils/questions';
import './TrackSelector.css';

interface TrackSelectorProps {
  currentTrack: Track;
  onSelect: (track: Track) => void;
  onStart: () => void;
}

export function TrackSelector({ currentTrack, onSelect, onStart }: TrackSelectorProps) {
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
            <span className="track-label">Up to</span>
            <span className="track-number">{track}</span>
          </button>
        ))}
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
