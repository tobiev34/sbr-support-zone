let clickAudio: HTMLAudioElement | null = null;

export function playButtonSound() {
  if (typeof window === "undefined") return;

  if (!clickAudio) {
    clickAudio = new Audio("/670000__immergomedia__lego-click-short.wav");
    clickAudio.volume = 0.5;
  }

  clickAudio.currentTime = 0;
  void clickAudio.play().catch(() => {});
}
