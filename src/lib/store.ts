"use client"

export type PaymentMethod =
  | "GoPay" | "ShopeePay" | "OVO" | "DANA" | "LinkAja"
  | "BCA" | "Mandiri" | "BNI" | "BRI" | "BSI"
  | "QRIS" | "Lainnya"

export const PAYMENT_METHODS: PaymentMethod[] = [
  "QRIS", "GoPay", "ShopeePay", "OVO", "DANA", "LinkAja",
  "BCA", "Mandiri", "BNI", "BRI", "BSI", "Lainnya"
]

export interface Transaction {
  id: string
  name: string
  amount: number
  message: string
  paymentMethod: PaymentMethod
  timestamp: number
}

export interface LeaderEntry {
  name: string
  total: number
}

const KEY = "detronics_txs"
const EV_ADD = "dtx_add"
const EV_CLEAR = "dtx_clear"

export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]")
  } catch {
    return []
  }
}

export function addTransaction(tx: Omit<Transaction, "id" | "timestamp">): Transaction {
  const txs = getTransactions()
  const newTx: Transaction = {
    ...tx,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    timestamp: Date.now(),
  }
  const updated = [newTx, ...txs].slice(0, 200)
  localStorage.setItem(KEY, JSON.stringify(updated))
  window.dispatchEvent(new CustomEvent(EV_ADD, { detail: newTx }))
  return newTx
}

export function clearTransactions(): void {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new CustomEvent(EV_CLEAR))
}

export function getLeaderboard(txs: Transaction[]): LeaderEntry[] {
  const map = new Map<string, number>()
  for (const tx of txs) map.set(tx.name, (map.get(tx.name) ?? 0) + tx.amount)
  return Array.from(map.entries()).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total)
}

export function formatRp(n: number): string {
  return "Rp " + n.toLocaleString("id-ID")
}

export function terbilang(n: number): string {
  if (n === 0) return "nol"
  const sat = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"]
  const bel = ["sepuluh", "sebelas", "dua belas", "tiga belas", "empat belas", "lima belas",
    "enam belas", "tujuh belas", "delapan belas", "sembilan belas"]
  if (n < 10) return sat[n]
  if (n < 20) return bel[n - 10]
  if (n < 100) return sat[Math.floor(n / 10)] + " puluh" + (n % 10 ? " " + sat[n % 10] : "")
  if (n < 1000) {
    const h = Math.floor(n / 100), r = n % 100
    return (h === 1 ? "seratus" : sat[h] + " ratus") + (r ? " " + terbilang(r) : "")
  }
  if (n < 1000000) {
    const k = Math.floor(n / 1000), r = n % 1000
    return (k === 1 ? "seribu" : terbilang(k) + " ribu") + (r ? " " + terbilang(r) : "")
  }
  if (n < 1000000000) {
    const m = Math.floor(n / 1000000), r = n % 1000000
    return terbilang(m) + " juta" + (r ? " " + terbilang(r) : "")
  }
  return n.toLocaleString("id-ID")
}

export function timeAgo(ts: number): string {
  const d = Math.floor((Date.now() - ts) / 1000)
  if (d < 5) return "Baru saja"
  if (d < 60) return `${d} detik lalu`
  if (d < 3600) return `${Math.floor(d / 60)} menit lalu`
  return new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

export const EV_ADD_NAME = EV_ADD
export const EV_CLEAR_NAME = EV_CLEAR
