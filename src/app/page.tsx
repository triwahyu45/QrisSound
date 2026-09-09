"use client"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useCallback, useRef } from "react"
import { Crown, Zap, Wifi, Users, TrendingUp, Clock, CreditCard, CheckCircle2, Cloud, CloudOff, Volume2, VolumeX, Sparkles } from "lucide-react"
import { useTransactions } from "@/hooks/useTransactions"
import { formatRp, timeAgo, LeaderEntry, Transaction } from "@/lib/store"
import { playChime, announcePayment, unlockAudio, isAudioUnlocked } from "@/lib/audio"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

const RANK_CLASS = ["rank-gold", "rank-silver", "rank-bronze"]
const RANK_LABEL = ["#1", "#2", "#3"]

const METHOD_COLORS: Record<string, string> = {
  GoPay: "#00AED6", ShopeePay: "#EE4D2D", OVO: "#4C3494", DANA: "#118EEA",
  LinkAja: "#E82529", BCA: "#006CB8", Mandiri: "#003F88", BNI: "#F58220",
  BRI: "#003087", BSI: "#3E8914", QRIS: "#6366f1", Lainnya: "#64748b"
}

function LeaderboardCard({ entries }: { entries: LeaderEntry[] }) {
  return (
    <div className="glass rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Crown size={16} style={{ color: "var(--neon-cyan)" }} />
        <h2 className="text-sm font-bold tracking-widest uppercase neon-text">Top Donatur</h2>
      </div>
      <div className="flex-1 overflow-auto space-y-2">
        {entries.length === 0 && (
          <p className="text-center text-slate-500 text-sm py-8">Belum ada donasi</p>
        )}
        {entries.slice(0, 10).map((e, i) => (
          <div key={e.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
            <span className={`text-sm font-black w-8 text-center ${RANK_CLASS[i] ?? "text-slate-400"}`}>
              {i < 3 ? RANK_LABEL[i] : `${i + 1}`}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{e.name}</p>
              <p className="text-xs text-slate-400">{formatRp(e.total)}</p>
            </div>
            {i === 0 && <Zap size={13} className="text-yellow-400 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityFeed({ txs }: { txs: Transaction[] }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={15} style={{ color: "var(--neon-cyan)" }} />
        <h2 className="text-sm font-bold tracking-widest uppercase neon-text">Aktivitas Terkini</h2>
      </div>
      <div className="space-y-2 max-h-40 overflow-auto">
        {txs.length === 0 && <p className="text-slate-500 text-xs text-center py-4">Belum ada transaksi</p>}
        {txs.slice(0, 8).map(tx => (
          <div key={tx.id} className="flex items-center gap-3 text-xs py-1.5 border-b border-white/5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs"
              style={{ background: "rgba(0,255,213,0.15)", color: "var(--neon-cyan)" }}>
              {tx.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold">{tx.name}</span>
                <span className="text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full border border-white/10"
                  style={{ color: METHOD_COLORS[tx.paymentMethod] ?? "#64748b" }}>
                  {tx.paymentMethod}
                </span>
              </div>
              {tx.message && <span className="text-slate-400 truncate block">&ldquo;{tx.message}&rdquo;</span>}
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold neon-green-text">{formatRp(tx.amount)}</p>
              <p className="text-slate-500">{timeAgo(tx.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TransactionAlert({ tx, show, onDismiss }: { tx: Transaction | null; show: boolean; onDismiss: () => void }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (show) {
      setLeaving(false)
      const t = setTimeout(() => {
        setLeaving(true)
        setTimeout(onDismiss, 500)
      }, 7000)
      return () => clearTimeout(t)
    }
  }, [show, onDismiss])

  if (!show || !tx) return null

  const methodColor = METHOD_COLORS[tx.paymentMethod] ?? "#64748b"

  return (
    <div className={`fixed top-6 right-6 z-50 max-w-sm w-full ${leaving ? "animate-slide-out" : "animate-slide-in"}`}>
      <div className="rounded-2xl p-5 border-2 shadow-2xl" style={{
        background: "linear-gradient(135deg, #0a1628 0%, #061020 100%)",
        borderColor: "var(--neon-cyan)",
        boxShadow: "0 0 30px rgba(0,255,213,0.3), 0 0 60px rgba(0,255,213,0.1)"
      }}>
        {/* Header badge */}
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={14} style={{ color: "var(--neon-cyan)" }} />
          <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Pembayaran Masuk</span>
          <button onClick={() => { setLeaving(true); setTimeout(onDismiss, 500) }}
            className="ml-auto text-slate-500 hover:text-white transition-colors leading-none text-base">x</button>
        </div>

        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black shrink-0" style={{
            background: "linear-gradient(135deg, var(--neon-cyan), #0080ff)",
            color: "#050d1a"
          }}>
            {tx.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg leading-tight">{tx.name}</p>

            {/* Amount */}
            <p className="text-2xl font-black neon-green-text">{formatRp(tx.amount)}</p>

            {/* Payment method badge */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <CreditCard size={12} style={{ color: methodColor }} />
              <span className="text-xs font-bold px-2 py-0.5 rounded-full border"
                style={{ color: methodColor, borderColor: methodColor + "55", background: methodColor + "18" }}>
                melalui {tx.paymentMethod}
              </span>
            </div>

            {tx.message && <p className="text-sm text-slate-300 mt-2 italic truncate">&ldquo;{tx.message}&rdquo;</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MainDisplay() {
  const { txs, leaderboard, latest, showAlert, dismissAlert, isCloudConnected } = useTransactions()
  const [time, setTime] = useState("")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [audioUnlockedState, setAudioUnlockedState] = useState(false)
  const lastAnnouncedId = useRef<string | null>(null)
  const totalAmount = txs.reduce((s, t) => s + t.amount, 0)

  // Trigger audio unlock on any user gesture
  const triggerUnlock = useCallback(async () => {
    const ok = await unlockAudio()
    setAudioUnlockedState(true)
    return ok
  }, [])

  useEffect(() => {
    if (isAudioUnlocked()) {
      setAudioUnlockedState(true)
    }

    const handleGesture = () => {
      triggerUnlock()
    }
    window.addEventListener("click", handleGesture)
    window.addEventListener("touchstart", handleGesture)
    window.addEventListener("keydown", handleGesture)
    return () => {
      window.removeEventListener("click", handleGesture)
      window.removeEventListener("touchstart", handleGesture)
      window.removeEventListener("keydown", handleGesture)
    }
  }, [triggerUnlock])

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  // Play sound when new transaction arrives
  useEffect(() => {
    if (showAlert && latest && soundEnabled) {
      if (lastAnnouncedId.current !== latest.id) {
        lastAnnouncedId.current = latest.id
        triggerUnlock().then(() => {
          announcePayment(latest.name, latest.amount, latest.message, latest.paymentMethod)
        })
      }
    }
  }, [showAlert, latest, soundEnabled, triggerUnlock])

  return (
    <div className="min-h-screen grid-bg flex flex-col p-4 gap-4">
      {/* Header */}
      <header className="glass rounded-2xl px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center shrink-0">
            <Image src={`${basePath}/logo-detronics-id.png`} alt="Detronics ID" width={40} height={40} className="object-contain w-full h-full" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider neon-text">DETRONICS ID</h1>
            <p className="text-xs text-slate-400">Store ID: <span className="text-white font-mono font-bold">23598782</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">LIVE</span>
          </div>

          {/* Cloud Sync Status */}
          {isCloudConnected ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-medium">
              <Cloud size={13} className="text-cyan-400 animate-pulse" /> Cloud Sync
            </span>
          ) : (
            <Link href="/admin" className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400 text-xs hover:bg-amber-900/40 transition-colors">
              <CloudOff size={13} /> Setup Cloud
            </Link>
          )}

          {/* Tes Suara Button */}
          <button
            onClick={async (e) => {
              e.stopPropagation()
              await triggerUnlock()
              announcePayment(
                latest?.name || "Pelanggan QRIS",
                latest?.amount || 10000,
                latest?.message || "Tes Suara QRIS Soundbox",
                latest?.paymentMethod || "ShopeePay",
                1
              )
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold transition-all active:scale-95 shadow-sm"
            title="Klik untuk tes suara chime dan pembicara TTS sekarang"
          >
            <Volume2 size={13} />
            <span>Tes Suara</span>
          </button>

          {/* Sound Toggle ON / Mute */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSoundEnabled(prev => !prev)
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all"
            style={soundEnabled ? { borderColor: "rgba(0,255,213,0.3)", color: "var(--neon-cyan)", background: "rgba(0,255,213,0.06)" } : { borderColor: "rgba(255,255,255,0.1)", color: "#94a3b8" }}
            title={soundEnabled ? "Suara Aktif" : "Suara Dimatikan"}
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span>{soundEnabled ? "ON" : "Mute"}</span>
          </button>

          <div className="text-right pl-2 border-l border-white/10">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Total Masuk</p>
            <p className="text-sm font-black neon-green-text">{formatRp(totalAmount)}</p>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Users size={13} />
            <span className="font-mono">{txs.length} Trx</span>
          </div>
          <span className="text-xs font-mono text-slate-300">{time}</span>
          <Link href="/admin" className="text-xs px-3 py-1.5 rounded-lg border border-white/20 hover:border-cyan-400 transition-colors text-slate-400 hover:text-white">
            Panel Admin
          </Link>
        </div>
      </header>

      {/* Audio Unlock Notice Bar */}
      {!audioUnlockedState && (
        <div
          onClick={triggerUnlock}
          className="glass rounded-xl px-4 py-2.5 flex items-center justify-between border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-medium cursor-pointer animate-pulse hover:bg-amber-500/20 transition-all"
        >
          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-amber-400 shrink-0" />
            <span>
              <strong>Audio Browser Belum Aktif:</strong> Klik di sini (atau klik di mana saja pada layar) agar browser mengizinkan pemutaran suara chime & pembacaan notifikasi soundbox otomatis.
            </span>
          </div>
          <span className="shrink-0 ml-3 px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shadow-md hover:bg-amber-400 transition-colors">
            Aktifkan Suara Sekarang
          </span>
        </div>
      )}

      {/* Main content — QR kiri, info kanan */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">

        {/* LEFT: QR Code */}
        <div className="col-span-5 flex flex-col gap-4">
          <div className="glass rounded-2xl p-6 flex-1 flex flex-col items-center justify-center">
            <p className="text-xs tracking-widest uppercase text-slate-400 mb-4 flex items-center gap-2">
              <Wifi size={14} className="animate-pulse" style={{ color: "var(--neon-cyan)" }} />
              Scan untuk Membayar / Donasi
            </p>
            <div className="qris-scan-border relative inline-block">
              <div className="scan-line" />
              <div className="p-3 bg-white rounded-2xl shadow-2xl" style={{ boxShadow: "0 0 40px rgba(0,255,213,0.2)" }}>
                <Image src={`${basePath}/qris-detronics.png`} alt="QRIS Detronics ID" width={280} height={280} className="rounded-xl" priority />
              </div>
            </div>
            <div className="mt-5 text-center space-y-1">
              <p className="text-white font-bold text-lg">Detronics ID</p>
              <p className="text-slate-400 text-sm">Store ID: <span className="font-mono text-white">23598782</span></p>
              <p className="text-xs text-slate-500 mt-2">GoPay · ShopeePay · OVO · Dana · BCA · Mandiri · +20 Lainnya</p>
            </div>
          </div>

          {/* Activity feed di bawah QR */}
          <ActivityFeed txs={txs} />
        </div>

        {/* RIGHT: Stats + Leaderboard */}
        <div className="col-span-7 flex flex-col gap-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Masuk</p>
              <p className="text-xl font-black neon-green-text">{formatRp(totalAmount)}</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Transaksi</p>
              <p className="text-xl font-black neon-text">{txs.length}</p>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Rata-rata</p>
              <p className="text-xl font-black text-amber-400">
                {txs.length ? formatRp(Math.round(totalAmount / txs.length)) : "Rp 0"}
              </p>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="flex-1">
            <LeaderboardCard entries={leaderboard} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="glass rounded-xl px-6 py-2 flex items-center justify-between">
        <p className="text-xs text-slate-500">Terima kasih sudah support Detronics ID!</p>
        <p className="text-xs text-slate-600 font-mono">
          {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </footer>

      {/* Alert Overlay */}
      <TransactionAlert tx={latest} show={showAlert} onDismiss={dismissAlert} />
    </div>
  )
}

