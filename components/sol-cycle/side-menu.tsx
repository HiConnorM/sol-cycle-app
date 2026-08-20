'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Settings,
  Shield,
  Heart,
  Utensils,
  Bell,
  FileText,
  HelpCircle,
  X,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
  Download,
  Trash2,
  Calendar,
  Activity,
  AlertTriangle,
  MessageSquare,
  Bug,
  Sparkles,
  Database,
  Lock,
} from'lucide-react'
import { cn } from '@/lib/utils'
import {
  exportUserData,
  exportMessage,
  type ExportOutcome,
} from '@/lib/export/export-data'
import { supportLink, bugReportLink, featureRequestLink } from '@/lib/support'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useCycle } from '@/lib/hooks/use-cycle'
import { useCalendar } from '@/lib/hooks/use-calendar'
import { useBiometricLock } from '@/lib/hooks/use-biometric-lock'
import { clearAllData, refreshFromStorage } from '@/lib/storage/cycle-storage'
import { applyTheme, watchSystemTheme, type Theme } from '@/lib/theme'
import { useHydrated } from '@/lib/hooks/use-hydration'
import { useNotifications } from '@/lib/hooks/use-notifications'
import { todayKey } from '@/lib/utils/date-keys'

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
}

interface UserProfile {
  name: string
  pmddEnabled: boolean
  endometriosisEnabled: boolean
  goal: 'track' | 'understand' | 'conceive' | 'avoid'
}

// Storage keys
const PROFILE_KEY = 'sol-cycle-profile'
const PREFERENCES_KEY = 'sol-cycle-preferences'

interface Preferences {
  theme: Theme
  weekStartDay: 0 | 1 | 6
  notificationsEnabled: boolean
  dailyCheckIn: boolean
  phaseChangeAlerts: boolean
  pmddAlerts: boolean
  hardDayAlerts: boolean
  mealSuggestions: boolean
  quietMode: boolean
  discreetNotifications: boolean
  foodTrackingStyle: 'light' | 'detailed'
  recommendationsEnabled: boolean
}

