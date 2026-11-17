// e.g. 1348 → "22:28"
export const formatDuration = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
};

// e.g. 4980 → "1h 23m", 1348 → "22m"
export const formatTotalDuration = (sec: number) => {
  const m = Math.round(Math.max(0, sec) / 60);
  const h = Math.floor(m / 60);
  return h ? `${h}h ${m % 60}m` : `${m}m`;
};
