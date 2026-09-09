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

const FIREBASE_KEY = "detronics_firebase_url"
export const DEFAULT_FIREBASE_URL = "https://detronics-qris-default-rtdb.asia-southeast1.firebasedatabase.app"

export function getFirebaseUrl(): string {
  if (typeof window === "undefined") return DEFAULT_FIREBASE_URL
  const saved = localStorage.getItem(FIREBASE_KEY)
  return saved !== null ? saved : DEFAULT_FIREBASE_URL
}

export function setFirebaseUrl(url: string): void {
  if (typeof window === "undefined") return
  const clean = url.trim().replace(/\/+$/, "")
  if (clean) {
    localStorage.setItem(FIREBASE_KEY, clean)
  } else {
    localStorage.removeItem(FIREBASE_KEY)
  }
}

export function parseRawNotification(text: string): {
  name: string
  amount: number
  message: string
  paymentMethod: PaymentMethod
} {
  let cleanText = text
    .replace(/\{not_text\}/gi, "")
    .replace(/\[not_text\]/gi, "")
    .replace(/\{not_ticker\}/gi, "")
    .replace(/\[not_ticker\]/gi, "")
    .replace(/\{not_title\}/gi, "")
    .replace(/\[not_title\]/gi, "")
    .replace(/\{not_big_text\}/gi, "")
    .replace(/\[not_big_text\]/gi, "")
    .trim()

  // 1. Detect Payment Method
  let paymentMethod: PaymentMethod = "ShopeePay"
  const lower = cleanText.toLowerCase()
  if (lower.includes("gopay") || lower.includes("go-pay")) paymentMethod = "GoPay"
  else if (lower.includes("shopee") || lower.includes("spay") || lower.includes("a payment of")) paymentMethod = "ShopeePay"
  else if (lower.includes("ovo")) paymentMethod = "OVO"
  else if (lower.includes("dana")) paymentMethod = "DANA"
  else if (lower.includes("linkaja") || lower.includes("link aja")) paymentMethod = "LinkAja"
  else if (lower.includes("bca")) paymentMethod = "BCA"
  else if (lower.includes("mandiri") || lower.includes("livin")) paymentMethod = "Mandiri"
  else if (lower.includes("bni")) paymentMethod = "BNI"
  else if (lower.includes("bri") || lower.includes("brimo")) paymentMethod = "BRI"
  else if (lower.includes("bsi")) paymentMethod = "BSI"
  else if (lower.includes("qris")) paymentMethod = "QRIS"

  // 2. Extract Amount (Supports Rp67, Rp 50.000, 50000, etc.)
  let amount = 0
  const rpMatch = cleanText.match(/(?:rp\.?|idr)\s*([\d.,]+)/i)
  if (rpMatch && rpMatch[1]) {
    const rawNum = rpMatch[1].replace(/[^\d]/g, "")
    amount = parseInt(rawNum, 10) || 0
  } else {
    const numMatch = cleanText.match(/\b\d{2,9}\b/)
    if (numMatch) {
      amount = parseInt(numMatch[0], 10) || 0
    }
  }

  // 3. Extract Sender Name (Indonesian & English)
  let name = ""
  const custMatch = cleanText.match(/(?:customer(?:\s*name)?|nama(?:\s*pengirim)?|pengirim)\s*[:=]\s*([A-Za-z0-9\s.]+?)(?:\s*[\n\r;|\-]|\s+ref|\s+rp|$)/i)
  const dariMatch = cleanText.match(/dari\s+([A-Za-z0-9\s.]+?)(?:\s+berhasil|\s+sebesar|\s+melalui|\s+ke|\s+pada|\s+ref|$|\.)/i)
  const fromMatch = cleanText.match(/from\s+([A-Za-z0-9\s.]+?)(?:\s+has|\s+for|\s+ref|\.|;|$)/i)
  const olehMatch = cleanText.match(/oleh\s+([A-Za-z0-9\s.]+?)(?:\s+berhasil|\s+sebesar|$|\.)/i)

  if (custMatch && custMatch[1] && custMatch[1].trim().length > 1) {
    name = custMatch[1].trim()
  } else if (dariMatch && dariMatch[1] && dariMatch[1].trim().length > 1) {
    name = dariMatch[1].trim()
  } else if (fromMatch && fromMatch[1] && fromMatch[1].trim().length > 1) {
    name = fromMatch[1].trim()
  } else if (olehMatch && olehMatch[1] && olehMatch[1].trim().length > 1) {
    name = olehMatch[1].trim()
  }

  // Clean name from ref codes or junk
  name = name.replace(/^ref:.*$/i, "").replace(/ref:\s*\d+/i, "").trim()

  // 4. If name is still empty, try extracting Ref code to make unique "Pelanggan #xxxx"
  if (!name || name.length < 2) {
    const refMatch = cleanText.match(/ref(?:\s*id|\s*no|erence)?\s*[:#.]?\s*([A-Za-z0-9]+)/i)
    if (refMatch && refMatch[1] && refMatch[1].length >= 4) {
      name = `Pelanggan #${refMatch[1].slice(-4)}`
    } else {
      name = "Pelanggan"
    }
  }

  return {
    name: name.slice(0, 30),
    amount: amount > 0 ? amount : 10000,
    message: "",
    paymentMethod
  }
}
