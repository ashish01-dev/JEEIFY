'use client'

import Link from 'next/link'

const FOOTER_LINKS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Sign Up', href: '/auth?mode=signup' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Syllabus', href: '/syllabus' },
      { label: 'Progress', href: '/progress' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
]

export default function Footer() {
  return (
    <footer style={{ background: 'var(--c-footer-bg)' }}>
      <div className="max-w-[1100px] mx-auto px-5 py-16 md:py-20">
        {/* Brand + Columns */}
        <div className="grid md:grid-cols-4 gap-10 mb-14">
          <div className="md:col-span-1">
            <div className="flex items-center gap-[9px] mb-4">
              <img src="https://pub-f170a2592d2c4a1485466404c36807be.r2.dev/Tests/logoipsum-415.svg" alt="logo" loading="lazy" style={{ height: 22, filter: 'brightness(0) invert(1)' }} />
              <span className="text-[18px] font-bold tracking-[-0.3px]" style={{ color: '#fff' }}>JEEIFY</span>
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--c-footer-text)' }}>
              Your personal JEE command center. Built by a student, for students.
            </p>
          </div>
          {FOOTER_LINKS.map(col => (
            <div key={col.title}>
              <h3 className="text-[12px] font-semibold uppercase tracking-wider mb-4" style={{ color: '#fff' }}>{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] transition-colors duration-200 hover:text-white"
                      style={{ color: 'var(--c-footer-muted)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--c-footer-border)' }} className="mb-8" />

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[12px]" style={{ color: 'var(--c-footer-muted)' }}>
            &copy; 2026 JEEIFY. All rights reserved.
          </div>
          <div className="text-[12px]" style={{ color: 'var(--c-footer-muted)' }}>
            Made with <span style={{ color: '#E03E3E' }}>&#9829;</span> by Ashish
          </div>
        </div>
      </div>
    </footer>
  )
}
