'use client'

import { useState } from 'react'
import { TodayScreen } from '@/components/sol-cycle/today-screen'
import { ReportsScreen } from '@/components/sol-cycle/reports-screen'
import { LogSheet } from '@/components/sol-cycle/log-sheet'
import { NourishScreen } from '@/components/sol-cycle/nourish-screen'
import { InsightsScreen } from '@/components/sol-cycle/insights-screen'
import { BottomNav, type NavTab } from '@/components/sol-cycle/bottom-nav'
import { SideMenu } from '@/components/sol-cycle/side-menu'
import { Onboarding, isOnboardingComplete } from '@/components/sol-cycle/onboarding'
import { PrivacyConsent, isPrivacyAccepted } from '@/components/sol-cycle/privacy-consent'
import { BiometricLockScreen } from '@/components/sol-cycle/biometric-lock-screen'
import { useCycle } from '@/lib/hooks/use-cycle'
import { useBiometricLock } from '@/lib/hooks/use-biometric-lock'
import { toDateKey } from '@/lib/utils/date-keys'
import { useHydrated } from '@/lib/hooks/use-hydration'

export default function SolCycleApp() {
  const [activeTab, setActiveTab] = useState<NavTab>('today')
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  // Set when the user finishes each gate in this session; the persisted flags
  // are the source of truth on later launches.
  const [privacyDone, setPrivacyDone] = useState(false)
  const [onboardingDone, setOnboardingDone] = useState(false)
  const { logDay, getLogForDate } = useCycle()
  const { isEnabled: biometricEnabled, isLocked, isAuthenticating, authError, unlock } = useBiometricLock()

  // Both gates read localStorage, so they can only be evaluated after
  // hydration — the static shell has no idea whether this user has consented.
  const hydrated = useHydrated()
  const showPrivacy = hydrated && !privacyDone && !isPrivacyAccepted()
  const showOnboarding =
    hydrated && !showPrivacy && !onboardingDone && !isOnboardingComplete()
  
  // Handle tab changes
  const handleTabChange = (tab: NavTab) => {
    if (tab === 'log') {
      setSelectedDate(new Date())
      setIsLogOpen(true)
    } else {
      setActiveTab(tab)
    }
  }
  
  // Handle date selection from wheel/calendar
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setIsLogOpen(true)
  }
  
  // Get existing log for selected date
  const selectedDateKey = toDateKey(selectedDate)
  const existingLog = getLogForDate(selectedDateKey)
  
  return (
    <div className="min-h-screen bg-background">
      {/* Biometric lock overlay — shown when lock is enabled and app is locked */}
      {biometricEnabled && isLocked && (
        <BiometricLockScreen
          isAuthenticating={isAuthenticating}
          authError={authError}
          onUnlock={unlock}
        />
      )}

      {/* Privacy consent — shown before onboarding on first launch */}
      {showPrivacy && (
        <PrivacyConsent
          onAccept={() => setPrivacyDone(true)}
        />
      )}

      {/* Onboarding — shown after privacy consent on first launch */}
      {showOnboarding && (
        <Onboarding onComplete={() => setOnboardingDone(true)} />
      )}

      {/* Side Menu */}
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
      
      {/* Main content based on active tab */}
      {activeTab === 'today' && <TodayScreen onDateSelect={handleDateSelect} onMenuOpen={() => setIsMenuOpen(true)} />}
      {activeTab === 'reports' && <ReportsScreen />}
      {activeTab === 'nourish' && <NourishScreen />}
      {activeTab === 'insights' && <InsightsScreen />}
      
      {/* Bottom navigation */}
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />
      
      {/* Log sheet */}
      {/* Keyed by date: selecting another day remounts the sheet with that
          day's values instead of an effect resetting every field. */}
      <LogSheet
        key={selectedDateKey}
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        date={selectedDate}
        existingLog={existingLog}
        onSave={logDay}
      />
    </div>
  )
}
