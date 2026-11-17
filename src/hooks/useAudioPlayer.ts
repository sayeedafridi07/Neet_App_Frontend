import type { AudioLecture } from "@/types";
import {
  setAudioModeAsync,
  useAudioPlayerStatus,
  useAudioPlayer as useExpoAudioPlayer,
} from "expo-audio";
import { useCallback, useEffect, useState } from "react";

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;
export const SKIP_SECONDS = 15;

/**
 * Plays a single lecture for as long as the calling screen is mounted.
 * The player is owned by the screen, so closing it stops and releases audio.
 */
export const useAudioPlayer = (lecture: AudioLecture | null) => {
  const player = useExpoAudioPlayer(
    lecture ? { uri: lecture.audioUrl } : null,
    { updateInterval: 250 },
  );
  const status = useAudioPlayerStatus(player);
  const [rate, setRate] = useState(1);
  const [muted, setMuted] = useState(false);

  // Autoplay as soon as the screen opens
  useEffect(() => {
    if (!lecture) return;
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    player.play();
  }, [lecture, player]);

  const togglePlay = useCallback(() => {
    if (player.playing) {
      player.pause();
      return;
    }
    // Restart if finished
    if (player.duration > 0 && player.currentTime >= player.duration - 0.5) {
      player.seekTo(0);
    }
    player.play();
  }, [player]);

  const seekTo = useCallback(
    (seconds: number) => {
      player.seekTo(Math.max(0, seconds));
    },
    [player],
  );

  const skip = useCallback(
    (seconds: number) => {
      const d = player.duration || Infinity;
      player.seekTo(Math.min(d, Math.max(0, player.currentTime + seconds)));
    },
    [player],
  );

  const cycleRate = useCallback(() => {
    setRate((prev) => {
      const i = PLAYBACK_RATES.indexOf(prev as (typeof PLAYBACK_RATES)[number]);
      const next = PLAYBACK_RATES[(i + 1) % PLAYBACK_RATES.length];
      player.setPlaybackRate(next);
      return next;
    });
  }, [player]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      player.muted = !prev;
      return !prev;
    });
  }, [player]);

  // Fall back to the API duration until the file's metadata has loaded
  const duration = status.duration || lecture?.duration || 0;
  const position = status.currentTime;

  return {
    isPlaying: status.playing,
    isBuffering: status.isBuffering,
    position,
    duration,
    progress: duration > 0 ? Math.min(1, position / duration) : 0,
    rate,
    muted,
    togglePlay,
    seekTo,
    skip,
    cycleRate,
    toggleMute,
  };
};
