import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Globe } from 'lucide-react'

function XIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="bg-bg-dark text-white">
      <div className="section-container py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="inline-block relative h-12 w-40">
              <Image src="/assets/logo.png" alt="Elite Synergy Logo" fill className="object-contain object-left" />
            </Link>
            <p className="text-gray-400 text-sm">Build your future together.</p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <a href="https://futureacademyegypt.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <Globe size={18} />
                <span>Future Academy</span>
              </a>
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/practical" className="hover:text-white transition-colors">Practical</Link>
              <Link href="/peers" className="hover:text-white transition-colors">Peers</Link>
              <Link href="/community" className="hover:text-white transition-colors">Community</Link>
            </div>
            
            <div className="flex items-center gap-4 mt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-orange hover:text-white transition-all" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-orange hover:text-white transition-all" aria-label="X (formerly Twitter)" title="X (formerly Twitter)">
                <XIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Elite Synergy. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
