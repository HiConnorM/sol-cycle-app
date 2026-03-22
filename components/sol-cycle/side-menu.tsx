'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Settings,
  Shield,
  Heart,
  Utensils,
  Bell,
  FileText,
  CreditCard,
  HelpCircle,
  X,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
  Download,
  Trash2,
  Eye,
  Calendar,
  Activity,
  AlertTriangle,
  MessageSquare,
  Bug,
  Sparkles,
  Database,
  Lock,
  Brain,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useCycle } from '@/lib/hooks/use-cycle'
import { useCalendar } from '@/lib/hooks/use-calendar'

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
}

type Theme = 'light' | 'dark' | 'system'

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
  aiPersonalization: boolean
  journalPrivacy: boolean
  dietaryPreferences: string[]
  foodTrackingStyle: 'light' | 'detailed'
  recommendationsEnabled: boolean
}

const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  weekStartDay: 0,
  notificationsEnabled: true,
  dailyCheckIn: true,
  phaseChangeAlerts: true,
  pmddAlerts: true,
  hardDayAlerts: true,
  mealSuggestions: true,
  quietMode: false,
  aiPersonalization: true,
  journalPrivacy: false,
  dietaryPreferences: [],
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
  const { settings, cycleDay, currentPhase, logs } = useCycle()
  const { calendarSystem, toggleCalendarSystem } = useCalendar()
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES)
  
  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true)
    try {
      const savedProfile = localStorage.getItem(PROFILE_KEY)
      if (savedProfile) setProfile(JSON.parse(savedProfile))
      
      const savedPrefs = localStorage.getItem(PREFERENCES_KEY)
      if (savedPrefs) setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(savedPrefs) })
    } catch (e) {
      console.error('Failed to load preferences:', e)
    }
  }, [])
  
  // Save profile changes
  const updateProfile = (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates }
    setProfile(newProfile)
    localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile))
  }
  
  // Save preference changes
  const updatePreferences = (updates: Partial<Preferences>) => {
    const newPrefs = { ...preferences, ...updates }
    setPreferences(newPrefs)
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPrefs))
    
    // Apply theme
    if (updates.theme) {
      applyTheme(updates.theme)
    }
  }
  
  // Apply theme to document
  const applyTheme = (theme: Theme) => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // System preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }
  
  // Export data
  const exportData = (format: 'json' | 'pdf') => {
    const data = {
      profile,
      preferences,
      cycleSettings: settings,
      logs,
      exportDate: new Date().toISOString(),
    }
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sol-cycle-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
    // PDF export would require a library - show placeholder message
  }
  
  // Delete all data
  const deleteAllData = () => {
    if (confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
      localStorage.clear()
      window.location.reload()
    }
  }
  
  if (!mounted) return null
  
  return (
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
            className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-background z-50 shadow-2xl flex flex-col"
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
            <ScrollArea className="flex-1">
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
                      
                      {/* AI Personalization */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">AI Personalization</span>
                        </div>
                        <Switch
                          checked={preferences.aiPersonalization}
                          onCheckedChange={(checked) => updatePreferences({ aiPersonalization: checked })}
                        />
                      </div>
                      
                      {/* Journal Privacy */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <span className="text-sm text-foreground">Journal Privacy</span>
                            <p className="text-xs text-muted-foreground">Exclude notes from AI</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.journalPrivacy}
                          onCheckedChange={(checked) => updatePreferences({ journalPrivacy: checked })}
                        />
                      </div>
                      
                      <Separator />
                      
                      {/* Data Actions */}
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => exportData('json')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export Data (JSON)
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => alert('PDF export coming soon!')}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Export Report (PDF)
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-muted-foreground"
                          onClick={() => alert('Coming soon: See exactly what data we store')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          What We Know About You
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full justify-start"
                          onClick={deleteAllData}
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
                          onCheckedChange={(checked) => updatePreferences({ notificationsEnabled: checked })}
                        />
                      </div>
                      
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
                      
                      {/* Quiet Mode */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-foreground">Quiet Mode</span>
                          <p className="text-xs text-muted-foreground">Pause all notifications</p>
                        </div>
                        <Switch
                          checked={preferences.quietMode}
                          onCheckedChange={(checked) => updatePreferences({ quietMode: checked })}
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
                    <AccordionContent className="pl-11 space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Clinician Report
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        Download Cycle History
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <BookOpen className="w-4 h-4 mr-2" />
                        View Symptom Patterns
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                  
                  {/* 8. Subscription */}
                  <AccordionItem value="subscription" className="border-none">
                    <AccordionTrigger className="py-3 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-foreground">Subscription</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-11 space-y-3">
                      <div className="p-3 rounded-lg bg-gradient-to-r from-phase-ovulatory/20 to-phase-follicular/20 border border-phase-follicular/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-4 h-4 text-phase-ovulatory" />
                          <span className="text-sm font-medium text-foreground">Free Plan</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          You have access to all core features.
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        View Premium Features
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                  
                  {/* 9. Help & Support */}
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
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        FAQ
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Support
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Bug className="w-4 h-4 mr-2" />
                        Report a Bug
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Feature Request
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
  )
}
