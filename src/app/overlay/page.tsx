"use client"
import { useEffect, useState } from "react"
import { useTransactions } from "@/hooks/useTransactions"
import { formatRp, timeAgo, LeaderEntry } from "@/lib/store"
import { announcePayment, unlockAudio } from "@/lib/audio"

const RANK_LABEL = ["👑", "🥈", "🥉"]

function MiniLeaderboard({ entries }: { entries: LeaderEntry[] }) {
  if (entries.length === 0) return null
  return (
    <div className="fixed left-4 top-4 w-56 rounded-2xl p-3 space-y-1.5" style={{
      background: "rgba(5,13,26,0.85)", border: "1px solid rgba(0,255,213,0.3)",
      backdropFilter: "blur(10px)"
    }}>
      <p className="text-xs font-bold tracking-widest neon-text uppercase mb-2">Top Donatur</p>
      {entries.slice(0, 5).map((e, i) => (
        <div key={e.name} className="flex items-center gap-2 text-xs">
          <span className="text-base">{i < 3 ? RANK_LABEL[i] : `${i + 1}.`}</span>
          <span className="flex-1 truncate font-medium">{e.name}</span>
          <span className="neon-green-text font-bold">{formatRp(e.total)}</span>
        </div>
      ))}
    </div>
  )
}

export default function OverlayPage() {
  const { leaderboard, latest, showAlert, dismissAlert } = useTransactions()
  const [muted, setMuted] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const handleGesture = () => unlockAudio()
    window.addEventListener("click", handleGesture)
    window.addEventListener("touchstart", handleGesture)
    return () => {
      window.removeEventListener("click", handleGesture)
      window.removeEventListener("touchstart", handleGesture)
    }
  }, [])

  useEffect(() => {
    if (showAlert && latest && !muted) {
      unlockAudio().then(() => {
        announcePayment(latest.name, latest.amount, latest.message, latest.paymentMethod)
      })
    }
  }, [showAlert, latest, muted])

  useEffect(() => {
    if (showAlert) {
      setLeaving(false)
      const t = setTimeout(() => {
        setLeaving(true)
        setTimeout(dismissAlert, 500)
      }, 7000)
      return () => clearTimeout(t)
    }
  }, [showAlert, dismissAlert])

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <style>{`body { background: transparent !important; }`}</style>

      <MiniLeaderboard entries={leaderboard} />

      {/* Mute toggle */}
      <button
        onClick={() => setMuted(m => !m)}
        className="fixed bottom-4 left-4 text-xs px-3 py-1.5 rounded-lg transition-all"
        style={{ background: "rgba(5,13,26,0.8)", border: "1px solid rgba(0,255,213,0.3)", color: muted ? "#ef4444" : "var(--neon-cyan)" }}
      >
        {muted ? "🔇 Suara OFF" : "🔊 Suara ON"}
      </button>

      {/* Alert */}
      {showAlert && latest && (
        <div className={`fixed right-4 bottom-4 w-80 ${leaving ? "animate-slide-out" : "animate-slide-in"}`}>
          <div className="rounded-2xl p-4 overflow-hidden" style={{
            background: "linear-gradient(135deg, rgba(5,13,26,0.95) 0%, rgba(6,16,32,0.95) 100%)",
            border: "2px solid var(--neon-cyan)",
            boxShadow: "0 0 30px rgba(0,255,213,0.4), 0 0 60px rgba(0,255,213,0.1)"
          }}>
            <div className="text-xs text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="animate-pulse">⚡</span> Pembayaran Berhasil!
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black shrink-0" style={{
                background: "linear-gradient(135deg, var(--neon-cyan), #0080ff)",
                color: "#050d1a"
              }}>
                {latest.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-base leading-tight">{latest.name}</p>
                <p className="text-2xl font-black neon-green-text leading-tight">{formatRp(latest.amount)}</p>
              </div>
            </div>
            {latest.message && (
              <div className="mt-3 px-3 py-2 rounded-xl text-sm italic text-slate-300" style={{ background: "rgba(0,255,213,0.05)", border: "1px solid rgba(0,255,213,0.1)" }}>
                &ldquo;{latest.message}&rdquo;
              </div>
            )}
            <p className="text-xs text-slate-500 mt-2 text-right">{timeAgo(latest.timestamp)}</p>
          </div>
        </div>
      )}
    </div>
  )
}
