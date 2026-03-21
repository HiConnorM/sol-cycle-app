'use client'

import { cn } from '@/lib/utils'
import { 
  Home, 
  Calendar, 
  Plus, 
  Apple, 
  Sparkles 
} from 'lucide-react'

export type NavTab = 'today' | 'calendar' | 'log' | 'nourish' | 'insights'

interface BottomNavProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
}

const tabs: { id: NavTab; label: string; icon: typeof Home }[] = [
  { id: 'today', label: 'Today', icon: Home },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'log', label: 'Log', icon: Plus },
  { id: 'nourish', label: 'Nourish', icon: Apple },
  { id: 'insights', label: 'Insights', icon: Sparkles },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const isLogTab = tab.id === 'log'
          const Icon = tab.icon
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors',
                isActive && !isLogTab && 'text-primary',
                !isActive && !isLogTab && 'text-muted-foreground hover:text-foreground',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {isLogTab ? (
                <div className="flex items-center justify-center w-12 h-12 -mt-6 rounded-full bg-primary text-primary-foreground shadow-lg">
                  <Icon className="w-6 h-6" />
                </div>
              ) : (
                <>
                  <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
