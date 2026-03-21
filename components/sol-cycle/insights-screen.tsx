'use client'

import { useState } from 'react'
import { 
  Sparkles, 
  Heart, 
  BookOpen, 
  Users, 
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Phone
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCycle } from '@/lib/hooks/use-cycle'
import { InsightCard } from './insight-card'

type TabType = 'pmdd' | 'articles' | 'community' | 'resources'

interface Article {
  id: string
  title: string
  excerpt: string
  category: string
  readTime: string
  featured?: boolean
}

const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Understanding PMDD: More Than Just PMS',
    excerpt: 'PMDD affects 3-8% of menstruating people. Learn how it differs from PMS and what treatment options are available.',
    category: 'PMDD',
    readTime: '5 min',
    featured: true,
  },
  {
    id: '2',
    title: 'Cycle Syncing Your Workouts',
    excerpt: 'How to optimize your exercise routine based on your menstrual cycle phase for better results and energy.',
    category: 'Fitness',
    readTime: '4 min',
  },
  {
    id: '3',
    title: 'Foods That Help With Period Pain',
    excerpt: 'Anti-inflammatory foods and nutrients that can naturally reduce cramping and discomfort.',
    category: 'Nutrition',
    readTime: '3 min',
  },
  {
    id: '4',
    title: 'The Luteal Phase: Why You Feel Different',
    excerpt: 'Understanding the hormonal changes in your luteal phase and how to work with them.',
    category: 'Education',
    readTime: '6 min',
  },
  {
    id: '5',
    title: 'Building Your PMDD Support System',
    excerpt: 'Tips for communicating with partners, family, and friends about your PMDD experience.',
    category: 'PMDD',
    readTime: '5 min',
  },
  {
    id: '6',
    title: 'Seed Cycling: Does It Work?',
    excerpt: 'An evidence-based look at seed cycling and its potential effects on hormone balance.',
    category: 'Nutrition',
    readTime: '4 min',
  },
]

const CRISIS_RESOURCES = [
  {
    name: 'National Suicide Prevention Lifeline',
    phone: '988',
    description: 'Free, confidential support 24/7',
  },
  {
    name: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    description: 'Free crisis counseling via text',
  },
  {
    name: 'IAPMD Support Line',
    phone: 'info@iapmd.org',
    description: 'International Association for Premenstrual Disorders',
  },
]

