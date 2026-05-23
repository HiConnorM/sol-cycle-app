'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Trash2, Heart } from 'lucide-react'

const PRIVACY_KEY = 'sol-cycle-privacy-accepted'

export function isPrivacyAccepted(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(PRIVACY_KEY) === 'true'
}

export function markPrivacyAccepted(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PRIVACY_KEY, 'true')
}

interface PrivacyConsentProps {
  onAccept: () => void
}

export function PrivacyConsent({ onAccept }: PrivacyConsentProps) {
  function accept() {
    markPrivacyAccepted()
    onAccept()
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-between px-6 max-w-md mx-auto" style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))', paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}>
      {/* Icon */}
      <div className="w-full flex justify-center pt-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#BFD8C2] to-[#EAD9A0] flex items-center justify-center shadow-lg">
          <Shield className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 flex flex-col justify-center space-y-6 w-full"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Before you begin</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A few things worth knowing about how Sol Cycle handles your data.
          </p>
        </div>

        {/* Privacy facts */}
        <div className="space-y-3">
          {[
            {
              icon: <Lock className="w-5 h-5 text-[#BFD8C2]" />,
              title: 'Your data stays on your device',
              body: "Cycle logs, symptoms, moods, and settings are stored only in your browser's local storage. Nothing is sent to any server.",
            },
            {
              icon: <Trash2 className="w-5 h-5 text-[#E6B8A2]" />,
              title: 'You can delete everything, any time',
              body: 'Use "Delete All Data" in Settings → Privacy & Data to permanently remove all information from this device.',
            },
            {
              icon: <Heart className="w-5 h-5 text-[#D8A7A7]" />,
              title: 'This is not medical advice',
              body: 'Sol Cycle provides pattern tracking and personal insights — not diagnoses, medical guidance, or treatment recommendations. Always consult a qualified clinician for health concerns.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 p-4 rounded-2xl bg-secondary/60"
            >
              <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <div className="w-full space-y-3 pt-6">
        <button
          onClick={accept}
          className="w-full py-4 rounded-full bg-foreground text-background font-medium text-base active:opacity-80 transition-opacity"
        >
          I understand, continue
        </button>
        <p className="text-xs text-center text-muted-foreground leading-relaxed px-2">
          By continuing you acknowledge that Sol Cycle is a personal tracking tool and not a medical device or service.
        </p>
      </div>
    </div>
  )
}
