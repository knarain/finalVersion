"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FormData {
  name: string
  email: string
  phone: string
  eventType: string
  eventDate: string
  message: string
}

interface SubmissionState {
  isSubmitting: boolean
  isSuccess: boolean
  error: string | null
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    message: "",
  })

  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    isSubmitting: false,
    isSuccess: false,
    error: null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setSubmissionState({
      isSubmitting: true,
      isSuccess: false,
      error: null,
    })

    // Simulate form submission delay
    setTimeout(() => {
      setSubmissionState({
        isSubmitting: false,
        isSuccess: true,
        error: null,
      })

      // Reset form on success
      setFormData({
        name: "",
        email: "",
        phone: "",
        eventType: "",
        eventDate: "",
        message: "",
      })

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmissionState((prev) => ({ ...prev, isSuccess: false }))
      }, 5000)
    }, 2000)
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (submissionState.error) {
      setSubmissionState((prev) => ({ ...prev, error: null }))
    }
  }

  if (submissionState.isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Message Sent Successfully!</h3>
        <p className="text-gray-300 mb-6">Thank you for reaching out. I'll get back to you within 24 hours.</p>
        <Button
          onClick={() => setSubmissionState((prev) => ({ ...prev, isSuccess: false }))}
          variant="outline"
          className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black"
        >
          Send Another Message
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {submissionState.error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-400 text-sm">{submissionState.error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-300">
              Full Name *
            </label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-amber-400 focus:ring-amber-400"
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email Address *
            </label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-amber-400 focus:ring-amber-400"
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-gray-300">
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-amber-400 focus:ring-amber-400"
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="eventType" className="text-sm font-medium text-gray-300">
              Event Type *
            </label>
            <Select value={formData.eventType} onValueChange={(value) => handleChange("eventType", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:border-amber-400 focus:ring-amber-400">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="wedding">Wedding</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="portrait">Portrait Session</SelectItem>
                <SelectItem value="family">Family Photography</SelectItem>
                <SelectItem value="corporate">Corporate Event</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="eventDate" className="text-sm font-medium text-gray-300">
            Event Date
          </label>
          <Input
            id="eventDate"
            type="date"
            value={formData.eventDate}
            onChange={(e) => handleChange("eventDate", e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-amber-400 focus:ring-amber-400"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium text-gray-300">
            Message *
          </label>
          <Textarea
            id="message"
            required
            rows={6}
            value={formData.message}
            onChange={(e) => handleChange("message", e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-amber-400 focus:ring-amber-400 resize-none"
            placeholder="Tell me about your event, vision, and any specific requirements..."
          />
        </div>

        <Button
          type="submit"
          disabled={submissionState.isSubmitting}
          className="w-full bg-amber-400 text-black hover:bg-amber-300 font-semibold py-3 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submissionState.isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Sending Message...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Send Message
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </span>
          )}
        </Button>
      </form>
    </div>
  )
}
