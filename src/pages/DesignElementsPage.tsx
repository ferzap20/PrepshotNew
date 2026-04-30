import { useState } from 'react';
import {
  Check, Copy, AlertCircle, Info,
  Bell, Star, Shield, Crown, Camera, Plus, Trash2, Pencil,
  Download, Upload, Search, Settings, X, ChevronRight, Clock,
  Users, Film, Clapperboard, Video, Globe, Lock, Mic, Sparkles,
  Flame, Eye, Share2, Mail, FolderOpen, Image, Layers, FileText,
  Volume2, HardDrive, Tv, BarChart3, Headphones, User,
  MoreHorizontal, ArrowRight, ArrowUpRight, Play, Bookmark, Heart,
  TrendingUp, Gauge, RotateCcw, CircleCheck, CircleX,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

/* ──────────────────────────────────────────────
   LAYOUT HELPERS
   ────────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-14">
      <h2 className="text-prepshot-teal mb-6 pb-2 border-b border-border">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 font-mono">
        {title}
      </p>
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────
   1. COLOR PALETTE
   ────────────────────────────────────────────── */
function ColorSwatch({ name, hex, className }: { name: string; hex: string; className: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(hex); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="group text-left w-full"
    >
      <div className={`w-full h-16 rounded-lg mb-2 border border-border transition-transform group-hover:scale-105 ${className}`} />
      <p className="text-sm font-medium truncate">{name}</p>
      <p className="text-xs text-muted-foreground font-mono flex items-center gap-1">
        {copied ? <><Check size={10} className="text-green-500" /> Copied!</> : hex}
      </p>
    </button>
  );
}

function ColorPalette() {
  return (
    <Section title="Color Palette">
      <SubSection title="Brand Colors">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ColorSwatch name="Charcoal" hex="#2C3033" className="bg-prepshot-charcoal" />
          <ColorSwatch name="Teal" hex="#5AA19E" className="bg-prepshot-teal" />
          <ColorSwatch name="Sage" hex="#85B6AA" className="bg-prepshot-sage" />
          <ColorSwatch name="Peach" hex="#FAC29E" className="bg-prepshot-peach" />
        </div>
      </SubSection>
      <SubSection title="Extended Palette">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <ColorSwatch name="Charcoal Light" hex="#3D4347" className="bg-prepshot-charcoal-light" />
          <ColorSwatch name="Teal Dark" hex="#4A8785" className="bg-prepshot-teal-dark" />
          <ColorSwatch name="Teal Light" hex="#D0E5E3" className="bg-prepshot-teal-light" />
          <ColorSwatch name="Sage Light" hex="#D6E8E1" className="bg-prepshot-sage-light" />
          <ColorSwatch name="Peach Light" hex="#FDE8D5" className="bg-prepshot-peach-light" />
        </div>
      </SubSection>
      <SubSection title="Semantic Colors">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ColorSwatch name="Primary" hex="#5AA19E" className="bg-primary" />
          <ColorSwatch name="Secondary" hex="#FAC29E" className="bg-secondary" />
          <ColorSwatch name="Accent" hex="#85B6AA" className="bg-accent" />
          <ColorSwatch name="Destructive" hex="#D4183D" className="bg-destructive" />
        </div>
      </SubSection>
      <SubSection title="Status Colors">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ColorSwatch name="Info BG" hex="#D0E5E3" className="bg-prepshot-info-bg" />
          <ColorSwatch name="Success BG" hex="#D6E8E1" className="bg-prepshot-success-bg" />
          <ColorSwatch name="Warning BG" hex="#FDE8D5" className="bg-prepshot-warning-bg" />
          <ColorSwatch name="Error BG" hex="#FEF2F2" className="bg-prepshot-error-bg" />
        </div>
      </SubSection>
    </Section>
  );
}

/* ──────────────────────────────────────────────
   2. TYPOGRAPHY
   ────────────────────────────────────────────── */
function Typography() {
  return (
    <Section title="Typography">
      <SubSection title="Font Families">
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Sans — Inter</p>
            <p className="text-2xl font-sans">The quick brown fox</p>
            <p className="text-sm font-sans text-muted-foreground">Used for body text, labels, UI elements</p>
          </Card>
          <Card className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Mono — Share Tech Mono</p>
            <p className="text-2xl font-mono">The quick brown fox</p>
            <p className="text-sm font-mono text-muted-foreground">Used for headings, code, labels</p>
          </Card>
        </div>
      </SubSection>
      <SubSection title="Heading Scale">
        <Card className="p-6 space-y-4 divide-y divide-border">
          <div className="pb-4">
            <h1>H1 — Page Title (2xl)</h1>
            <p className="text-xs text-muted-foreground font-mono mt-1">font-mono · text-2xl · weight-500</p>
          </div>
          <div className="py-4">
            <h2>H2 — Section Heading (xl)</h2>
            <p className="text-xs text-muted-foreground font-mono mt-1">font-mono · text-xl · weight-500</p>
          </div>
          <div className="py-4">
            <h3>H3 — Subsection (lg)</h3>
            <p className="text-xs text-muted-foreground font-mono mt-1">font-mono · text-lg · weight-500</p>
          </div>
          <div className="py-4">
            <h4>H4 — Card Title (base)</h4>
            <p className="text-xs text-muted-foreground font-mono mt-1">font-mono · text-base · weight-500</p>
          </div>
          <div className="py-4">
            <p className="text-base">Body — Regular text, readable at small sizes</p>
            <p className="text-xs text-muted-foreground font-mono mt-1">font-sans · text-base · weight-400</p>
          </div>
          <div className="pt-4">
            <p className="text-sm text-muted-foreground">Small muted — Secondary text, metadata, labels</p>
            <p className="text-xs text-muted-foreground font-mono mt-1">font-sans · text-sm · text-muted-foreground</p>
          </div>
        </Card>
      </SubSection>
    </Section>
  );
}

/* ──────────────────────────────────────────────
   3. BUTTONS
   ────────────────────────────────────────────── */
function Buttons() {
  return (
    <Section title="Buttons">
      <SubSection title="Primary">
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="primary">Primary</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </SubSection>
      <SubSection title="Secondary">
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="secondary">Secondary</Button>
          <Button variant="secondary" disabled>Disabled</Button>
        </div>
      </SubSection>
      <SubSection title="Ghost">
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="ghost">Ghost</Button>
          <Button variant="ghost" disabled>Disabled</Button>
        </div>
      </SubSection>
      <SubSection title="Destructive">
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="danger">Danger</Button>
          <Button variant="ghost-danger">Ghost Danger</Button>
          <Button variant="danger" disabled>Disabled</Button>
        </div>
      </SubSection>
      <SubSection title="Sizes">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </SubSection>
      <SubSection title="Icon Buttons">
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="sm"><Plus size={14} />Add Item</Button>
          <Button variant="secondary" size="sm"><Download size={14} />Export</Button>
          <Button variant="ghost" size="sm"><Pencil size={14} />Edit</Button>
          <Button variant="danger" size="sm"><Trash2 size={14} />Delete</Button>
          <Button variant="ghost" size="sm"><Upload size={14} />Upload</Button>
          <Button variant="ghost" size="sm"><Share2 size={14} />Share</Button>
        </div>
      </SubSection>
      <SubSection title="Loading / States">
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="primary" disabled>
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Loading…
          </Button>
          <Button variant="secondary" disabled>
            <div className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
            Saving…
          </Button>
          <Button variant="primary" disabled>Primary Disabled</Button>
          <Button variant="ghost" disabled>Ghost Disabled</Button>
        </div>
      </SubSection>
      <SubSection title="Button Groups">
        <div className="flex">
          <Button variant="ghost" size="sm" className="rounded-r-none border border-border">Left</Button>
          <Button variant="ghost" size="sm" className="rounded-none border-y border-border">Center</Button>
          <Button variant="ghost" size="sm" className="rounded-l-none border border-border">Right</Button>
        </div>
      </SubSection>
      <SubSection title="Full-Width & Block">
        <div className="max-w-sm space-y-2">
          <Button variant="primary" className="w-full">Full Width Primary</Button>
          <Button variant="ghost" className="w-full border border-border">Full Width Outline</Button>
        </div>
      </SubSection>
    </Section>
  );
}

/* ──────────────────────────────────────────────
   4. BADGES & TAGS
   ────────────────────────────────────────────── */
function Badges() {
  return (
    <Section title="Badges & Tags">
      <SubSection title="Solid">
        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-1 bg-primary text-primary-foreground rounded-full text-xs">Teal</span>
          <span className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">Peach</span>
          <span className="px-2.5 py-1 bg-accent text-accent-foreground rounded-full text-xs">Sage</span>
          <span className="px-2.5 py-1 bg-prepshot-charcoal text-white rounded-full text-xs">Charcoal</span>
          <span className="px-2.5 py-1 bg-destructive text-destructive-foreground rounded-full text-xs">Error</span>
          <span className="px-2.5 py-1 bg-prepshot-teal-dark text-white rounded-full text-xs">Teal Dark</span>
          <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded-full text-xs">Neutral</span>
        </div>
      </SubSection>
      <SubSection title="Soft / Outline">
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Draft</Badge>
          <Badge variant="warning">In Review</Badge>
          <Badge variant="success">Published</Badge>
          <Badge variant="outline">Outline</Badge>
          <span className="px-2.5 py-0.5 border border-muted-foreground text-muted-foreground rounded-full text-xs">Muted</span>
          <span className="px-2.5 py-0.5 border border-prepshot-peach text-prepshot-peach rounded-full text-xs">Warm Outline</span>
          <span className="px-2.5 py-0.5 border border-destructive text-destructive rounded-full text-xs">Critical</span>
          <Badge variant="danger">Rejected</Badge>
        </div>
      </SubSection>
      <SubSection title="With Icons">
        <div className="flex flex-wrap gap-2">
          <Badge variant="default"><Video size={10} /> Video</Badge>
          <Badge variant="warning"><Camera size={10} /> Photo</Badge>
          <Badge variant="success"><Clapperboard size={10} /> Scene</Badge>
          <Badge variant="secondary"><Mic size={10} /> Audio</Badge>
          <Badge variant="info"><Globe size={10} /> Public</Badge>
          <span className="px-2.5 py-0.5 bg-muted text-muted-foreground rounded-full text-xs inline-flex items-center gap-1"><Lock size={10} /> Private</span>
          <Badge variant="destructive"><AlertCircle size={10} /> Urgent</Badge>
        </div>
      </SubSection>
      <SubSection title="Status Dots">
        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-1 bg-card border border-border rounded-full text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Online
          </span>
          <span className="px-2.5 py-1 bg-card border border-border rounded-full text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-prepshot-peach" /> Busy
          </span>
          <span className="px-2.5 py-1 bg-card border border-border rounded-full text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted-foreground" /> Offline
          </span>
          <span className="px-2.5 py-1 bg-card border border-border rounded-full text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-destructive" /> Error
          </span>
          <span className="px-2.5 py-1 bg-card border border-border rounded-full text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Live
          </span>
          <span className="px-2.5 py-1 bg-card border border-border rounded-full text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-prepshot-sage" /> Idle
          </span>
        </div>
      </SubSection>
      <SubSection title="Sizes">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="px-1.5 py-0.5 bg-primary text-primary-foreground rounded text-[10px]">XS</span>
          <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded text-xs">Small</span>
          <span className="px-2.5 py-1 bg-primary text-primary-foreground rounded-full text-xs">Default</span>
          <span className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm">Medium</span>
          <span className="px-4 py-2 bg-primary text-primary-foreground rounded-full">Large</span>
        </div>
      </SubSection>
      <SubSection title="Special / Decorative">
        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-1 bg-gradient-to-r from-prepshot-teal to-prepshot-sage text-white rounded-full text-xs flex items-center gap-1"><Sparkles size={12} /> New</span>
          <span className="px-2.5 py-1 bg-gradient-to-r from-prepshot-peach to-secondary text-secondary-foreground rounded-full text-xs flex items-center gap-1"><Flame size={12} /> Trending</span>
          <span className="px-2.5 py-1 bg-gradient-to-r from-prepshot-charcoal to-prepshot-charcoal-light text-white rounded-full text-xs flex items-center gap-1"><Crown size={12} /> Pro</span>
          <span className="px-2.5 py-1 bg-gradient-to-r from-primary to-prepshot-teal-dark text-white rounded-full text-xs flex items-center gap-1"><Shield size={12} /> Verified</span>
          <span className="px-2.5 py-1 border border-dashed border-primary text-primary rounded-full text-xs flex items-center gap-1"><Plus size={12} /> Add Tag</span>
        </div>
      </SubSection>
      <SubSection title="Removable / Interactive">
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Documentary', bg: 'bg-prepshot-teal-light text-prepshot-teal-dark hover:bg-primary hover:text-white' },
            { label: 'Short Film', bg: 'bg-prepshot-peach-light text-prepshot-charcoal hover:bg-secondary' },
            { label: 'Interview', bg: 'bg-prepshot-sage-light text-prepshot-charcoal hover:bg-accent hover:text-white' },
            { label: 'B-Roll', bg: 'bg-muted text-muted-foreground hover:bg-destructive hover:text-white' },
          ].map((tag) => (
            <span key={tag.label} className={`px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 group cursor-pointer transition-colors ${tag.bg}`}>
              {tag.label} <X size={12} className="opacity-60 group-hover:opacity-100" />
            </span>
          ))}
        </div>
      </SubSection>
      <SubSection title="Counts & Notifications">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Bell size={20} className="text-foreground" />
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-destructive text-white text-[10px] rounded-full flex items-center justify-center">3</span>
          </div>
          <div className="relative">
            <Mail size={20} className="text-foreground" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
          </div>
          <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">12 new</span>
          <span className="px-2 py-0.5 bg-destructive text-white rounded-full text-xs">99+</span>
          <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">0</span>
        </div>
      </SubSection>
    </Section>
  );
}

