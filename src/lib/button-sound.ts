export function playButtonSound() {
  const audio = new Audio("/670000__immergomedia__lego-click-short.wav");
  audio.volume = 1;
  audio.play().catch((error) => console.error("Sound error:", error));
}
