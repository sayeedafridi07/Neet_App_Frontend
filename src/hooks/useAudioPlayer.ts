import type { AudioLecture } from "@/types";
import {
  type AudioPlayer,
  setAudioModeAsync,
  useAudioPlayerStatus,
  useAudioPlayer as useExpoAudioPlayer,
} from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;
export const SKIP_SECONDS = 15;

// expo-audio only exposes mute as a property. Setting it from a plain helper
// keeps the React Compiler from flagging it as mutating a hook's return value.
const setPlayerMuted = (player: AudioPlayer, muted: boolean) => {
  player.muted = muted;
};

export const useAudioPlayer = (lecture: AudioLecture | null) => {
  const player = useExpoAudioPlayer(
    lecture ? { uri: lecture.audioUrl } : null,
    { updateInterval: 250 },
  );
  const status = useAudioPlayerStatus(player);
  const [rate, setRate] = useState(1);
  const [muted, setMuted] = useState(false);

  // Keep the latest speed / mute without making autoplay re-run on change
  const settings = useRef({ rate, muted });
  useEffect(() => {
    settings.current = { rate, muted };
  }, [rate, muted]);

  // Autoplay each new player (a new lecture creates one). Speed and mute must
  // be applied *before* play(): iOS starts at the rate stored at that moment,
  // and a later setPlaybackRate is ignored while the item is still loading.
  useEffect(() => {
    if (!lecture) return;
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    player.setPlaybackRate(settings.current.rate);
    setPlayerMuted(player, settings.current.muted);
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
    const i = PLAYBACK_RATES.indexOf(rate as (typeof PLAYBACK_RATES)[number]);
    const next = PLAYBACK_RATES[(i + 1) % PLAYBACK_RATES.length];
    player.setPlaybackRate(next);
    setRate(next);
  }, [player, rate]);

  const toggleMute = useCallback(() => {
    setPlayerMuted(player, !muted);
    setMuted(!muted);
  }, [player, muted]);

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