/* ──────────────────────────────────────────────
   5. CARDS
   ────────────────────────────────────────────── */
function Cards() {
  return (
    <Section title="Cards">
      <SubSection title="Basic Cards">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-prepshot-teal-light flex items-center justify-center">
                <Film className="text-prepshot-teal" size={20} />
              </div>
              <div>
                <h4>Project Alpha</h4>
                <p className="text-xs text-muted-foreground">12 scenes</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">A short documentary about urban life and the creative process.</p>
            <div className="flex gap-2">
              <Badge variant="default">Draft</Badge>
              <Badge variant="warning">4K</Badge>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="success">Published</Badge>
              <button className="text-muted-foreground hover:text-foreground"><Bookmark size={16} /></button>
            </div>
            <h4 className="mb-1">Brand Guidelines</h4>
            <p className="text-sm text-muted-foreground mb-4">Color palette, typography, and usage rules for the brand.</p>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-1.5">
                <div className="w-6 h-6 rounded-full bg-prepshot-teal text-white text-[10px] flex items-center justify-center border-2 border-card">JD</div>
                <div className="w-6 h-6 rounded-full bg-prepshot-peach text-prepshot-charcoal text-[10px] flex items-center justify-center border-2 border-card">AM</div>
              </div>
              <span className="text-xs text-muted-foreground">Mar 2, 2026</span>
            </div>
          </div>

          <div className="bg-card rounded-xl border-2 border-dashed border-border p-6 flex flex-col items-center justify-center text-center hover:border-primary/40 transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
              <Plus size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h4 className="text-muted-foreground group-hover:text-foreground transition-colors">Create New Project</h4>
            <p className="text-xs text-muted-foreground mt-1">Start from scratch or use a template</p>
          </div>
        </div>
      </SubSection>

      <SubSection title="Stats Cards">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Views', value: '24,891', change: '+12.5%', up: true, icon: Eye, gradient: 'from-prepshot-teal to-prepshot-sage' },
            { label: 'Renders', value: '1,247', change: '+8.3%', up: true, icon: Play, gradient: 'from-prepshot-peach to-secondary' },
            { label: 'Storage Used', value: '48.2 GB', change: '-2.1%', up: false, icon: HardDrive, gradient: 'from-prepshot-sage to-prepshot-teal-light' },
            { label: 'Team Members', value: '12', change: '+3', up: true, icon: Users, gradient: 'from-prepshot-charcoal to-prepshot-charcoal-light' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                  <stat.icon size={16} className="text-white" />
                </div>
                <span className={`text-xs flex items-center gap-0.5 ${stat.up ? 'text-primary' : 'text-destructive'}`}>
                  <ArrowUpRight size={12} className={stat.up ? '' : 'rotate-90'} />
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-mono">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Dark / Inverted Cards">
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-prepshot-charcoal dark:bg-card dark:border dark:border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-prepshot-sage">Total Views</p>
              <TrendingUp size={16} className="text-prepshot-peach" />
            </div>
            <p className="text-3xl font-mono text-prepshot-peach mb-1">24,891</p>
            <p className="text-xs text-prepshot-sage">+12.5% from last month</p>
          </div>

          <div className="bg-prepshot-charcoal dark:bg-card dark:border dark:border-border rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
              <Gauge size={20} className="text-prepshot-teal" />
            </div>
            <h4 className="text-white dark:text-foreground mb-1">Performance</h4>
            <p className="text-sm text-prepshot-sage dark:text-muted-foreground mb-4">Real-time rendering metrics and export speed analytics.</p>
            <button className="text-sm text-prepshot-teal flex items-center gap-1 hover:gap-2 transition-all">
              View Dashboard <ArrowRight size={14} />
            </button>
          </div>

          <div className="bg-gradient-to-br from-prepshot-charcoal to-prepshot-charcoal-light dark:from-card dark:to-muted rounded-xl p-6 dark:border dark:border-border">
            <div className="flex items-center gap-2 mb-3">
              <Crown size={16} className="text-prepshot-peach" />
              <span className="text-xs text-prepshot-peach font-mono">PRO PLAN</span>
            </div>
            <h4 className="text-white dark:text-foreground mb-1">Upgrade to Pro</h4>
            <p className="text-sm text-prepshot-sage dark:text-muted-foreground mb-4">Unlock unlimited renders, 4K export, and team collaboration.</p>
            <button className="w-full px-4 py-2.5 bg-prepshot-peach text-prepshot-charcoal rounded-lg text-sm hover:bg-prepshot-peach/90 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </SubSection>

      <SubSection title="Horizontal / Compact Cards">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 flex gap-4 hover:shadow-lg transition-shadow">
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-prepshot-peach to-secondary flex-shrink-0 flex items-center justify-center">
              <Camera size={28} className="text-prepshot-charcoal" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4>Scene Setup</h4>
                <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal size={16} /></button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Configure camera angles and lighting for the shot.</p>
              <div className="flex items-center gap-2 mt-2">
                <Clock size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Updated 2h ago</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4 flex gap-4 hover:shadow-lg transition-shadow">
            <div className="w-20 h-20 rounded-lg bg-prepshot-teal-light flex-shrink-0 flex items-center justify-center">
              <Layers size={28} className="text-prepshot-teal" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4>Render Queue</h4>
                <span className="text-xs text-primary">67%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">3 of 8 scenes completed</p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                <div className="h-full bg-primary rounded-full" style={{ width: '67%' }} />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 rounded-full bg-prepshot-sage-light flex-shrink-0 flex items-center justify-center">
              <FileText size={18} className="text-prepshot-sage" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="truncate">final_cut_v3.mp4</h4>
              <p className="text-xs text-muted-foreground">2.4 GB · Exported 1h ago</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button className="w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/30 flex items-center justify-center transition-all"><Download size={14} /></button>
              <button className="w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 flex items-center justify-center transition-all"><Trash2 size={14} /></button>
            </div>
          </div>
        </div>
      </SubSection>

      <SubSection title="Info / Callout Cards">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-prepshot-highlight-bg rounded-xl border border-prepshot-teal/20 p-4 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Info size={18} className="text-white" />
            </div>
            <div>
              <h4 className="text-prepshot-highlight-text">Pro Tip</h4>
              <p className="text-sm text-prepshot-highlight-muted mt-1">Use keyboard shortcuts to speed up your workflow. Press <kbd className="px-1.5 py-0.5 bg-prepshot-kbd-bg rounded text-xs font-mono">Ctrl+S</kbd> to quick-save.</p>
            </div>
          </div>

          <div className="bg-prepshot-warning-bg rounded-xl border border-prepshot-peach/20 p-4 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <AlertCircle size={18} className="text-prepshot-charcoal" />
            </div>
            <div>
              <h4 className="text-prepshot-warning-text">Storage Warning</h4>
              <p className="text-sm text-prepshot-highlight-muted mt-1">You've used 90% of your storage quota. Consider archiving old projects.</p>
            </div>
          </div>

          <div className="bg-prepshot-success-bg rounded-xl border border-prepshot-sage/20 p-4 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <CircleCheck size={18} className="text-white" />
            </div>
            <div>
              <h4 className="text-prepshot-success-text">Export Complete</h4>
              <p className="text-sm text-prepshot-highlight-muted mt-1">Your project "City Lights" has been exported successfully.</p>
            </div>
          </div>

          <div className="bg-prepshot-error-bg rounded-xl border border-prepshot-error-border p-4 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center flex-shrink-0">
              <CircleX size={18} className="text-white" />
            </div>
            <div>
              <h4 className="text-prepshot-error-text">Render Failed</h4>
              <p className="text-sm text-prepshot-highlight-muted mt-1">Scene 4 encountered an error. Check GPU settings and try again.</p>
            </div>
          </div>
        </div>
      </SubSection>
    </Section>
  );
}

/* ──────────────────────────────────────────────
   6. LISTS
   ────────────────────────────────────────────── */
function Lists() {
  return (
    <Section title="Lists">
      <SubSection title="Standard List">
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {[
            { icon: Video, title: 'Interview B-Roll', subtitle: 'Scene 3 · 2:45 min', status: 'Done', statusColor: 'bg-prepshot-teal-light text-prepshot-teal-dark' },
            { icon: Camera, title: 'Exterior Wide Shot', subtitle: 'Scene 1 · 0:30 min', status: 'In Progress', statusColor: 'bg-prepshot-peach-light text-prepshot-charcoal' },
            { icon: Clapperboard, title: 'Opening Credits', subtitle: 'Scene 0 · 0:15 min', status: 'Draft', statusColor: 'bg-muted text-muted-foreground' },
            { icon: Film, title: 'Final Cut Export', subtitle: 'Master · 12:00 min', status: 'Pending', statusColor: 'bg-prepshot-sage-light text-prepshot-charcoal' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-prepshot-teal-light/50 flex items-center justify-center flex-shrink-0">
                <item.icon size={18} className="text-prepshot-teal" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs ${item.statusColor}`}>{item.status}</span>
              <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Navigation / Sidebar List">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {[
              { label: 'All Projects', icon: Film, count: 24, active: true },
              { label: 'Favorites', icon: Star, count: 8, active: false },
              { label: 'Recent', icon: Clock, count: 12, active: false },
              { label: 'Shared with Me', icon: Users, count: 5, active: false },
              { label: 'Archived', icon: Download, count: 31, active: false },
            ].map((item) => (
              <div key={item.label} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${item.active ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-muted/50 border-l-2 border-transparent'}`}>
                <item.icon size={16} className={item.active ? 'text-primary' : 'text-muted-foreground'} />
                <span className={`text-sm flex-1 ${item.active ? 'text-primary' : ''}`}>{item.label}</span>
                <span className={`px-1.5 py-0.5 rounded text-xs ${item.active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{item.count}</span>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl border border-border p-2 flex flex-col gap-1 w-fit">
            {[
              { icon: Film, label: 'Projects', active: true },
              { icon: FolderOpen, label: 'Files', active: false },
              { icon: Image, label: 'Media', active: false },
              { icon: Headphones, label: 'Audio', active: false },
              { icon: BarChart3, label: 'Analytics', active: false },
              { icon: Settings, label: 'Settings', active: false },
            ].map((item) => (
              <button key={item.label} title={item.label} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${item.active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'}`}>
                <item.icon size={18} />
              </button>
            ))}
          </div>
        </div>
      </SubSection>

      <SubSection title="Activity / Timeline List">
        <div className="bg-card rounded-xl border border-border p-4">
          {[
            { icon: Upload, text: 'Project "Sunrise" was exported to 4K', time: '2 min ago', color: 'bg-primary' },
            { icon: Pencil, text: 'Scene 3 was edited by Amanda', time: '15 min ago', color: 'bg-prepshot-peach' },
            { icon: Users, text: 'Kyle joined the project', time: '1 hour ago', color: 'bg-prepshot-sage' },
            { icon: RotateCcw, text: 'Render for Scene 7 was restarted', time: '3 hours ago', color: 'bg-muted-foreground' },
            { icon: Check, text: 'Project "City Lights" marked as complete', time: 'Yesterday', color: 'bg-primary' },
          ].map((item, i, arr) => (
            <div key={i} className="flex gap-3 relative">
              {i < arr.length - 1 && <div className="absolute left-[17px] top-9 bottom-0 w-px bg-border" />}
              <div className={`w-9 h-9 rounded-full ${item.color} flex items-center justify-center flex-shrink-0 z-10`}>
                <item.icon size={14} className="text-white" />
              </div>
              <div className={`flex-1 min-w-0 ${i < arr.length - 1 ? 'pb-5' : ''}`}>
                <p className="text-sm">{item.text}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="File / Asset List">
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {[
            { name: 'interview_take3.mp4', size: '1.2 GB', type: 'Video', icon: Video, iconColor: 'text-prepshot-teal', iconBg: 'bg-prepshot-teal-light' },
            { name: 'background_music.wav', size: '48 MB', type: 'Audio', icon: Volume2, iconColor: 'text-prepshot-peach', iconBg: 'bg-prepshot-peach-light' },
            { name: 'title_card.psd', size: '230 MB', type: 'Image', icon: Image, iconColor: 'text-prepshot-sage', iconBg: 'bg-prepshot-sage-light' },
            { name: 'script_v2.pdf', size: '2.4 MB', type: 'Document', icon: FileText, iconColor: 'text-muted-foreground', iconBg: 'bg-muted' },
            { name: 'color_grade.cube', size: '512 KB', type: 'LUT', icon: Layers, iconColor: 'text-primary', iconBg: 'bg-prepshot-teal-light' },
          ].map((file) => (
            <div key={file.name} className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer group">
              <div className={`w-9 h-9 rounded-lg ${file.iconBg} flex items-center justify-center flex-shrink-0`}>
                <file.icon size={16} className={file.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{file.type} · {file.size}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button className="w-7 h-7 rounded text-muted-foreground hover:text-primary flex items-center justify-center"><Eye size={14} /></button>
                <button className="w-7 h-7 rounded text-muted-foreground hover:text-primary flex items-center justify-center"><Download size={14} /></button>
                <button className="w-7 h-7 rounded text-muted-foreground hover:text-destructive flex items-center justify-center"><Trash2 size={14} /></button>
              </div>
              <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Team / User List">
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {[
            { name: 'John Doe', role: 'Director', initials: 'JD', color: 'bg-prepshot-teal', statusDot: 'bg-green-500' },
            { name: 'Amanda Miller', role: 'Editor', initials: 'AM', color: 'bg-prepshot-peach', statusDot: 'bg-prepshot-peach' },
            { name: 'Kyle Lin', role: 'Sound Designer', initials: 'KL', color: 'bg-prepshot-sage', statusDot: 'bg-muted-foreground' },
            { name: 'Sara Johnson', role: 'Colorist', initials: 'SJ', color: 'bg-primary', statusDot: 'bg-green-500' },
          ].map((user) => (
            <div key={user.name} className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-full ${user.color} flex items-center justify-center text-white text-sm`}>{user.initials}</div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${user.statusDot} border-2 border-card`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
              <button className="w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/30 flex items-center justify-center transition-all">
                <Mail size={14} />
              </button>
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Settings / Preference List">
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {[
            { icon: Bell, label: 'Notifications', desc: 'Push, email, and in-app alerts', value: 'Enabled' },
            { icon: Globe, label: 'Language', desc: 'Interface display language', value: 'English' },
            { icon: Tv, label: 'Default Resolution', desc: 'For new project exports', value: '1080p' },
            { icon: HardDrive, label: 'Auto-save', desc: 'Save projects automatically', value: 'Every 5 min' },
            { icon: Shield, label: 'Two-Factor Auth', desc: 'Extra security for your account', value: 'Enabled' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <item.icon size={16} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block">{item.value}</span>
              <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Checklist / Task List">
        <div className="bg-card rounded-xl border border-border p-4 space-y-2">
          {[
            { text: 'Record voiceover for Scene 2', done: true },
            { text: 'Color grade interview footage', done: true },
            { text: 'Review sound mix with client', done: false },
            { text: 'Add lower thirds and captions', done: false },
            { text: 'Export final cut in 4K and 1080p', done: false },
          ].map((task, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${task.done ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'}`}>
                {task.done && <Check size={12} className="text-white" />}
              </div>
              <span className={`text-sm flex-1 ${task.done ? 'line-through text-muted-foreground' : ''}`}>{task.text}</span>
              {!task.done && <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">Mark done</span>}
            </div>
          ))}
          <div className="pt-2 border-t border-border mt-2">
            <button className="flex items-center gap-2 text-sm text-primary hover:text-prepshot-teal-dark transition-colors">
              <Plus size={14} /> Add task
            </button>
          </div>
        </div>
      </SubSection>
    </Section>
  );
}

/* ──────────────────────────────────────────────
   7. FORM ELEMENTS
   ────────────────────────────────────────────── */
function FormElements() {
  const [checked, setChecked] = useState(true);
  const [toggled, setToggled] = useState(false);

  return (
    <Section title="Form Elements">
      <div className="grid sm:grid-cols-2 gap-8">
        <div className="space-y-4">
          <SubSection title="Text Inputs">
            <div className="space-y-3">
              <Input label="Default Input" placeholder="Enter text…" />
              <Input label="With Value" defaultValue="ARRI ALEXA 35" />
              <Input label="Error State" placeholder="Enter text…" error="This field is required" />
              <Input label="Disabled" placeholder="Disabled input" disabled />
            </div>
          </SubSection>
          <SubSection title="Search Input">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search items…"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </SubSection>
          <SubSection title="Textarea">
            <textarea
              placeholder="Write a description…"
              rows={3}
              className="w-full px-3 py-2.5 text-sm bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
            />
          </SubSection>
        </div>
        <div className="space-y-4">
          <SubSection title="Select & Controls">
            <div className="space-y-4">
              <div>
                <label className="text-sm mb-1.5 block">Resolution</label>
                <select className="w-full px-3 py-2.5 text-sm bg-input-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none">
                  <option>1920 x 1080 (Full HD)</option>
                  <option>3840 x 2160 (4K)</option>
                  <option>1280 x 720 (HD)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-input-background rounded-lg">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-muted-foreground" />
                  <span className="text-sm">Notifications</span>
                </div>
                <button
                  onClick={() => setToggled(!toggled)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${toggled ? 'bg-primary' : 'bg-switch-background'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all ${toggled ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer" onClick={() => setChecked(!checked)}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${checked ? 'bg-primary border-primary' : 'border-border'}`}>
                    {checked && <Check size={14} className="text-white" />}
                  </div>
                  <span className="text-sm font-normal">Auto-save project</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="w-5 h-5 rounded border-2 border-border flex items-center justify-center" />
                  <span className="text-sm font-normal">Enable proxy editing</span>
                </label>
              </div>
            </div>
          </SubSection>
        </div>
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────
   8. ALERTS & TOASTS
   ────────────────────────────────────────────── */
function Alerts() {
  return (
    <Section title="Alerts & Toasts">
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-4 bg-prepshot-info-bg border border-prepshot-teal/20 rounded-lg">
          <Info size={18} className="text-prepshot-teal mt-0.5 flex-shrink-0" />
          <p className="text-sm text-prepshot-info-text flex-1">Your project has been saved successfully.</p>
          <button className="text-prepshot-teal hover:text-prepshot-teal-dark flex-shrink-0"><X size={16} /></button>
        </div>
        <div className="flex items-start gap-3 p-4 bg-prepshot-warning-bg border border-prepshot-peach/30 rounded-lg">
          <AlertCircle size={18} className="text-prepshot-warning-text mt-0.5 flex-shrink-0" />
          <p className="text-sm text-prepshot-warning-text flex-1">Render queue is almost full. Consider clearing completed items.</p>
          <button className="text-prepshot-warning-text/60 hover:text-prepshot-warning-text flex-shrink-0"><X size={16} /></button>
        </div>
        <div className="flex items-start gap-3 p-4 bg-prepshot-error-bg border border-prepshot-error-border rounded-lg">
          <AlertCircle size={18} className="text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-prepshot-error-text flex-1">Export failed. Please check your output settings and try again.</p>
          <button className="text-destructive/60 hover:text-destructive flex-shrink-0"><X size={16} /></button>
        </div>
        <div className="flex items-start gap-3 p-4 bg-prepshot-success-bg border border-prepshot-sage/20 rounded-lg">
          <Check size={18} className="text-prepshot-teal mt-0.5 flex-shrink-0" />
          <p className="text-sm text-prepshot-success-text flex-1">Export complete! Your file is ready to download.</p>
          <button className="text-prepshot-success-text/60 hover:text-prepshot-success-text flex-shrink-0"><X size={16} /></button>
        </div>
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────
   9. AVATARS & ICONS
   ────────────────────────────────────────────── */
function AvatarsIcons() {
  return (
    <Section title="Avatars & Icons">
      <SubSection title="Avatars">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-8 h-8 rounded-full bg-prepshot-teal flex items-center justify-center text-white text-xs">JD</div>
          <div className="w-10 h-10 rounded-full bg-prepshot-peach flex items-center justify-center text-prepshot-charcoal text-sm">AM</div>
          <div className="w-12 h-12 rounded-full bg-prepshot-sage flex items-center justify-center text-white">KL</div>
          <div className="w-12 h-12 rounded-full bg-prepshot-charcoal flex items-center justify-center">
            <User size={20} className="text-prepshot-peach" />
          </div>
          {/* Avatar group */}
          <div className="flex -space-x-2 ml-4">
            <div className="w-8 h-8 rounded-full bg-prepshot-teal flex items-center justify-center text-white text-xs border-2 border-background">JD</div>
            <div className="w-8 h-8 rounded-full bg-prepshot-peach flex items-center justify-center text-prepshot-charcoal text-xs border-2 border-background">AM</div>
            <div className="w-8 h-8 rounded-full bg-prepshot-sage flex items-center justify-center text-white text-xs border-2 border-background">KL</div>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs border-2 border-background">+3</div>
          </div>
        </div>
      </SubSection>
      <SubSection title="Icon Buttons">
        <div className="flex flex-wrap gap-2">
          {[Pencil, Copy, Download, Share2, Heart, Settings, Mail, Eye, Trash2].map((Icon, i) => (
            <button key={i} className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all">
              <Icon size={18} />
            </button>
          ))}
        </div>
      </SubSection>
      <SubSection title="Icon Sizes">
        <div className="flex items-end gap-6">
          {[12, 14, 16, 18, 20, 24, 32].map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <Camera size={size} className="text-prepshot-teal" />
              <span className="text-xs text-muted-foreground font-mono">{size}</span>
            </div>
          ))}
        </div>
      </SubSection>
    </Section>
  );
}

/* ──────────────────────────────────────────────
   10. PROGRESS & INDICATORS
   ────────────────────────────────────────────── */
function ProgressIndicators() {
  return (
    <Section title="Progress & Indicators">
      <div className="grid sm:grid-cols-2 gap-8">
        <SubSection title="Progress Bars">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1"><span className="text-sm">Rendering</span><span className="text-sm text-muted-foreground">75%</span></div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1"><span className="text-sm">Upload</span><span className="text-sm text-muted-foreground">45%</span></div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-prepshot-peach rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1"><span className="text-sm">Storage</span><span className="text-sm text-muted-foreground">90%</span></div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-destructive rounded-full" style={{ width: '90%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1"><span className="text-sm">Encoding</span><span className="text-sm text-muted-foreground">20%</span></div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-prepshot-sage rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>
        </SubSection>
        <SubSection title="Stats">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-3xl font-mono text-primary">42</p>
              <p className="text-xs text-muted-foreground mt-1">Projects</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-3xl font-mono text-prepshot-peach">128</p>
              <p className="text-xs text-muted-foreground mt-1">Gear Items</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-3xl font-mono text-prepshot-sage">8</p>
              <p className="text-xs text-muted-foreground mt-1">Crew Members</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-3xl font-mono text-foreground">24</p>
              <p className="text-xs text-muted-foreground mt-1">Shoot Days</p>
            </div>
          </div>
        </SubSection>
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────── */
export function DesignElementsPage() {
  return (
    <div className="space-y-2 max-w-5xl">
      <div className="mb-8">
        <h1>Design Elements</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Prepshot design system — all UI components, tokens, and patterns used in the app.
        </p>
      </div>

      <ColorPalette />
      <Typography />
      <Buttons />
      <Badges />
      <Cards />
      <Lists />
      <FormElements />
      <Alerts />
      <AvatarsIcons />
      <ProgressIndicators />
    </div>
  );
}
