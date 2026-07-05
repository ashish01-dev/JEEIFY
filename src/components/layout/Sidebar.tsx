'use client'

import { memo, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSettingsStore } from '@/store/settingsStore'
import { getSupabase } from '@/lib/supabase'
import BetaPopup from '@/components/ai/BetaPopup'
import ChangelogPopup from '@/components/dashboard/ChangelogPopup'

export const SIDEBAR_WIDTH = 260

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', hideKey: null },
  { href: '/ai', label: 'AI Assistant', icon: '🤖', badge: 'BETA' as const, hideKey: null },
  { href: '/syllabus', label: 'Syllabus', icon: '📚', hideKey: 'hideSidebarSyllabus' as const },
  { href: '/timetable', label: 'Timetable', icon: '📅', hideKey: 'hideSidebarTimetable' as const },
  { href: '/progress', label: 'Progress', icon: '📈', hideKey: 'hideSidebarProgress' as const },
  { href: '/completion', label: 'Completion', icon: '✅', hideKey: 'hideSidebarCompletion' as const },
  { href: '/pyq', label: 'PYQs', icon: '📝', hideKey: 'hideSidebarPYQ' as const },
  { href: '/backlog', label: 'Backlog', icon: '📋', hideKey: 'hideSidebarBacklog' as const },
  { href: '/activity', label: 'Journal', icon: '📓', hideKey: 'hideSidebarJournal' as const },
  { href: '/questions', label: 'Questions', icon: '❓', hideKey: 'hideSidebarQuestions' as const },
  { href: '/tests', label: 'Tests', icon: '📝', hideKey: 'hideSidebarTests' as const },
  { href: '/revision', label: 'Revision', icon: '🧠', hideKey: 'hideSidebarRevision' as const },
  { href: '/formula-vault', label: 'Formula Vault', icon: '📄', hideKey: 'hideSidebarFormulaVault' as const },
  { href: '/settings', label: 'Settings', icon: '⚙️', hideKey: 'hideSidebarSettings' as const },
]

