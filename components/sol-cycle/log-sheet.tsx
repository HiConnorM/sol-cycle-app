'use client'

import { useState, useEffect } from 'react'
import { X, Droplets, Smile, Activity, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CycleLog, FlowLevel } from '@/lib/types'
import { PHYSICAL_SYMPTOMS, EMOTIONAL_SYMPTOMS, PMDD_SYMPTOMS, MOODS } from '@/lib/types'

interface LogSheetProps {
  isOpen: boolean
  onClose: () => void
  date: Date
  existingLog?: CycleLog | null
  onSave: (log: CycleLog) => void
}

const FLOW_OPTIONS: { value: FlowLevel; label: string; color: string }[] = [
  { value: 'none', label: 'None', color: 'var(--secondary)' },
  { value: 'spotting', label: 'Spotting', color: '#E4BFC3' },
  { value: 'light', label: 'Light', color: '#D8A7A7' },
  { value: 'medium', label: 'Medium', color: '#C08080' },
  { value: 'heavy', label: 'Heavy', color: '#A05050' },
]

export function LogSheet({ isOpen, onClose, date, existingLog, onSave }: LogSheetProps) {
  const [flow, setFlow] = useState<FlowLevel>('none')
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [moods, setMoods] = useState<string[]>([])
  const [painLevel, setPainLevel] = useState(0)
  const [energy, setEnergy] = useState(5)
  const [notes, setNotes] = useState('')
  const [activeTab, setActiveTab] = useState<'flow' | 'symptoms' | 'mood' | 'notes'>('flow')
  
  // Load existing log data
  useEffect(() => {
    if (existingLog) {
      setFlow(existingLog.flow)
      setSymptoms(existingLog.symptoms)
      setMoods(existingLog.moods)
      setPainLevel(existingLog.painLevel)
      setEnergy(existingLog.energy)
      setNotes(existingLog.notes)
    } else {
      setFlow('none')
      setSymptoms([])
      setMoods([])
      setPainLevel(0)
      setEnergy(5)
      setNotes('')
    }
  }, [existingLog, date])
  
  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    )
  }
  
  const toggleMood = (mood: string) => {
    setMoods(prev => 
      prev.includes(mood) 
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    )
  }
  
  const handleSave = () => {
    const log: CycleLog = {
      date: date.toISOString().split('T')[0],
      flow,
      symptoms,
      moods,
      painLevel,
      energy,
      notes,
    }
    onSave(log)
    onClose()
  }
  
  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="relative w-full max-w-md bg-card rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Log Your Day</h2>
            <p className="text-sm text-muted-foreground">{formatDate(date)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-border overflow-x-auto">
          {[
            { id: 'flow', label: 'Flow', icon: Droplets },
            { id: 'symptoms', label: 'Symptoms', icon: Activity },
            { id: 'mood', label: 'Mood', icon: Smile },
            { id: 'notes', label: 'Notes', icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Flow Tab */}
          {activeTab === 'flow' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Flow Level</h3>
                <div className="flex flex-wrap gap-2">
                  {FLOW_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFlow(option.value)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-all',
                        flow === option.value 
                          ? 'ring-2 ring-offset-2 ring-primary' 
                          : 'hover:opacity-80'
                      )}
                      style={{ 
                        backgroundColor: option.color,
                        color: option.value === 'none' ? 'var(--foreground)' : '#2B2B2B',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Pain Level: {painLevel}/10
                </h3>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painLevel}
                  onChange={(e) => setPainLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>No pain</span>
                  <span>Severe</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Energy Level: {energy}/10
                </h3>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={energy}
                  onChange={(e) => setEnergy(parseInt(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Exhausted</span>
                  <span>Energized</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Symptoms Tab */}
          {activeTab === 'symptoms' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Physical</h3>
                <div className="flex flex-wrap gap-2">
                  {PHYSICAL_SYMPTOMS.map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm transition-all',
                        symptoms.includes(symptom)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Emotional</h3>
                <div className="flex flex-wrap gap-2">
                  {EMOTIONAL_SYMPTOMS.map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm transition-all',
                        symptoms.includes(symptom)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">PMDD Specific</h3>
                <div className="flex flex-wrap gap-2">
                  {PMDD_SYMPTOMS.map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm transition-all',
                        symptoms.includes(symptom)
                          ? 'bg-destructive text-destructive-foreground'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Mood Tab */}
          {activeTab === 'mood' && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">How are you feeling?</h3>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => toggleMood(mood)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm transition-all',
                      moods.includes(mood)
                        ? 'bg-accent text-accent-foreground ring-2 ring-accent'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How was your day? Any thoughts or observations..."
                className="w-full h-40 p-3 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-5 py-4 border-t border-border safe-area-pb">
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Save Log
          </button>
        </div>
      </div>
    </div>
  )
}
