"use client"
import { Transaction, getFirebaseUrl, parseRawNotification, PaymentMethod } from "./store"

export interface FirebaseRawPayload {
  name?: string
  amount?: number | string
  message?: string
  paymentMethod?: PaymentMethod
  raw?: string
  timestamp?: number
}

export function normalizeFirebaseTx(id: string, data: FirebaseRawPayload): Transaction {
  let name = data.name || "Pelanggan"
  let amount = typeof data.amount === "number" ? data.amount : parseInt(String(data.amount || "0").replace(/[^0-9]/g, ""), 10) || 0
  let message = data.message || ""
  let paymentMethod: PaymentMethod = data.paymentMethod || "ShopeePay"

  // If raw notification text is supplied and amount is 0 or name is default, parse it
  if (data.raw && (!amount || name === "Pelanggan")) {
    const parsed = parseRawNotification(data.raw)
    if (!amount) amount = parsed.amount
    if (name === "Pelanggan" && parsed.name) name = parsed.name
    if (!data.paymentMethod && parsed.paymentMethod) paymentMethod = parsed.paymentMethod
  }

  return {
    id: id || String(data.timestamp || Date.now()),
    name: name || "Pelanggan",
    amount: amount || 10000,
    message,
    paymentMethod,
    timestamp: data.timestamp || Date.now()
  }
}

export async function testFirebaseConnection(url: string): Promise<{ success: boolean; message: string }> {
  try {
    const cleanUrl = url.trim().replace(/\/+$/, "")
    if (!cleanUrl.startsWith("https://")) {
      return { success: false, message: "URL harus diawali dengan https://" }
    }
    const endpoint = cleanUrl.endsWith(".json") ? cleanUrl : cleanUrl + "/test_connection.json"
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ping: "ok", time: Date.now() })
    })
    if (res.ok) {
      return { success: true, message: "Berhasil terhubung ke Firebase Realtime Database!" }
    } else {
      const errText = await res.text()
      return { success: false, message: `Gagal (${res.status}): ${errText}` }
    }
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal menghubungi Firebase URL" }
  }
}

export async function fetchFirebaseTransactions(): Promise<Transaction[]> {
  const url = getFirebaseUrl()
  if (!url) return []
  try {
    const endpoint = `${url}/transactions.json?orderBy="$key"&limitToLast=50`
    const res = await fetch(endpoint)
    if (!res.ok) return []
    const data = await res.json()
    if (!data) return []

    const list: Transaction[] = []
    for (const [id, item] of Object.entries(data)) {
      if (item && typeof item === "object") {
        list.push(normalizeFirebaseTx(id, item as FirebaseRawPayload))
      }
    }
    return list.sort((a, b) => b.timestamp - a.timestamp)
  } catch (e) {
    console.warn("fetchFirebaseTransactions error:", e)
    return []
  }
}

export async function pushTransactionToFirebase(tx: Omit<Transaction, "id" | "timestamp">): Promise<boolean> {
  const url = getFirebaseUrl()
  if (!url) return false
  try {
    const endpoint = `${url}/transactions.json`
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...tx,
        timestamp: Date.now()
      })
    })
    return res.ok
  } catch (e) {
    console.warn("pushTransactionToFirebase error:", e)
    return false
  }
}

export function listenFirebaseRealtime(onNewTx: (tx: Transaction) => void): () => void {
  const url = getFirebaseUrl()
  if (!url || typeof window === "undefined") return () => {}

  let es: EventSource | null = null
  let isInitial = true
  const seenIds = new Set<string>()

  try {
    const endpoint = `${url}/transactions.json`
    es = new EventSource(endpoint)

    es.addEventListener("put", (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data)
        if (!payload) return

        // Case 1: Initial full dump
        if (payload.path === "/" && payload.data) {
          if (typeof payload.data === "object") {
            Object.keys(payload.data).forEach(k => seenIds.add(k))
          }
          isInitial = false
          return
        }

        // Case 2: New single child pushed, path e.g. "/-OPq2..."
        if (payload.path && payload.path !== "/") {
          const id = payload.path.replace(/^\//, "")
          if (!seenIds.has(id)) {
            seenIds.add(id)
            if (!isInitial && payload.data && typeof payload.data === "object") {
              const normalized = normalizeFirebaseTx(id, payload.data)
              onNewTx(normalized)
            }
          }
        }
      } catch (err) {
        console.warn("SSE parse error:", err)
      }
    })

    es.onerror = (e) => {
      console.warn("Firebase SSE error, will auto-reconnect:", e)
    }
  } catch (e) {
    console.warn("EventSource init error:", e)
  }

  return () => {
    if (es) {
      es.close()
      es = null
    }
  }
}