const Sidebar = memo(function Sidebar() {
  const pathname = usePathname()
  const { settings } = useSettingsStore()
  const [avatarUrl, setAvatarUrl] = useState('')
  const [showBeta, setShowBeta] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (settings.avatarUrl) { setAvatarUrl(settings.avatarUrl); return }
    const sb = getSupabase()
    if (!sb) return
    sb.auth.getUser().then((res: any) => {
      const u = res.data?.user
      if (u?.user_metadata?.avatar_url) setAvatarUrl(u.user_metadata.avatar_url)
    })
  }, [settings.avatarUrl])

  const isActive = useCallback((href: string) => pathname.startsWith(href), [pathname])

  return (
    <>
    {/* Hamburger button — mobile only */}
    <button
      onClick={() => setMobileOpen(true)}
      className="md:hidden fixed top-3 left-3 z-[100] w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
      style={{ background: 'var(--c-card)', border: '1px solid var(--c-border)', boxShadow: 'var(--c-shadow)' }}
      aria-label="Open navigation"
    >
      <div className="flex flex-col items-center justify-center gap-[3px] w-[18px] h-[18px]">
        <span className="w-full h-0.5 rounded-full" style={{ background: 'var(--c-text)' }} />
        <span className="w-full h-0.5 rounded-full" style={{ background: 'var(--c-text)' }} />
        <span className="w-full h-0.5 rounded-full" style={{ background: 'var(--c-text)' }} />
      </div>
    </button>

    {/* Mobile drawer overlay */}
    {mobileOpen && (
      <div className="fixed inset-0 z-50 md:hidden">
        <div className="fixed inset-0 bg-black/40" style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} onClick={() => setMobileOpen(false)} />
        <div className="fixed top-0 left-0 h-full flex flex-col" style={{ width: SIDEBAR_WIDTH, background: 'var(--c-card)', boxShadow: '4px 0 24px rgba(0,0,0,0.15)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--c-border)' }}>
            <button onClick={() => router.push('/settings')} className="flex items-center gap-2.5 group min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105" style={{
                background: avatarUrl ? 'transparent' : 'var(--c-tag)',
                border: '1px solid var(--c-border)',
              }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <span className="text-sm font-semibold" style={{ color: 'var(--c-muted)' }}>
                    {(settings.name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-left min-w-0">
                <div className="text-[13px] font-medium leading-tight truncate" style={{ color: 'var(--c-text)' }}>{settings.name || 'User'}</div>
                <div className="text-[10px] leading-tight" style={{ color: 'var(--c-muted)' }}>JEE 2027</div>
              </div>
            </button>
            <button onClick={() => setMobileOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.1]" style={{ color: 'var(--c-muted)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.filter(item => {
              const hideKey = (item as any).hideKey
              if (!hideKey) return true
              return !(settings as any)[hideKey]
            }).map(item => {
              const i = item as any
              const active = pathname.startsWith(i.href)
              const hideLabel = settings.hideSidebarLabels
              const close = () => setMobileOpen(false)
              if (i.href === '/ai') {
                return (
                  <button key={i.href} onClick={() => { setShowBeta(true); close() }}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all ${active ? 'font-medium' : ''}`}
                    style={{
                      color: active ? 'var(--c-blue)' : 'var(--c-text-secondary)',
                      background: active ? 'rgba(35,131,226,0.08)' : 'transparent',
                    }}>
                    <span className="text-[18px]">{i.icon}</span>
                    {!hideLabel && <span>{i.label}</span>}
                    <span className="ml-auto flex items-center gap-1.5">
                      {i.badge && !hideLabel && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide" style={{ background: 'rgba(35,131,226,0.15)', color: 'var(--c-blue)' }}>
                          {i.badge}
                        </span>
                      )}
                      {active && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--c-blue)' }} />}
                    </span>
                  </button>
                )
              }
              return (
                <Link key={i.href} href={i.href} onClick={close}
                  title={hideLabel ? i.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active ? 'font-medium' : ''}`}
                  style={{
                    color: active ? 'var(--c-blue)' : 'var(--c-text-secondary)',
                    background: active ? 'rgba(35,131,226,0.08)' : 'transparent',
                  }}>
                  <span className="text-[18px]">{i.icon}</span>
                  {!hideLabel && <span>{i.label}</span>}
                  <span className="ml-auto flex items-center gap-1.5">
                    {i.badge && !hideLabel && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide" style={{ background: 'rgba(35,131,226,0.15)', color: 'var(--c-blue)' }}>
                        {i.badge}
                      </span>
                    )}
                    {active && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--c-blue)' }} />}
                  </span>
                </Link>
              )
            })}
          </div>
          <div className="px-3 pb-3">
            <button onClick={() => { setShowChangelog(true); setMobileOpen(false) }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all"
              style={{ color: 'var(--c-text-secondary)', background: 'transparent' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--c-caption)' }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span>What&apos;s New</span>
            </button>
          </div>
        </div>
        {showBeta && <BetaPopup onClose={() => setShowBeta(false)} onAcknowledge={() => { setShowBeta(false); localStorage.setItem('ai_beta_acknowledged', '1'); router.push('/ai'); setMobileOpen(false) }} />}
        {showChangelog && <ChangelogPopup open={true} onClose={() => { setShowChangelog(false); setMobileOpen(true) }} />}
      </div>
    )}

    {/* Desktop sidebar */}
    <div
      data-tour="tour-sidebar"
      className="fixed top-0 left-0 h-full z-40 hidden md:flex flex-col"
      style={{
        width: SIDEBAR_WIDTH,
        background: 'var(--c-card)',
        borderRight: '1px solid var(--c-border)',
      }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--c-border)' }}>
        <button onClick={() => router.push('/settings')} className="flex items-center gap-2.5 group min-w-0 flex-1">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105" style={{
            background: avatarUrl ? 'transparent' : 'var(--c-tag)',
            border: '1px solid var(--c-border)',
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <span className="text-sm font-semibold" style={{ color: 'var(--c-muted)' }}>
                {(settings.name || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="text-left min-w-0">
            <div className="text-[13px] font-medium leading-tight truncate" style={{ color: 'var(--c-text)' }}>{settings.name || 'User'}</div>
            <div className="text-[10px] leading-tight" style={{ color: 'var(--c-muted)' }}>JEE 2027</div>
          </div>
        </button>
      </div>
      <div className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.filter(item => {
          const hideKey = (item as any).hideKey
          if (!hideKey) return true
          return !(settings as any)[hideKey]
        }).map(item => {
          const i = item as any
          const active = isActive(i.href)
          const hideLabel = settings.hideSidebarLabels
          if (i.href === '/ai') {
            return (
              <button key={i.href} onClick={() => setShowBeta(true)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all ${active ? 'font-medium' : ''}`}
                style={{
                  color: active ? 'var(--c-blue)' : 'var(--c-text-secondary)',
                  background: active ? 'rgba(35,131,226,0.08)' : 'transparent',
                }}>
                <span className="text-[18px]">{i.icon}</span>
                {!hideLabel && <span>{i.label}</span>}
                <span className="ml-auto flex items-center gap-1.5">
                  {i.badge && !hideLabel && (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide" style={{ background: 'rgba(35,131,226,0.15)', color: 'var(--c-blue)' }}>
                      {i.badge}
                    </span>
                  )}
                  {active && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--c-blue)' }} />}
                </span>
              </button>
            )
          }
          return (
            <Link key={i.href} href={i.href}
              title={hideLabel ? i.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active ? 'font-medium' : ''}`}
              style={{
                color: active ? 'var(--c-blue)' : 'var(--c-text-secondary)',
                background: active ? 'rgba(35,131,226,0.08)' : 'transparent',
              }}>
              <span className="text-[18px]">{i.icon}</span>
              {!hideLabel && <span>{i.label}</span>}
              <span className="ml-auto flex items-center gap-1.5">
                {i.badge && !hideLabel && (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide" style={{ background: 'rgba(35,131,226,0.15)', color: 'var(--c-blue)' }}>
                    {i.badge}
                  </span>
                )}
                {active && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--c-blue)' }} />}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Bottom section */}
      <div className="px-3 pb-3">
        <button onClick={() => setShowChangelog(true)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all"
          style={{
            color: 'var(--c-text-secondary)',
            background: 'transparent',
          }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--c-caption)' }}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>What&apos;s New</span>
        </button>
      </div>

      {showBeta && <BetaPopup onClose={() => setShowBeta(false)} onAcknowledge={() => { setShowBeta(false); localStorage.setItem('ai_beta_acknowledged', '1'); router.push('/ai') }} />}
      {showChangelog && <ChangelogPopup open={true} onClose={() => setShowChangelog(false)} />}
    </div>
    </>
  )
})

export default Sidebar