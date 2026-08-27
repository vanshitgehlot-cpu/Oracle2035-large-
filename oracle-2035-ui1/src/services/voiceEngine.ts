/**
 * Voice AI Service for Future Self using Browser Speech Synthesis API
 */

let muted = false;
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function isVoiceSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function isMuted(): boolean {
  return muted;
}

export function toggleMute(): boolean {
  muted = !muted;
  if (muted) {
    stopSpeaking();
  }
  return muted;
}

export function setMute(state: boolean): void {
  muted = state;
  if (muted) {
    stopSpeaking();
  }
}

export function stopSpeaking(): void {
  if (isVoiceSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn("Failed to stop speech synthesis:", e);
    }
  }
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  if (!isVoiceSupported()) return false;
  return window.speechSynthesis.speaking;
}

/**
 * Selects the best available English voice from SpeechSynthesis voices
 */
function getBestEnglishVoice(): SpeechSynthesisVoice | null {
  if (!isVoiceSupported()) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Preferred voice names order (natural / calm / grounded English voices)
  const preferredNames = [
    "Google US English",
    "Google UK English Male",
    "Google UK English Female",
    "Samantha",
    "Daniel",
    "Alex",
    "Microsoft David - English (United States)",
    "Microsoft Mark - English (United States)",
    "Microsoft Guy Online (Natural) - English (United States)",
  ];

  for (const name of preferredNames) {
    const matched = voices.find((v) => v.name.includes(name));
    if (matched) return matched;
  }

  // Fallback to any en-US voice
  const enUsVoice = voices.find((v) => v.lang === "en-US" || v.lang === "en_US");
  if (enUsVoice) return enUsVoice;

  // Fallback to any English voice
  const enVoice = voices.find((v) => v.lang.startsWith("en"));
  if (enVoice) return enVoice;

  return voices[0] || null;
}

/**
 * Speaks text using the Future Self Voice profile
 * - Rate: 0.9
 * - Pitch: 1.0
 * - Volume: 1.0
 */
export function speak(text: string): boolean {
  if (!isVoiceSupported()) {
    console.warn("Voice is unavailable on this browser.");
    return false;
  }

  if (muted || !text || !text.trim()) {
    return false;
  }

  // Cancel any ongoing speech before speaking new response
  stopSpeaking();

  try {
    const cleanText = text.replace(/[*_#`~]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voice = getBestEnglishVoice();
    if (voice) {
      utterance.voice = voice;
    }

    currentUtterance = utterance;

    utterance.onend = () => {
      if (currentUtterance === utterance) {
        currentUtterance = null;
      }
    };

    utterance.onerror = (err) => {
      console.warn("Speech synthesis error:", err);
      if (currentUtterance === utterance) {
        currentUtterance = null;
      }
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error("Error invoking speech synthesis:", err);
    return false;
  }
}
