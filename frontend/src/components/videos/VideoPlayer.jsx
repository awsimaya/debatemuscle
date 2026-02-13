import { forwardRef } from 'react';

const VideoPlayer = forwardRef(function VideoPlayer({ videoId, onTimeUpdate }, ref) {
  const token = localStorage.getItem('token');

  return (
    <div className="bg-black rounded-xl overflow-hidden">
      <video
        ref={ref}
        src={`/api/videos/${videoId}/stream?token=${encodeURIComponent(token)}`}
        controls
        className="w-full"
        onTimeUpdate={() => {
          if (ref?.current) {
            onTimeUpdate?.(ref.current.currentTime);
          }
        }}
      >
        Your browser does not support video playback.
      </video>
    </div>
  );
});

export default VideoPlayer;