const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  weekStartDay: 0,
  // Off until the user turns it on: enabling is what triggers the iOS
  // permission prompt, so defaulting to true showed a switch already in the
  // "on" position for someone who would never receive a single reminder.
  notificationsEnabled: false,
  dailyCheckIn: true,
  phaseChangeAlerts: true,
  pmddAlerts: true,
  hardDayAlerts: true,
  mealSuggestions: true,
  quietMode: false,
  // On by default. The alternative puts "Entering your menstrual phase" on the
  // lock screen for anyone who glances at the phone; someone who wants that
  // detail can choose it, but it should not be chosen for them.
  discreetNotifications: true,
  foodTrackingStyle: 'light',
  recommendationsEnabled: true,
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  pmddEnabled: false,
  endometriosisEnabled: false,
  goal: 'track',
}

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const { settings, cycleDay, currentPhase, logs, updateSettings } = useCycle()
  const { calendarSystem, toggleCalendarSystem } = useCalendar()
  const { isEnabled: biometricEnabled, isSupported: biometricSupported, isAuthenticating: biometricAuthenticating, enable: enableBiometric, disable: disableBiometric } = useBiometricLock()
  const mounted = useHydrated()
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [notificationNotice, setNotificationNotice] = useState<string | null>(null)
  
  // Load from localStorage on mount
  // Reads two keys that aren't part of the cycle store, once, after hydration.
  // The rule wants external state read via useSyncExternalStore; that would
  // mean standing up a store for values only this component uses, and the
  // theme has to be applied as a side effect regardless.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(PROFILE_KEY)
      if (savedProfile) setProfile(JSON.parse(savedProfile))

      const savedPrefs = localStorage.getItem(PREFERENCES_KEY)
      const merged = savedPrefs
        ? { ...DEFAULT_PREFERENCES, ...JSON.parse(savedPrefs) }
        : DEFAULT_PREFERENCES
      setPreferences(merged)
      applyTheme(merged.theme)
    } catch (e) {
      console.error('Failed to load preferences:', e)
    }
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Follow the OS appearance while the preference is 'system'. The ref is
  // written in an effect, not during render — mutating it inline made the
  // render impure and React is entitled to discard that write.
  const themeRef = useRef<Theme>(preferences.theme)
  useEffect(() => {
    themeRef.current = preferences.theme
  }, [preferences.theme])
  useEffect(() => watchSystemTheme(() => themeRef.current), [])
  
  // Save profile changes
  const updateProfile = (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates }
    setProfile(newProfile)
    localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile))
  }
  
  // Reminders are scheduled from the current prediction; the hook re-plans
  // whenever that or these preferences change.
  const notifications = useNotifications(mounted ? preferences : null)

  /**
   * Turning notifications on has to clear the OS permission first — a toggle
   * that flips on while the system prompt is denied would be exactly the kind
   * of control that looks functional and isn't.
   */
  const handleNotificationsToggle = async (enabled: boolean) => {
    if (!enabled) {
      updatePreferences({ notificationsEnabled: false })
      await notifications.cancelAll()
      setNotificationNotice(null)
      return
    }

    if (!notifications.isSupported) {
      setNotificationNotice('Reminders are available in the Sol Cycle app on your phone.')
      return
    }

    const state =
      notifications.permission === 'granted' ? 'granted' : await notifications.request()

    if (state === 'granted') {
      updatePreferences({ notificationsEnabled: true })
      setNotificationNotice(null)
    } else {
      // iOS only ever shows its prompt once, so this is a Settings trip.
      setNotificationNotice(
        'Notifications are turned off for Sol Cycle in your device settings. Turn them on there to get reminders.'
      )
    }
  }

  // Save preference changes
  const updatePreferences = (updates: Partial<Preferences>) => {
    const newPrefs = { ...preferences, ...updates }
    setPreferences(newPrefs)
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPrefs))
    // This key is also read (and cached) by cycle-storage's getUserPreferences,
    // so writing it directly would leave that cache serving stale settings.
    refreshFromStorage()
    
    // Apply theme
    if (updates.theme) {
      applyTheme(updates.theme)
    }
  }
  
  // Export data. The mechanism differs by platform — see lib/export/export-data.ts.
  const [exporting, setExporting] = useState(false)
  const [exportResult, setExportResult] = useState<ExportOutcome | null>(null)

  const exportData = async () => {
    if (exporting) return
    setExporting(true)
    setExportResult(null)
    const outcome = await exportUserData({
      profile,
      preferences,
      cycleSettings: settings,
      logs,
    })
    setExporting(false)
    // A dismissed share sheet needs no message — the user chose to back out.
    setExportResult(outcome.status === 'cancelled' ? null : outcome)
  }
  
  // Delete all data. Uses an in-app dialog rather than window.confirm(), which
  // renders as a jarring Safari-branded sheet in a standalone web view.
  const deleteAllData = () => {
    clearAllData()
    window.location.reload()
  }
  
  if (!mounted) return null

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />
          
          {/* Side Panel - slides in from right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-dvh w-[85%] max-w-sm bg-background z-50 shadow-2xl flex flex-col safe-area-pt safe-area-pb"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            {/* Scrollable Content */}
            {/*
              select-none: the descriptive labels under each switch are <p>
              elements, which globals.css makes selectable so that crisis phone
              numbers and policy text can be copied. In a scrolling settings
              list that backfires — a slow drag starts a text selection instead
              of scrolling, and iOS pops its Copy/Translate callout. Nothing in
              this menu is worth copying, so selection is off here specifically
              rather than narrowing the global rule and risking the paths where
              copying matters.
            */}
            {/*
              min-h-0 is load-bearing: a flex item defaults to min-height:auto,
              so `flex-1` alone let this grow to its content height instead of
              being constrained by the panel. The viewport then had nothing to
              overflow, and everything below the fold — the lock-screen and
              quiet-mode switches, Reports, Help — was clipped and unreachable
              whenever a section was expanded.
            */}
            <ScrollArea className="min-h-0 flex-1 select-none">
              <div className="p-4">
                {/* 1. Profile Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-phase-follicular to-phase-ovulatory flex items-center justify-center">
                      <User className="w-6 h-6 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => updateProfile({ name: e.target.value })}
                        placeholder="Your Name"
                        className="text-base font-medium bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground w-full"
                      />
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {cycleDay ? `Day ${cycleDay}` : 'Not tracking'} 
                        {currentPhase && ` - ${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}`}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  
                  {/* Cycle summary */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-muted/50 text-center">
                      <div className="text-lg font-semibold text-foreground">{settings.averageCycleLength}</div>
                      <div className="text-xs text-muted-foreground">Avg Cycle</div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50 text-center">
                      <div className="text-lg font-semibold text-foreground">{settings.averagePeriodLength}</div>
                      <div className="text-xs text-muted-foreground">Period Days</div>
                    </div>
                  </div>
                  
                  {/* Active modes */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.pmddEnabled && (
                      <span className="px-2 py-1 rounded-full bg-phase-luteal/20 text-xs text-foreground">
                        PMDD Support
                      </span>
                    )}
                    {profile.endometriosisEnabled && (
                      <span className="px-2 py-1 rounded-full bg-phase-menstrual/20 text-xs text-foreground">
                        Endo Support
                      </span>
                    )}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                {/* Accordion Sections */}
                <Accordion type="multiple" className="w-full">
                  {/* 2. Settings */}
                  <AccordionItem value="settings" className="border-none">
                    <AccordionTrigger className="py-3 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <Settings className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-foreground">Settings</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-11 space-y-4">
                      {/* Theme */}
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Appearance</label>
                        <div className="flex gap-2">
                          {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                            <button
                              key={t}
                              onClick={() => updatePreferences({ theme: t })}
                              className={cn(
                                'flex-1 p-2 rounded-lg border transition-colors flex items-center justify-center gap-1.5',
                                preferences.theme === t
                                  ? 'border-primary bg-primary/10 text-foreground'
                                  : 'border-border text-muted-foreground hover:bg-muted'
                              )}
                            >
                              {t === 'light' && <Sun className="w-4 h-4" />}
                              {t === 'dark' && <Moon className="w-4 h-4" />}
                              {t === 'system' && <Smartphone className="w-4 h-4" />}
                              <span className="text-xs capitalize">{t}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Calendar System */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-foreground">Calendar System</div>
                          <div className="text-xs text-muted-foreground">
                            {calendarSystem === 'gregorian' ? '12-month' : '13-month IFC'}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleCalendarSystem}
                          className="text-xs"
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          Switch
                        </Button>
                      </div>
                      
                      {/* Week Start */}
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Week starts on</label>
                        <div className="flex gap-2">
                          {([
                            { value: 0, label: 'Sun' },
                            { value: 1, label: 'Mon' },
                            { value: 6, label: 'Sat' },
                          ] as { value: 0 | 1 | 6; label: string }[]).map((day) => (
                            <button
                              key={day.value}
                              onClick={() => updatePreferences({ weekStartDay: day.value })}
                              className={cn(
                                'flex-1 py-1.5 rounded-lg border text-xs transition-colors',
                                preferences.weekStartDay === day.value
                                  ? 'border-primary bg-primary/10 text-foreground'
                                  : 'border-border text-muted-foreground hover:bg-muted'
                              )}
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Last Period Start */}
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Last period started</label>
                        <input
                          type="date"
                          defaultValue={settings.lastPeriodStart ?? ''}
                          max={todayKey()}
                          onChange={(e) => {
                            if (e.target.value) {
                              updateSettings({ lastPeriodStart: e.target.value })
                            }
                          }}
                          className="w-full px-3 py-2 bg-secondary rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <p className="text-xs text-muted-foreground">
                          Used to anchor predictions. The app also updates this automatically when you log a period.
                        </p>
                      </div>

                      {/* Cycle / Period lengths */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <label className="text-muted-foreground">Typical cycle length</label>
                            <span className="font-medium text-foreground">{settings.averageCycleLength} days</span>
                          </div>
                          <input
                            type="range"
                            min="21"
                            max="45"
                            value={settings.averageCycleLength}
                            onChange={(e) => updateSettings({ averageCycleLength: Number(e.target.value) })}
                            className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <label className="text-muted-foreground">Typical period length</label>
                            <span className="font-medium text-foreground">{settings.averagePeriodLength} days</span>
                          </div>
                          <input
                            type="range"
                            min="2"
                            max="10"
                            value={settings.averagePeriodLength}
                            onChange={(e) => updateSettings({ averagePeriodLength: Number(e.target.value) })}
                            className="w-full h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  {/* 3. Privacy & Data */}
                  <AccordionItem value="privacy" className="border-none">
                    <AccordionTrigger className="py-3 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-foreground">Privacy & Data</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-11 space-y-4">
                      {/* Storage Status */}
                      <div className="p-3 rounded-lg bg-phase-follicular/10 border border-phase-follicular/30">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-phase-follicular" />
                          <span className="text-sm font-medium text-foreground">Local Storage Only</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          All your data stays on this device. Nothing is sent to servers.
                        </p>
                      </div>
                      
                      {/* Biometric Lock */}
                      {biometricSupported && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <span className="text-sm text-foreground">Biometric Lock</span>
                              <p className="text-xs text-muted-foreground">
                                Require Face ID or Touch ID to open
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={biometricEnabled}
                            disabled={biometricAuthenticating}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                enableBiometric()
                              } else {
                                disableBiometric()
                              }
                            }}
                          />
                        </div>
                      )}

                      <Separator />
                      
                      {/* Data Actions */}
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => exportData()}
                          disabled={exporting}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {exporting ? 'Preparing your data…' : 'Export Data (JSON)'}
                        </Button>
                        {exportResult && (
                          <p
                            role="status"
                            className={cn(
                              'text-xs leading-relaxed px-1',
                              exportResult.status === 'failed'
                                ? 'text-destructive'
                                : 'text-muted-foreground'
                            )}
                          >
                            {exportMessage(exportResult)}
                          </p>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start opacity-50 cursor-not-allowed"
                          disabled
                          title="Coming in a future update"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Export Report (PDF)
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setConfirmDeleteOpen(true)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete All Data
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  {/* 4. Care Modes */}
                  <AccordionItem value="care-modes" className="border-none">
                    <AccordionTrigger className="py-3 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <Heart className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-foreground">Care Modes</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-11 space-y-4">
                      {/* PMDD Support */}
                      <div className="p-3 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-phase-luteal" />
                            <span className="text-sm font-medium text-foreground">PMDD Support</span>
                          </div>
                          <Switch
                            checked={profile.pmddEnabled}
                            onCheckedChange={(checked) => updateProfile({ pmddEnabled: checked })}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Enhanced tracking and support for premenstrual dysphoric disorder symptoms.
                        </p>
                      </div>
                      
                      {/* Endometriosis Support */}
                      <div className="p-3 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-phase-menstrual" />
                            <span className="text-sm font-medium text-foreground">Endometriosis Support</span>
                          </div>
                          <Switch
                            checked={profile.endometriosisEnabled}
                            onCheckedChange={(checked) => updateProfile({ endometriosisEnabled: checked })}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Pain tracking, flare logging, and specialized reporting for endo management.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  {/* 5. Nourish Preferences */}
                  <AccordionItem value="nourish" className="border-none">
                    <AccordionTrigger className="py-3 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <Utensils className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-foreground">Nourish Preferences</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-11 space-y-4">
                      {/* Food Recommendations */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">Food Recommendations</span>
                        <Switch
                          checked={preferences.recommendationsEnabled}
                          onCheckedChange={(checked) => updatePreferences({ recommendationsEnabled: checked })}
                        />
                      </div>
                      
                      {/* Tracking Style */}
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Tracking Style</label>
                        <div className="flex gap-2">
                          {(['light', 'detailed'] as const).map((style) => (
                            <button
                              key={style}
                              onClick={() => updatePreferences({ foodTrackingStyle: style })}
                              className={cn(
                                'flex-1 py-2 rounded-lg border text-sm transition-colors',
                                preferences.foodTrackingStyle === style
                                  ? 'border-primary bg-primary/10 text-foreground'
                                  : 'border-border text-muted-foreground hover:bg-muted'
                              )}
                            >
                              {style.charAt(0).toUpperCase() + style.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  {/* 6. Notifications */}
                  <AccordionItem value="notifications" className="border-none">
                    <AccordionTrigger className="py-3 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <Bell className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-foreground">Notifications</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-11 space-y-3">
                      {/* Master Toggle */}
                      <div className="flex items-center justify-between pb-2 border-b border-border">
                        <span className="text-sm font-medium text-foreground">Enable Notifications</span>
                        <Switch
                          checked={preferences.notificationsEnabled}
                          onCheckedChange={handleNotificationsToggle}
                        />
                      </div>

                      {notificationNotice && (
                        <p
                          role="status"
                          className="text-xs text-muted-foreground bg-secondary/60 rounded-xl px-3 py-2 leading-relaxed"
                        >
                          {notificationNotice}
                        </p>
                      )}
                      
                      {/* Individual Toggles */}
                      {[
                        { key: 'dailyCheckIn', label: 'Daily Check-in Reminder' },
                        { key: 'phaseChangeAlerts', label: 'Phase Change Alerts' },
                        { key: 'pmddAlerts', label: 'PMDD Window Alerts' },
                        { key: 'hardDayAlerts', label: '"Hard Day Ahead" Alerts' },
                        { key: 'mealSuggestions', label: 'Meal Suggestions' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <span className="text-sm text-foreground">{item.label}</span>
                          <Switch
                            checked={preferences[item.key as keyof Preferences] as boolean}
                            onCheckedChange={(checked) => 
                              updatePreferences({ [item.key]: checked })
                            }
                            disabled={!preferences.notificationsEnabled}
                          />
                        </div>
                      ))}
                      
                      <Separator />
                      
                      {/* Discreet notifications */}
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="text-sm text-foreground">Hide details on lock screen</span>
                          <p className="text-xs text-muted-foreground">
                            Reminders still arrive, but won&rsquo;t say what they&rsquo;re about
                            until you open the app
                          </p>
                        </div>
                        <Switch
                          checked={preferences.discreetNotifications}
                          onCheckedChange={(checked) =>
                            updatePreferences({ discreetNotifications: checked })
                          }
                          disabled={!preferences.notificationsEnabled}
                          aria-label="Hide notification details on the lock screen"
                        />
                      </div>

                      {/* Quiet Mode */}
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <span className="text-sm text-foreground">Quiet Mode</span>
                          <p className="text-xs text-muted-foreground">Pause all notifications</p>
                        </div>
                        <Switch
                          checked={preferences.quietMode}
                          onCheckedChange={(checked) => updatePreferences({ quietMode: checked })}
                          aria-label="Pause all notifications"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  {/* 7. Reports & Exports */}
                  <AccordionItem value="reports" className="border-none">
                    <AccordionTrigger className="py-3 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-foreground">Reports & Exports</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-11 space-y-3">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Export your full cycle history as JSON from Privacy & Data above.
                        Additional report formats are coming in a future update.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => exportData()}
                        disabled={exporting}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {exporting ? 'Preparing your data…' : 'Export All Data (JSON)'}
                      </Button>
                      {exportResult && (
                        <p
                          role="status"
                          className={cn(
                            'text-xs leading-relaxed px-1',
                            exportResult.status === 'failed'
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                          )}
                        >
                          {exportMessage(exportResult)}
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                  
                  {/* 8. Help & Support */}
                  <AccordionItem value="help" className="border-none">
                    <AccordionTrigger className="py-3 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-foreground">Help & Support</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-11 space-y-2">
                      {/*
                        Every control here opens a real destination. They were
                        previously buttons with no handler, which reads as an
                        unfinished app to App Review and is a dead end for the
                        person tapping them.
                      */}
                      <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                        <a href={supportLink()}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Contact Support
                        </a>
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                        <a href={bugReportLink()}>
                          <Bug className="w-4 h-4 mr-2" />
                          Report a Bug
                        </a>
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                        <a href={featureRequestLink()}>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Feature Request
                        </a>
                      </Button>
                      <Separator className="my-1" />
                      {/*
                        next/link rather than a bare anchor. The static export
                        emits privacy.html, not privacy/index.html, so
                        href="/privacy" resolves to a directory with no index
                        and silently navigates nowhere. Client-side routing
                        sidesteps the document fetch entirely.
                      */}
                      <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                        <Link href="/privacy" onClick={onClose}>
                          <Shield className="w-4 h-4 mr-2" />
                          Privacy Policy
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                        <Link href="/terms" onClick={onClose}>
                          <FileText className="w-4 h-4 mr-2" />
                          Terms of Use
                        </Link>
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </ScrollArea>
            
            {/* Footer */}
            <div className="p-4 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                Sol Cycle v1.0 - Made with care
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete all your data?</AlertDialogTitle>
          <AlertDialogDescription>
            This erases every cycle log, symptom, note, and setting stored on this
            device. Nothing is kept on a server, so this cannot be undone and there
            is no copy to restore from. Export your data first if you want to keep it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep my data</AlertDialogCancel>
          <AlertDialogAction
            onClick={deleteAllData}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete everything
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
