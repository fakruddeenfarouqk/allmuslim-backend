let apiKeys = process.env.YOUTUBE_API_KEYS?.split(",") || [];
let currentIndex = 0;

export function getApiKey() {
  return apiKeys[currentIndex];
}

export function rotateKey() {
  currentIndex = (currentIndex + 1) % apiKeys.length;
}
