'use client'

import { useState, useEffect } from 'react'
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

export default function SolCycleApp() {
  const [activeTab, setActiveTab] = useState<NavTab>('today')
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { logDay, getLogForDate } = useCycle()
  const { isEnabled: biometricEnabled, isLocked, isAuthenticating, authError, unlock } = useBiometricLock()

  // Privacy gate → onboarding gate, checked once on mount (client-only)
  useEffect(() => {
    if (!isPrivacyAccepted()) {
      setShowPrivacy(true)
    } else if (!isOnboardingComplete()) {
      setShowOnboarding(true)
    }
  }, [])
  
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
  const existingLog = getLogForDate(selectedDate.toISOString().split('T')[0])
  
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
          onAccept={() => {
            setShowPrivacy(false)
            if (!isOnboardingComplete()) setShowOnboarding(true)
          }}
        />
      )}

      {/* Onboarding — shown after privacy consent on first launch */}
      {!showPrivacy && showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
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
      <LogSheet
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        date={selectedDate}
        existingLog={existingLog}
        onSave={logDay}
      />
    </div>
  )
}
