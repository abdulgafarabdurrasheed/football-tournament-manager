
import { Play, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDemoStore, useHasSeenTour, useIsDemoMode } from '@/stores/demoStore'
import { useState } from 'react'

export function DemoBanner() {
  const hasSeenTour = useHasSeenTour()
  const isDemoMode = useIsDemoMode()
  const { startDemo } = useDemoStore()
  const [dismissed, setDismissed] = useState(false)

  if (isDemoMode || dismissed) return null

  if (hasSeenTour) {
    return (
      <button
        onClick={startDemo}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-yellow-500 transition-colors group"
      >
        Retake the tour
      </button>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="relative overflow-hidden rounded-xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 via-slate-900 to-slate-900 p-5 md:p-6"
      >
        <div className="absolute top-0 left-0 w-40 h-40 bg-yellow-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">
                New here?
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Don't know ball? Let me show you around.
            </h3>
            <p className="text-sm text-slate-400">
              I'll load a fake Premier League with Arsenal, City, Liverpool &amp; Chelsea
              — and walk you through every feature. Takes 2 minutes. No reading required.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setDismissed(true)}
              className="text-slate-500 hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-800"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={startDemo}
              className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors text-sm group"
            >
              <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Start Demo Tour
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
