'use client'

import { useSettingsStore } from '@/store/settingsStore'

interface Props {
  onClose: () => void
}

const SIDEBAR_TOGGLES: { key: keyof ReturnType<typeof useSettingsStore.getState>['settings']; label: string }[] = [
  { key: 'hideSidebarSyllabus', label: 'Syllabus' },
  { key: 'hideSidebarTimetable', label: 'Timetable' },
  { key: 'hideSidebarProgress', label: 'Progress' },
  { key: 'hideSidebarCompletion', label: 'Completion' },
  { key: 'hideSidebarPYQ', label: 'PYQs' },
  { key: 'hideSidebarBacklog', label: 'Backlog' },
  { key: 'hideSidebarJournal', label: 'Journal' },
  { key: 'hideSidebarQuestions', label: 'Questions' },
  { key: 'hideSidebarTests', label: 'Tests' },
  { key: 'hideSidebarRevision', label: 'Revision' },
  { key: 'hideSidebarFormulaVault', label: 'Formula Vault' },
  { key: 'hideSidebarSettings', label: 'Settings' },
]

const DASHBOARD_TOGGLES: { key: keyof ReturnType<typeof useSettingsStore.getState>['settings']; label: string }[] = [
  { key: 'hideDashboardGamification', label: 'Gamification Bar' },
  { key: 'hideDashboardPlan', label: 'Today\'s Plan' },
  { key: 'hideDashboardContinue', label: 'Continue Studying' },
  { key: 'hideDashboardHeatmap', label: 'Study Heatmap' },
  { key: 'hideDashboardPace', label: 'Study Pace' },
]

const FEATURE_TOGGLES: { key: keyof ReturnType<typeof useSettingsStore.getState>['settings']; label: string; desc: string }[] = [
  { key: 'hideFloatTimer', label: 'Floating Study Timer', desc: 'Pomodoro timer on all pages' },
  { key: 'hideAITutor', label: 'AI Tutor Panel', desc: 'AI assistant floating button' },
]

export default function CustomizePopup({ onClose }: Props) {
  const { settings, update } = useSettingsStore()

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
      <div className="mx-4 rounded-[18px] p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto animate-scale-in" style={{
        background: 'var(--c-card)',
        border: '1px solid var(--c-border-card)',
        boxShadow: 'var(--c-shadow-hover)',
      }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Customize
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/[0.04] dark:hover:bg-white/[0.06]" style={{ color: 'var(--c-muted)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--c-caption)' }}>Features</h3>
            <div className="space-y-2">
              {FEATURE_TOGGLES.map(t => (
                <div key={t.key} className="flex items-center justify-between px-3 py-2 rounded-[12px]" style={{ background: 'var(--c-card-alt)' }}>
                  <div>
                    <div className="text-xs font-medium" style={{ color: 'var(--c-text)' }}>{t.label}</div>
                    <div className="text-[10px]" style={{ color: 'var(--c-caption)' }}>{t.desc}</div>
                  </div>
                  <ToggleSwitch checked={!settings[t.key]} onChange={() => update({ [t.key]: !settings[t.key] })} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--c-caption)' }}>Sidebar Navigation</h3>
            <div className="space-y-1.5">
              {SIDEBAR_TOGGLES.map(t => (
                <div key={t.key} className="flex items-center justify-between px-3 py-1.5 rounded-[10px]" style={{ background: 'var(--c-card-alt)' }}>
                  <span className="text-xs" style={{ color: 'var(--c-text)' }}>{t.label}</span>
                  <ToggleSwitch checked={!settings[t.key]} onChange={() => update({ [t.key]: !settings[t.key] })} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--c-caption)' }}>Dashboard Sections</h3>
            <div className="space-y-1.5">
              {DASHBOARD_TOGGLES.map(t => (
                <div key={t.key} className="flex items-center justify-between px-3 py-1.5 rounded-[10px]" style={{ background: 'var(--c-card-alt)' }}>
                  <span className="text-xs" style={{ color: 'var(--c-text)' }}>{t.label}</span>
                  <ToggleSwitch checked={!settings[t.key]} onChange={() => update({ [t.key]: !settings[t.key] })} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`relative w-9 h-5 rounded-full transition-all ${checked ? 'bg-[var(--c-blue)]' : 'bg-[var(--c-border)]'}`}
      style={{ background: checked ? 'var(--c-blue)' : 'var(--c-border)' }}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? 'left-4.5' : 'left-0.5'}`}
        style={{ left: checked ? '18px' : '2px' }}
      />
    </button>
  )
}
