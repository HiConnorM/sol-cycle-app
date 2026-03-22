'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { TodayScreen } from '@/components/sol-cycle/today-screen'
import { ReportsScreen } from '@/components/sol-cycle/reports-screen'
import { LogSheet } from '@/components/sol-cycle/log-sheet'
import { NourishScreen } from '@/components/sol-cycle/nourish-screen'
import { InsightsScreen } from '@/components/sol-cycle/insights-screen'
import { BottomNav, type NavTab } from '@/components/sol-cycle/bottom-nav'
import { SideMenu } from '@/components/sol-cycle/side-menu'
import { useCycle } from '@/lib/hooks/use-cycle'

export default function SolCycleApp() {
  const [activeTab, setActiveTab] = useState<NavTab>('today')
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { logDay, getLogForDate } = useCycle()
  
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
      {/* Menu Button - Fixed in top left */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="fixed top-4 left-4 z-40 p-2.5 rounded-full bg-card border border-border shadow-sm hover:bg-muted transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>
      
      {/* Side Menu */}
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />
      
      {/* Main content based on active tab */}
      {activeTab === 'today' && <TodayScreen onDateSelect={handleDateSelect} />}
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
