"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from "axios"

interface AlbumAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthenticate: (email: string, password: string, captchaId: string, captchaText: string) => Promise<boolean>
  albumName: string
  albumCode?: string
}

export function AlbumAuthModal({ isOpen, onClose, onAuthenticate, albumName, albumCode }: AlbumAuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [captchaId, setCaptchaId] = useState("")
  const [captchaImage, setCaptchaImage] = useState("")
  const [captchaText, setCaptchaText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadCaptcha()
    }
  }, [isOpen])

  const loadCaptcha = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/captcha`
      )
      if (res.data.results) {
        setCaptchaId(res.data.results.captcha_id)
        setCaptchaImage(res.data.results.captcha_image)
        setCaptchaText("")
      }
    } catch (err) {
      setError("Failed to load CAPTCHA")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const success = await onAuthenticate(email, password, captchaId, captchaText)
      if (success) {
        setEmail("")
        setPassword("")
        setCaptchaText("")
        setError(null)
        onClose()
      } else {
        setError("Invalid email, password, or captcha. Please try again.")
        loadCaptcha()
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Authentication failed. Please try again."
      )
      loadCaptcha()
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmail("")
    setPassword("")
    setCaptchaText("")
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-800 rounded-lg p-8 w-full max-w-md mx-4 shadow-2xl">
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-light text-white mb-2 tracking-wide">Access Private Album</h2>
          <p className="text-gray-400 font-light">
            Enter your credentials to view <span className="text-amber-400">{albumName}</span>
          </p>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300 font-light">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-amber-400 focus:ring-amber-400/20"
              placeholder="Enter your email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300 font-light">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-amber-400 focus:ring-amber-400/20"
              placeholder="Enter your password"
            />
          </div>

          {/* CAPTCHA */}
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <label className="block mb-2 text-sm font-light text-gray-300">CAPTCHA</label>
            {captchaImage && (
              <img
                src={captchaImage}
                alt="CAPTCHA"
                className="w-full max-w-xs mx-auto mb-3 rounded bg-white p-1 border border-gray-600"
              />
            )}
            <input
              type="text"
              value={captchaText}
              onChange={(e) => setCaptchaText(e.target.value.toUpperCase())}
              placeholder="Enter CAPTCHA text"
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 uppercase text-center tracking-widest"
              maxLength={5}
              required
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                loadCaptcha()
              }}
              className="mt-2 text-xs text-amber-400 hover:text-amber-300 w-full text-center font-light"
            >
              Get new CAPTCHA
            </button>
          </div>

          {error && (
            <div className="text-red-400 text-sm font-light bg-red-400/10 border border-red-400/20 rounded-md p-3">
              {error}
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white font-light bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !captchaId}
              className="flex-1 bg-amber-400 text-black hover:bg-amber-500 font-light disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                "Access Album"
              )}
            </Button>
          </div>
        </form>
        <div className="mt-6 pt-6 border-t border-gray-800">
          <p className="text-gray-500 text-sm font-light text-center">
            Don't have access? Contact us for your album credentials.
          </p>
        </div>
      </div>
    </div>
  )
}
