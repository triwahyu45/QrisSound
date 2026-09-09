"use client"

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {})
  }
  return ctx
}

export function playChime(volume = 1): void {
  try {
    const ac = getCtx()
    const now = ac.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.connect(gain)
      gain.connect(ac.destination)
      osc.type = "sine"
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, now + i * 0.18)
      gain.gain.linearRampToValueAtTime(volume * 0.35, now + i * 0.18 + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.5)
      osc.start(now + i * 0.18)
      osc.stop(now + i * 0.18 + 0.55)
    })
  } catch (e) {
    console.warn("Audio error", e)
  }
}

export function speak(text: string, volume = 1): void {
  try {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = "id-ID"
    utt.rate = 0.95
    utt.pitch = 1.05
    utt.volume = volume
    const voices = window.speechSynthesis.getVoices()
    const idVoice = voices.find(v => v.lang.startsWith("id")) || null
    if (idVoice) utt.voice = idVoice
    window.speechSynthesis.speak(utt)
  } catch (e) {
    console.warn("TTS error", e)
  }
}

export function announcePayment(name: string, amount: number, message: string, paymentMethod: string, volume = 1): void {
  const { terbilang } = require("@/lib/store")
  setTimeout(() => {
    speak(
      `Diterima ${terbilang(amount)} rupiah melalui ${paymentMethod} dari ${name}. Terima kasih sudah support Detronics I D!${message ? " Pesan: " + message : ""}`,
      volume
    )
  }, 800)
}
