"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import {
  Transaction, getTransactions, getLeaderboard, LeaderEntry,
  EV_ADD_NAME, EV_CLEAR_NAME, getFirebaseUrl
} from "@/lib/store"
import { fetchFirebaseTransactions, listenFirebaseRealtime } from "@/lib/firebase"

export function useTransactions() {
  const [txs, setTxs] = useState<Transaction[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([])
  const [latest, setLatest] = useState<Transaction | null>(null)
  const [showAlert, setShowAlert] = useState(false)
  const [isCloudConnected, setIsCloudConnected] = useState(false)
  const seenTxIds = useRef<Set<string>>(new Set())

  const mergeTransactions = useCallback((newItems: Transaction[]) => {
    setTxs(prev => {
      const map = new Map<string, Transaction>()
      // Existing
      prev.forEach(t => map.set(t.id, t))
      // New items
      newItems.forEach(t => map.set(t.id, t))
      const combined = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp).slice(0, 200)
      setLeaderboard(getLeaderboard(combined))
      return combined
    })
  }, [])

  const refresh = useCallback(() => {
    const data = getTransactions()
    data.forEach(t => seenTxIds.current.add(t.id))
    setTxs(data)
    setLeaderboard(getLeaderboard(data))
  }, [])

  useEffect(() => {
    refresh()

    const handleAdd = (e: Event) => {
      const tx = (e as CustomEvent<Transaction>).detail
      seenTxIds.current.add(tx.id)
      setLatest(tx)
      setShowAlert(true)
      refresh()
    }

    const handleClear = () => {
      setTxs([])
      setLeaderboard([])
      setLatest(null)
      setShowAlert(false)
      seenTxIds.current.clear()
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "detronics_txs") refresh()
    }

    window.addEventListener(EV_ADD_NAME, handleAdd)
    window.addEventListener(EV_CLEAR_NAME, handleClear)
    window.addEventListener("storage", handleStorage)

    // Firebase Integration
    const fbUrl = getFirebaseUrl()
    let cleanupFirebase: (() => void) | null = null

    if (fbUrl) {
      setIsCloudConnected(true)
      // Fetch history
      fetchFirebaseTransactions().then(cloudTxs => {
        if (cloudTxs.length > 0) {
          cloudTxs.forEach(t => seenTxIds.current.add(t.id))
          mergeTransactions(cloudTxs)
        }
      })

      // Realtime listener
      cleanupFirebase = listenFirebaseRealtime((newTx: Transaction) => {
        if (!seenTxIds.current.has(newTx.id)) {
          seenTxIds.current.add(newTx.id)
          setLatest(newTx)
          setShowAlert(true)
          mergeTransactions([newTx])
        }
      })
    } else {
      setIsCloudConnected(false)
    }

    return () => {
      window.removeEventListener(EV_ADD_NAME, handleAdd)
      window.removeEventListener(EV_CLEAR_NAME, handleClear)
      window.removeEventListener("storage", handleStorage)
      if (cleanupFirebase) cleanupFirebase()
    }
  }, [refresh, mergeTransactions])

  const dismissAlert = () => setShowAlert(false)

  return { txs, leaderboard, latest, showAlert, dismissAlert, isCloudConnected }
}

