"use client"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Send, Zap, Trash2, Play, Pause, Volume2, VolumeX, Download, RotateCcw } from "lucide-react"
import { addTransaction, clearTransactions, getTransactions, formatRp, Transaction, terbilang, PAYMENT_METHODS, PaymentMethod } from "@/lib/store"
import { playChime, speak } from "@/lib/audio"

const PRESETS = [
  { label: "Rp 2K", amount: 2000 },
  { label: "Rp 5K", amount: 5000 },
  { label: "Rp 10K", amount: 10000 },
  { label: "Rp 25K", amount: 25000 },
  { label: "Rp 50K", amount: 50000 },
  { label: "Rp 100K", amount: 100000 },
]

const MOCK_NAMES = ["MekaSquad", "RoboEnthusiast", "ElektroFan", "Pak Budi", "Si Andi", "DroneLover", "CircuitGeek", "NanoBot99", "Kang Teguh", "Wahyu Jr"]
const MOCK_MESSAGES = [
  "Semangat terus mas!",
  "Mantap jiwa kontennya!",
  "Gas terus detronicsnya",
  "Salam dari anak meka UNY!",
  "Keep it up bro!",
  "Halo dari Bandung",
  "Sukses terus channelnya!",
  "",
]

export default function AdminPage() {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState<number | "">("")
  const [message, setMessage] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("QRIS")
  const [txs, setTxs] = useState<Transaction[]>([])
  const [simRunning, setSimRunning] = useState(false)
  const [simInterval, setSimInterval] = useState(8)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setTxs(getTransactions())
    const handleUpdate = () => setTxs(getTransactions())
    window.addEventListener("dtx_add", handleUpdate)
    window.addEventListener("dtx_clear", handleUpdate)
    window.addEventListener("storage", handleUpdate)
    return () => {
      window.removeEventListener("dtx_add", handleUpdate)
      window.removeEventListener("dtx_clear", handleUpdate)
      window.removeEventListener("storage", handleUpdate)
    }
  }, [])

  const trigger = (n: string, a: number, m: string, pm: PaymentMethod) => {
    if (!n.trim() || !a) return
    addTransaction({ name: n.trim(), amount: a, message: m.trim(), paymentMethod: pm })
    if (!muted) {
      playChime(volume)
      setTimeout(() => speak(
        `Diterima ${terbilang(a)} rupiah melalui ${pm} dari ${n}. Terima kasih sudah support Detronics I D!${m ? " Pesan: " + m : ""}`,
        volume
      ), 800)
    }
  }

  const handleSubmit = () => {
    if (!name.trim() || !amount) return alert("Nama dan nominal wajib diisi!")
    trigger(name, Number(amount), message, paymentMethod)
    setName(""); setAmount(""); setMessage("")
  }

  const randomSim = () => {
    const n = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)]
    const amounts = [2000, 5000, 10000, 10000, 25000, 50000, 100000]
    const a = amounts[Math.floor(Math.random() * amounts.length)]
    const m = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)]
    const pm = PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)]
    trigger(n, a, m, pm)
  }

  const toggleSim = () => {
    if (simRunning) {
      if (simRef.current) clearInterval(simRef.current)
      setSimRunning(false)
    } else {
      randomSim()
      simRef.current = setInterval(randomSim, simInterval * 1000)
      setSimRunning(true)
    }
  }

  useEffect(() => () => { if (simRef.current) clearInterval(simRef.current) }, [])

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(txs, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url
    a.download = `detronics_txs_${Date.now()}.json`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen grid-bg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black" style={{ background: "linear-gradient(135deg, var(--neon-cyan), #0080ff)", color: "#050d1a" }}>D</div>
          <div>
            <h1 className="text-lg font-black neon-text">STREAMER PANEL</h1>
            <p className="text-xs text-slate-400">Detronics ID — Store ID 23598782</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/" target="_blank" className="text-xs px-3 py-2 rounded-lg glass hover:border-cyan-400 transition-colors">🖥 Display</Link>
          <Link href="/overlay" target="_blank" className="text-xs px-3 py-2 rounded-lg glass hover:border-cyan-400 transition-colors">🎬 OBS Overlay</Link>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left: Input Form */}
        <div className="col-span-5 space-y-4">
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold uppercase tracking-widest neon-text mb-4 flex items-center gap-2"><Send size={14} /> Input Transaksi</h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Nama Pengirim *</label>
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Nominal (Rp) *</label>
                <input
                  type="number" value={amount} onChange={e => setAmount(e.target.value ? Number(e.target.value) : "")}
                  placeholder="50000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map(p => (
                  <button key={p.amount} onClick={() => setAmount(p.amount)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${Number(amount) === p.amount ? "text-[#050d1a]" : "glass text-slate-300 hover:border-cyan-400"}`}
                    style={Number(amount) === p.amount ? { background: "var(--neon-cyan)", boxShadow: "0 0 12px var(--neon-cyan)" } : {}}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Pesan / Ucapan (opsional)</label>
                <textarea
                  value={message} onChange={e => setMessage(e.target.value)} rows={2}
                  placeholder="Semangat terus mas!"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Metode Pembayaran</label>
                <select
                  value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  style={{ background: "#0a1628" }}
                >
                  {PAYMENT_METHODS.map(m => (
                    <option key={m} value={m} style={{ background: "#0a1628" }}>{m}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleSubmit}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
                style={{ background: "linear-gradient(135deg, var(--neon-cyan), #0080ff)", color: "#050d1a" }}
              >
                <Zap size={16} /> Trigger Transaksi
              </button>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold uppercase tracking-widest neon-text mb-4 flex items-center gap-2"><Volume2 size={14} /> Audio Soundbox</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Suara</span>
                <button onClick={() => setMuted(m => !m)}
                  className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all ${muted ? "bg-red-900/40 text-red-400 border border-red-900" : "glass text-green-400"}`}
                >
                  {muted ? <><VolumeX size={14} /> OFF</> : <><Volume2 size={14} /> ON</>}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-14">Volume</span>
                <input type="range" min={0} max={1} step={0.05} value={volume}
                  onChange={e => setVolume(Number(e.target.value))}
                  className="flex-1 accent-cyan-400"
                />
                <span className="text-xs text-slate-400 w-10">{Math.round(volume * 100)}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => playChime(volume)}
                  className="glass py-2 rounded-xl text-xs hover:border-cyan-400 transition-colors">
                  🔔 Test Chime
                </button>
                <button onClick={() => speak("Pembayaran berhasil diterima oleh Detronics I D. Terima kasih!", volume)}
                  className="glass py-2 rounded-xl text-xs hover:border-cyan-400 transition-colors">
                  🗣 Test TTS
                </button>
              </div>
            </div>
          </div>

          {/* Simulator */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold uppercase tracking-widest neon-text mb-4 flex items-center gap-2">
              {simRunning ? <Pause size={14} /> : <Play size={14} />} Auto Simulator
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-16">Interval</span>
                <input type="range" min={3} max={30} step={1} value={simInterval}
                  onChange={e => setSimInterval(Number(e.target.value))}
                  className="flex-1 accent-cyan-400"
                />
                <span className="text-xs text-slate-400 w-10">{simInterval}s</span>
              </div>
              <button onClick={toggleSim}
                className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${simRunning ? "bg-red-900/40 text-red-400 border border-red-900 hover:bg-red-900/60" : "glass hover:border-cyan-400"}`}
              >
                {simRunning ? <><Pause size={14} /> Stop Simulator</> : <><Play size={14} /> Start Simulator</>}
              </button>
              <button onClick={randomSim}
                className="w-full py-2 glass rounded-xl text-xs hover:border-cyan-400 transition-colors flex items-center justify-center gap-1">
                <RotateCcw size={12} /> Trigger 1x Acak
              </button>
            </div>
          </div>
        </div>

        {/* Right: Transaction Log */}
        <div className="col-span-7">
          <div className="glass rounded-2xl p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest neon-text">Log Transaksi ({txs.length})</h2>
              <div className="flex gap-2">
                <button onClick={exportJSON}
                  className="glass px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 hover:border-cyan-400 transition-colors">
                  <Download size={12} /> Export
                </button>
                <button onClick={() => { if (confirm("Hapus semua transaksi?")) { clearTransactions(); setTxs([]) } }}
                  className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors"
                  style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#ef4444" }}>
                  <Trash2 size={12} /> Clear All
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto space-y-2">
              {txs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <Zap size={32} className="mb-3 opacity-30" />
                  <p className="text-sm">Belum ada transaksi</p>
                  <p className="text-xs mt-1">Trigger dari form kiri atau aktifkan simulator</p>
                </div>
              )}
              {txs.map((tx, i) => (
                <div key={tx.id} className={`flex items-start gap-3 p-3 rounded-xl transition-all ${i === 0 ? "border animate-fade-in" : "bg-white/3"}`}
                  style={i === 0 ? { borderColor: "rgba(0,255,213,0.3)", background: "rgba(0,255,213,0.05)" } : {}}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: "rgba(0,255,213,0.15)", color: "var(--neon-cyan)" }}>
                    {tx.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{tx.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-slate-400">{tx.paymentMethod}</span>
                          <span className="font-black text-sm neon-green-text">{formatRp(tx.amount)}</span>
                        </div>
                      </div>
                    {tx.message && <p className="text-xs text-slate-400 italic truncate mt-0.5">&ldquo;{tx.message}&rdquo;</p>}
                    <p className="text-xs text-slate-600 mt-0.5">{new Date(tx.timestamp).toLocaleTimeString("id-ID")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