export function InsightsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('pmdd')
  const { inPMDDWindow, currentPhase, cycleDay } = useCycle()
  
  const tabs: { id: TabType; label: string; icon: typeof Sparkles }[] = [
    { id: 'pmdd', label: 'PMDD', icon: Heart },
    { id: 'articles', label: 'Articles', icon: BookOpen },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'resources', label: 'Resources', icon: Sparkles },
  ]
  
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="px-5 py-4 max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Insights</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Support, resources, and community
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
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
      </header>
      
      <main className="px-5 py-6 max-w-md mx-auto">
        {/* PMDD Tab */}
        {activeTab === 'pmdd' && (
          <div className="space-y-6">
            {/* PMDD Status */}
            {inPMDDWindow && (
              <div 
                className="p-4 rounded-2xl border-2"
                style={{ 
                  backgroundColor: 'var(--phase-luteal-light)',
                  borderColor: 'var(--phase-luteal)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5" style={{ color: 'var(--phase-luteal)' }} />
                  <h3 className="font-semibold text-foreground">PMDD Window Active</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  You're in the luteal phase when PMDD symptoms typically occur. 
                  Be extra gentle with yourself.
                </p>
                <p className="text-xs text-muted-foreground">
                  Day {cycleDay} of your cycle
                </p>
              </div>
            )}
            
            {/* What is PMDD */}
            <InsightCard title="What is PMDD?" icon={<Heart className="w-4 h-4" />}>
              <p className="mb-3">
                Premenstrual Dysphoric Disorder (PMDD) is a severe form of PMS that affects 
                3-8% of menstruating people. It causes significant emotional and physical 
                symptoms in the week or two before your period.
              </p>
              <p>
                Unlike PMS, PMDD symptoms are severe enough to interfere with daily life, 
                relationships, and work.
              </p>
            </InsightCard>
            
            {/* Symptoms */}
            <InsightCard title="Common PMDD Symptoms" variant="subtle">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>Severe mood swings, irritability, or anger</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>Depression, hopelessness, or suicidal thoughts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>Anxiety, tension, or feeling on edge</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>Difficulty concentrating or brain fog</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>Physical symptoms like bloating, breast tenderness, fatigue</span>
                </li>
              </ul>
            </InsightCard>
            
            {/* Coping strategies */}
            <InsightCard title="Coping Strategies" icon={<Sparkles className="w-4 h-4" />}>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">1.</span>
                  <span>Track your symptoms to identify patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">2.</span>
                  <span>Plan lighter schedules during your luteal phase</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">3.</span>
                  <span>Prioritize sleep and rest</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">4.</span>
                  <span>Reduce caffeine, alcohol, and sugar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">5.</span>
                  <span>Exercise regularly (even gentle movement helps)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">6.</span>
                  <span>Consider supplements (calcium, B6, magnesium)</span>
                </li>
              </ul>
            </InsightCard>
            
            {/* Crisis resources */}
            <div className="p-4 bg-card rounded-2xl border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-5 h-5 text-destructive" />
                <h3 className="font-semibold text-foreground">Crisis Resources</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                If you're having thoughts of self-harm or suicide, please reach out for help.
              </p>
              <div className="space-y-3">
                {CRISIS_RESOURCES.map((resource, i) => (
                  <div key={i} className="p-3 bg-secondary/50 rounded-xl">
                    <p className="font-medium text-foreground text-sm">{resource.name}</p>
                    <p className="text-primary font-semibold">{resource.phone}</p>
                    <p className="text-xs text-muted-foreground">{resource.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div className="space-y-4">
            {/* Featured article */}
            {ARTICLES.filter(a => a.featured).map((article) => (
              <article
                key={article.id}
                className="p-4 bg-card rounded-2xl border-2 border-primary/20 shadow-sm"
              >
                <span className="text-xs font-medium text-primary">Featured</span>
                <h3 className="font-semibold text-foreground mt-1 mb-2">{article.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {article.category} • {article.readTime}
                  </span>
                  <ChevronRight className="w-4 h-4 text-primary" />
                </div>
              </article>
            ))}
            
            {/* Other articles */}
            {ARTICLES.filter(a => !a.featured).map((article) => (
              <article
                key={article.id}
                className="p-4 bg-card rounded-xl border border-border"
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {article.category}
                </span>
                <h3 className="font-medium text-foreground mt-1 mb-1">{article.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{article.readTime}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </article>
            ))}
          </div>
        )}
        
        {/* Community Tab */}
        {activeTab === 'community' && (
          <div className="space-y-6">
            <InsightCard title="Join the Community" icon={<Users className="w-4 h-4" />}>
              <p className="mb-4">
                Connect with others who understand what you're going through. 
                Share experiences, tips, and support.
              </p>
              <button className="w-full py-2.5 rounded-full bg-primary text-primary-foreground font-medium">
                Coming Soon
              </button>
            </InsightCard>
            
            <div className="p-4 bg-secondary/50 rounded-2xl">
              <h3 className="font-semibold text-foreground mb-3">Community Guidelines</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Be kind and supportive</li>
                <li>• Share your experiences, not medical advice</li>
                <li>• Respect privacy and confidentiality</li>
                <li>• Report harmful content</li>
              </ul>
            </div>
            
            <InsightCard title="Share Your Story" variant="subtle">
              <p>
                Your experience matters. Consider sharing what helps you manage 
                your cycle to help others in the community.
              </p>
            </InsightCard>
          </div>
        )}
        
        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-4">
            <InsightCard title="Helpful Resources" icon={<ExternalLink className="w-4 h-4" />}>
              <p>
                Curated links to trusted information about menstrual health, 
                PMDD, and cycle wellness.
              </p>
            </InsightCard>
            
            <div className="space-y-3">
              {[
                { 
                  name: 'IAPMD', 
                  url: 'iapmd.org',
                  description: 'International Association for Premenstrual Disorders',
                },
                { 
                  name: 'Me v PMDD', 
                  url: 'mevpmdd.com',
                  description: 'PMDD tracking and management app',
                },
                { 
                  name: 'Vicious Cycle', 
                  url: 'viciouscyclepmdd.com',
                  description: 'UK charity for PMDD support',
                },
                { 
                  name: 'ACOG', 
                  url: 'acog.org',
                  description: 'American College of Obstetricians and Gynecologists',
                },
              ].map((resource, i) => (
                <a
                  key={i}
                  href={`https://${resource.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{resource.name}</p>
                    <p className="text-xs text-muted-foreground">{resource.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              ))}
            </div>
            
            <div className="p-4 bg-secondary/50 rounded-2xl mt-6">
              <h3 className="font-semibold text-foreground mb-2">Books We Recommend</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• "In the FLO" by Alisa Vitti</li>
                <li>• "Period Power" by Maisie Hill</li>
                <li>• "The Fifth Vital Sign" by Lisa Hendrickson-Jack</li>
                <li>• "Wild Power" by Alexandra Pope & Sjanie Hugo Wurlitzer</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
