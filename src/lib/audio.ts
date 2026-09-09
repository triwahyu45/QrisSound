"use client"
import { terbilang } from "./store"

let ctx: AudioContext | null = null
let cachedVoices: SpeechSynthesisVoice[] = []

function getCtx(): AudioContext {
  if (!ctx && typeof window !== "undefined") {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (AudioCtx) ctx = new AudioCtx()
  }
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {})
  }
  return ctx!
}

// Pre-load voices on client
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  const loadVoices = () => {
    try {
      const v = window.speechSynthesis.getVoices()
      if (v && v.length > 0) cachedVoices = v
    } catch {}
  }
  loadVoices()
  window.speechSynthesis.onvoiceschanged = loadVoices
}

// Declare global to prevent Chrome GC from cutting off speech
declare global {
  interface Window {
    __detronicsUtterance?: SpeechSynthesisUtterance | null
    __detronicsAudioUnlocked?: boolean
  }
}

export async function unlockAudio(): Promise<boolean> {
  if (typeof window === "undefined") return false
  try {
    const ac = getCtx()
    if (ac && ac.state === "suspended") {
      await ac.resume()
    }
    // Warm up speech synthesis
    if ("speechSynthesis" in window) {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume()
      cachedVoices = window.speechSynthesis.getVoices()
    }
    window.__detronicsAudioUnlocked = true
    return true
  } catch (e) {
    console.warn("unlockAudio error:", e)
    return false
  }
}

export function isAudioUnlocked(): boolean {
  if (typeof window === "undefined") return false
  if (window.__detronicsAudioUnlocked) return true
  if (ctx && ctx.state === "running") return true
  return false
}

export async function playChime(volume = 0.8): Promise<void> {
  try {
    const ac = getCtx()
    if (!ac) return
    if (ac.state === "suspended") {
      await ac.resume().catch(() => {})
    }
    const now = ac.currentTime
    // Soundbox bell chime: 4 crisp ascending notes (C5, E5, G5, C6)
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.connect(gain)
      gain.connect(ac.destination)
      osc.type = "sine"
      osc.frequency.value = freq
      const start = now + i * 0.12
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(Math.min(1, volume * 0.5), start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45)
      osc.start(start)
      osc.stop(start + 0.46)
    })
  } catch (e) {
    console.warn("Audio chime error:", e)
  }
}

export function speak(text: string, volume = 1): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
    window.speechSynthesis.cancel()

    // 60ms delay after cancel to prevent Chrome drop bug
    setTimeout(() => {
      try {
        const utt = new SpeechSynthesisUtterance(text)
        utt.lang = "id-ID"
        utt.rate = 1.0
        utt.pitch = 1.05
        utt.volume = Math.max(0, Math.min(1, volume))

        const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices()
        // Prioritize Indonesian voice (Google Bahasa Indonesia / Microsoft / Apple)
        const idVoice = voices.find(v => 
          v.lang === "id-ID" || 
          v.lang.toLowerCase().startsWith("id") || 
          v.name.toLowerCase().includes("indonesia")
        )
        if (idVoice) utt.voice = idVoice

        // Retain reference on window to prevent Chrome GC bug
        window.__detronicsUtterance = utt
        utt.onend = () => { window.__detronicsUtterance = null }
        utt.onerror = (e) => {
          console.warn("SpeechSynthesis utterance error:", e)
          window.__detronicsUtterance = null
        }

        window.speechSynthesis.speak(utt)
      } catch (err) {
        console.warn("Speech synthesis speak error:", err)
      }
    }, 60)
  } catch (e) {
    console.warn("TTS error:", e)
  }
}

export function announcePayment(name: string, amount: number, message: string, paymentMethod: string, volume = 1): void {
  const spelled = terbilang(amount)
  const callerName = name && name !== "Pelanggan" && !name.startsWith("Pelanggan #") ? name : "Sobat Detronics"
  const text = `Diterima ${spelled} rupiah melalui ${paymentMethod} dari ${callerName}. Terima kasih sudah support Detronics I D!${message ? " Pesan: " + message : ""}`

  // Play chime first, then voice
  playChime(volume)
  setTimeout(() => {
    speak(text, volume)
  }, 650)
}

