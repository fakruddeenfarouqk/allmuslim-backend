let apiKeys = process.env.YOUTUBE_API_KEYS?.split(",").map(k => k.trim()).filter(k => k) || [];
let currentIndex = 0;

export function getApiKey() {
  if (apiKeys.length === 0) {
    console.warn("⚠️ No YouTube API keys configured. Please set YOUTUBE_API_KEYS in .env");
    return null;
  }
  return apiKeys[currentIndex];
}

export function rotateKey() {
  if (apiKeys.length === 0) {
    console.warn("⚠️ Cannot rotate API key: no keys available");
    return;
  }
  currentIndex = (currentIndex + 1) % apiKeys.length;
  console.log("🔄 Rotated to next API key:", apiKeys[currentIndex]);
}
