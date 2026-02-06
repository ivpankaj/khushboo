
import React, { useState, useEffect, useRef } from 'react';
import { Music, Music2 } from 'lucide-react';

const BackgroundMusic: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={toggleMusic}
        className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-90 ${
          isPlaying ? 'bg-pink-500 text-white animate-pulse' : 'bg-white text-pink-500'
        }`}
      >
        {isPlaying ? <Music size={20} /> : <Music2 size={20} />}
      </button>
      <audio
        ref={audioRef}
        loop
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // Placeholder for a soft melody
      />
    </div>
  );
};

export default BackgroundMusic;
