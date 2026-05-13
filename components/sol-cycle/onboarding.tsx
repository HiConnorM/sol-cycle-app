'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, ChevronRight, Heart, Activity, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { saveCycleSettings, getCycleSettings } from '@/lib/storage/cycle-storage'

const ONBOARDING_KEY = 'sol-cycle-onboarding-complete'

export function isOnboardingComplete(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(ONBOARDING_KEY) === 'true'
}

export function markOnboardingComplete(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ONBOARDING_KEY, 'true')
}

interface OnboardingProps {
  onComplete: () => void
}

type Step = 'welcome' | 'period' | 'care' | 'done'

const STEPS: Step[] = ['welcome', 'period', 'care', 'done']

const SLIDE = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { type: 'spring' as const, damping: 28, stiffness: 300 },
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<Step>('welcome')
  const [direction, setDirection] = useState(1)

  // Step 2: period date
  const today = new Date()
  const defaultDate = new Date(today)
  defaultDate.setDate(today.getDate() - 3) // safe default: 3 days ago

  const [lastPeriodDate, setLastPeriodDate] = useState(
    defaultDate.toISOString().split('T')[0]
  )
  const [cycleLength, setCycleLength] = useState(28)
  const [periodLength, setPeriodLength] = useState(5)

  // Step 3: care modes
  const [pmddEnabled, setPmddEnabled] = useState(false)
  const [endoEnabled, setEndoEnabled] = useState(false)

  const stepIndex = STEPS.indexOf(step)

  function advance() {
    setDirection(1)
    const next = STEPS[stepIndex + 1]
    if (next) setStep(next)
  }

  function back() {
    setDirection(-1)
    const prev = STEPS[stepIndex - 1]
    if (prev) setStep(prev)
  }

  function finish() {
    // Save settings collected during onboarding.
    saveCycleSettings({
      lastPeriodStart: lastPeriodDate,
      averageCycleLength: cycleLength,
      averagePeriodLength: periodLength,
      trackingEnabled: true,
    })

    // Save care mode preferences.
    try {
      const profile = JSON.parse(localStorage.getItem('sol-cycle-profile') || '{}')
      profile.pmddEnabled = pmddEnabled
      profile.endometriosisEnabled = endoEnabled
      if (!profile.name) profile.name = ''
      localStorage.setItem('sol-cycle-profile', JSON.stringify(profile))
    } catch {}

    markOnboardingComplete()
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-between px-6 py-10 max-w-md mx-auto">
      {/* Progress dots */}
      {step !== 'welcome' && (
        <div className="w-full flex justify-center gap-2 pt-2">
          {STEPS.filter(s => s !== 'welcome').map((s) => (
            <div
              key={s}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                s === step ? 'w-6 bg-foreground' : 'w-1.5 bg-border'
              )}
            />
          ))}
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 w-full flex flex-col justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              {...SLIDE}
              className="text-center space-y-6"
            >
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#EAD9A0] to-[#D8A7A7] flex items-center justify-center shadow-lg">
                  <Sun className="w-12 h-12 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-semibold text-foreground tracking-tight">
                  Welcome to Sol Cycle
                </h1>
                <p className="text-muted-foreground leading-relaxed">
                  Your cycle, your data. Everything stays on your device — no account, no cloud, no tracking.
                </p>
              </div>

              <div className="grid gap-3 text-left">
                {[
                  { icon: '🌙', text: 'Track your cycle & symptoms' },
                  { icon: '✨', text: 'Understand your patterns over time' },
                  { icon: '🔒', text: 'Completely private — local only' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/60">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'period' && (
            <motion.div key="period" {...SLIDE} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Your last period</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  This anchors your predictions. You can change it any time.
                </p>
              </div>

              {/* Date picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  When did your last period start?
                </label>
                <input
                  type="date"
                  value={lastPeriodDate}
                  max={today.toISOString().split('T')[0]}
                  onChange={(e) => setLastPeriodDate(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-base"
                />
              </div>

              {/* Cycle length */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="font-medium text-foreground">Typical cycle length</label>
                  <span className="text-muted-foreground font-semibold">{cycleLength} days</span>
                </div>
                <input
                  type="range"
                  min="21"
                  max="45"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>21 days</span>
                  <span>45 days</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Not sure? The app will learn your real pattern as you log.
                </p>
              </div>

              {/* Period length */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="font-medium text-foreground">Typical period length</label>
                  <span className="text-muted-foreground font-semibold">{periodLength} days</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={periodLength}
                  onChange={(e) => setPeriodLength(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>2 days</span>
                  <span>10 days</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'care' && (
            <motion.div key="care" {...SLIDE} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Do any of these apply?</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Enables extra tracking fields and pattern awareness. You can change this later.
                </p>
              </div>

              <CareToggle
                icon={<Heart className="w-5 h-5 text-[#D8A7A7]" />}
                title="PMDD awareness"
                description="Track severe mood and emotional symptoms in the days before your period."
                enabled={pmddEnabled}
                onToggle={() => setPmddEnabled(v => !v)}
              />

              <CareToggle
                icon={<Activity className="w-5 h-5 text-[#E6B8A2]" />}
                title="Endometriosis patterns"
                description="Log pain location and track pain outside bleeding — helpful to share with a clinician."
                enabled={endoEnabled}
                onToggle={() => setEndoEnabled(v => !v)}
              />

              <p className="text-xs text-muted-foreground leading-relaxed px-1">
                Sol Cycle surfaces patterns for your awareness. It does not diagnose conditions. Always consult a clinician for medical concerns.
              </p>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div key="done" {...SLIDE} className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#BFD8C2] to-[#EAD9A0] flex items-center justify-center shadow-lg">
                  <Check className="w-12 h-12 text-white" strokeWidth={3} />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">You're all set</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Start by logging today — the more you track, the more personalised your insights become.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-secondary/60 text-left space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your setup</p>
                <div className="text-sm space-y-1">
                  <p className="text-foreground">
                    Last period: <span className="font-medium">{new Date(lastPeriodDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                  </p>
                  <p className="text-foreground">
                    Cycle: <span className="font-medium">{cycleLength} days</span> · Period: <span className="font-medium">{periodLength} days</span>
                  </p>
                  {(pmddEnabled || endoEnabled) && (
                    <p className="text-foreground">
                      Care modes: <span className="font-medium">{[pmddEnabled && 'PMDD', endoEnabled && 'Endo'].filter(Boolean).join(', ')}</span>
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed px-1 text-center">
                Sol Cycle provides personal tracking and pattern insights — not medical advice, diagnoses, or treatment recommendations. Always consult a clinician for health concerns.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="w-full space-y-3 pt-6">
        {step === 'welcome' && (
          <button
            onClick={advance}
            className="w-full py-4 rounded-full bg-foreground text-background font-medium text-base flex items-center justify-center gap-2 active:opacity-80 transition-opacity"
          >
            Begin <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {step === 'period' && (
          <>
            <button
              onClick={advance}
              disabled={!lastPeriodDate}
              className="w-full py-4 rounded-full bg-foreground text-background font-medium text-base disabled:opacity-40 active:opacity-80 transition-opacity"
            >
              Continue
            </button>
            <button
              onClick={back}
              className="w-full py-2 text-sm text-muted-foreground"
            >
              Back
            </button>
          </>
        )}

        {step === 'care' && (
          <>
            <button
              onClick={advance}
              className="w-full py-4 rounded-full bg-foreground text-background font-medium text-base active:opacity-80 transition-opacity"
            >
              Continue
            </button>
            <button
              onClick={back}
              className="w-full py-2 text-sm text-muted-foreground"
            >
              Back
            </button>
          </>
        )}

        {step === 'done' && (
          <button
            onClick={finish}
            className="w-full py-4 rounded-full bg-foreground text-background font-medium text-base active:opacity-80 transition-opacity"
          >
            Start tracking
          </button>
        )}
      </div>
    </div>
  )
}

// ---------- Local sub-component ----------

function CareToggle({
  icon,
  title,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ReactNode
  title: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'w-full text-left p-4 rounded-2xl border-2 transition-all',
        enabled
          ? 'border-foreground bg-foreground/5'
          : 'border-border bg-card hover:border-muted-foreground'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">{title}</span>
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                enabled ? 'border-foreground bg-foreground' : 'border-border'
              )}
            >
              {enabled && <Check className="w-3 h-3 text-background" strokeWidth={3} />}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </button>
  )
}
