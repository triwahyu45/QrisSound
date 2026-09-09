"use client"
import { useState, useEffect, useCallback } from "react"
import {
  Transaction, getTransactions, getLeaderboard, LeaderEntry,
  EV_ADD_NAME, EV_CLEAR_NAME
} from "@/lib/store"

export function useTransactions() {
  const [txs, setTxs] = useState<Transaction[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([])
  const [latest, setLatest] = useState<Transaction | null>(null)
  const [showAlert, setShowAlert] = useState(false)

  const refresh = useCallback(() => {
    const data = getTransactions()
    setTxs(data)
    setLeaderboard(getLeaderboard(data))
  }, [])

  useEffect(() => {
    refresh()

    const handleAdd = (e: Event) => {
      const tx = (e as CustomEvent<Transaction>).detail
      setLatest(tx)
      setShowAlert(true)
      refresh()
    }

    const handleClear = () => {
      setTxs([])
      setLeaderboard([])
      setLatest(null)
      setShowAlert(false)
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "detronics_txs") refresh()
    }

    window.addEventListener(EV_ADD_NAME, handleAdd)
    window.addEventListener(EV_CLEAR_NAME, handleClear)
    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener(EV_ADD_NAME, handleAdd)
      window.removeEventListener(EV_CLEAR_NAME, handleClear)
      window.removeEventListener("storage", handleStorage)
    }
  }, [refresh])

  const dismissAlert = () => setShowAlert(false)

  return { txs, leaderboard, latest, showAlert, dismissAlert }
}
