import { useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useDemoStore, useIsTourActive, useTourStep } from '@/stores/demoStore'
import { useTournamentStore } from '@/stores/tournamentStore'
import { TOUR_STEPS } from '@/data/tourSteps'

interface TargetRect {
  top: number
  left: number
  width: number
  height: number
}

const TOOLTIP_ESTIMATED_HEIGHT = 300
const VIEWPORT_MARGIN = 16

export function TourOverlay() {
  const isTourActive = useIsTourActive()
  const tourStep = useTourStep()
  const { nextStep, prevStep, skipTour, stopDemo } = useDemoStore()
  const { setViewMode } = useTournamentStore()
  const navigate = useNavigate()
  const location = useLocation()

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const observerRef = useRef<MutationObserver | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const step = TOUR_STEPS[tourStep]
  const isFirstStep = tourStep === 0
  const isLastStep = tourStep === TOUR_STEPS.length - 1
  const totalSteps = TOUR_STEPS.length


  const measureTarget = useCallback(() => {
    if (!step?.target) {
      setTargetRect(null)
      return
    }
    const el = document.querySelector(step.target)
    if (el) {
      const rect = el.getBoundingClientRect()
      const padding = 8
      setTargetRect({
        top: rect.top - padding + window.scrollY,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      })

      const placement = step.placement || 'bottom'
      const vh = window.innerHeight

      if (placement === 'bottom') {
        const neededBottom = rect.bottom + TOOLTIP_ESTIMATED_HEIGHT + VIEWPORT_MARGIN
        if (neededBottom > vh || rect.top < VIEWPORT_MARGIN) {
          const idealY = window.scrollY + rect.top - Math.min(vh * 0.2, 100)
          window.scrollTo({ top: Math.max(0, idealY), behavior: 'smooth' })
        }
      } else if (placement === 'top') {
        const neededTop = rect.top - TOOLTIP_ESTIMATED_HEIGHT - VIEWPORT_MARGIN
        if (neededTop < 0 || rect.bottom > vh - VIEWPORT_MARGIN) {
          const idealY =
            window.scrollY + rect.bottom - vh + Math.min(vh * 0.2, 100)
          window.scrollTo({ top: Math.max(0, idealY), behavior: 'smooth' })
        }
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } else {
      setTargetRect(null)
    }
  }, [step?.target, step?.placement])


  useEffect(() => {
    if (!isTourActive || !step) return

    const needsNavigation = step.route && location.pathname !== step.route
    if (needsNavigation) {
      setIsNavigating(true)
      navigate(step.route!)
      const timer = setTimeout(() => {
        setIsNavigating(false)
      }, 500)
      return () => clearTimeout(timer)
    }

    if (step.tab) {
      setViewMode(step.tab)
    }
  }, [tourStep, isTourActive, step, location.pathname, navigate, setViewMode])


  useEffect(() => {
    if (!isTourActive || isNavigating) return

    if (step?.tab) {
      setViewMode(step.tab)
    }

    const timer = setTimeout(() => {
      measureTarget()
    }, 400)

    return () => clearTimeout(timer)
  }, [tourStep, isTourActive, isNavigating, measureTarget, step?.tab, setViewMode])


  useEffect(() => {
    if (!isTourActive || !step?.target) return

    observerRef.current = new MutationObserver(() => {
      measureTarget()
    })

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    })

    window.addEventListener('resize', measureTarget)
    window.addEventListener('scroll', measureTarget, true)

    return () => {
      observerRef.current?.disconnect()
      window.removeEventListener('resize', measureTarget)
      window.removeEventListener('scroll', measureTarget, true)
    }
  }, [isTourActive, step?.target, measureTarget])


  useEffect(() => {
    if (!isTourActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipTour()
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (isLastStep) {
          stopDemo()
          navigate('/dashboard')
        } else {
          nextStep()
        }
      } else if (e.key === 'ArrowLeft') {
        prevStep()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isTourActive, isLastStep, nextStep, prevStep, skipTour, stopDemo, navigate])

  const handleNext = () => {
    if (isLastStep) {
      stopDemo()
      navigate('/dashboard')
    } else {
      nextStep()
    }
  }

  useLayoutEffect(() => {
    if (!isTourActive || !tooltipRef.current) return

    const ensureVisible = () => {
      const tooltip = tooltipRef.current
      if (!tooltip) return
      const rect = tooltip.getBoundingClientRect()
      const vh = window.innerHeight

      if (rect.bottom > vh - VIEWPORT_MARGIN) {
        window.scrollBy({
          top: rect.bottom - vh + VIEWPORT_MARGIN + 20,
          behavior: 'smooth',
        })
      }
      else if (rect.top < VIEWPORT_MARGIN) {
        window.scrollBy({
          top: rect.top - VIEWPORT_MARGIN - 20,
          behavior: 'smooth',
        })
      }
    }

    const timer = setTimeout(ensureVisible, 450)
    return () => clearTimeout(timer)
  }, [tourStep, isTourActive, targetRect])


  if (!isTourActive || !step) return null


  const getTooltipStyle = (): React.CSSProperties => {


    if (!targetRect || step.placement === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',

        marginTop: `${-TOOLTIP_ESTIMATED_HEIGHT / 2}px`,
        marginLeft: `${-210}px`,
      }
    }

    const viewportTop = targetRect.top - window.scrollY
    const vh = window.innerHeight
    const vw = window.innerWidth
    const maxWidth = 420
    const gap = 16

    let placement = step.placement || 'bottom'
    if (placement === 'bottom') {
      const spaceBelow = vh - (viewportTop + targetRect.height + gap)
      const spaceAbove = viewportTop - gap
      if (spaceBelow < TOOLTIP_ESTIMATED_HEIGHT && spaceAbove > spaceBelow) {
        placement = 'top'
      }
    } else if (placement === 'top') {
      const spaceAbove = viewportTop - gap
      const spaceBelow = vh - (viewportTop + targetRect.height + gap)
      if (spaceAbove < TOOLTIP_ESTIMATED_HEIGHT && spaceBelow > spaceAbove) {
        placement = 'bottom'
      }
    }

    const clampedLeft = Math.max(
      gap,
      Math.min(targetRect.left, vw - maxWidth - gap),
    )

    switch (placement) {
      case 'bottom': {
        let top = viewportTop + targetRect.height + gap
        top = Math.min(top, vh - TOOLTIP_ESTIMATED_HEIGHT - gap)
        top = Math.max(gap, top)
        return {
          position: 'fixed',
          top: `${top}px`,
          left: `${clampedLeft}px`,
          maxWidth: `${maxWidth}px`,
        }
      }
      case 'top': {
        let top = viewportTop - gap - TOOLTIP_ESTIMATED_HEIGHT
        top = Math.max(gap, top)
        return {
          position: 'fixed',
          top: `${top}px`,
          left: `${clampedLeft}px`,
          maxWidth: `${maxWidth}px`,
        }
      }
      case 'right': {
        let top = Math.min(viewportTop, vh - TOOLTIP_ESTIMATED_HEIGHT - gap)
        top = Math.max(gap, top)
        return {
          position: 'fixed',
          top: `${top}px`,
          left: `${targetRect.left + targetRect.width + gap}px`,
          maxWidth: '380px',
        }
      }
      case 'left': {
        let top = Math.min(viewportTop, vh - TOOLTIP_ESTIMATED_HEIGHT - gap)
        top = Math.max(gap, top)
        const leftPos = Math.max(gap, targetRect.left - gap - 380)
        return {
          position: 'fixed',
          top: `${top}px`,
          left: `${leftPos}px`,
          maxWidth: '380px',
        }
      }
      default:
        return {
          position: 'fixed',
          top: '50%',
          left: '50%',
          marginTop: `${-TOOLTIP_ESTIMATED_HEIGHT / 2}px`,
          marginLeft: `${-210}px`,
        }
    }
  }

  return (
    <>
      <motion.div
        key="tour-overlay-mask"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          pointerEvents: 'none',
        }}
      >
        <svg
          width="100%"
          height="100%"
          style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh' }}
        >
          <defs>
            <mask id="tour-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.left}
                  y={targetRect.top - window.scrollY}
                  width={targetRect.width}
                  height={targetRect.height}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#tour-mask)"
          />
        </svg>

        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{
              position: 'absolute',
              top: `${targetRect.top - window.scrollY}px`,
              left: `${targetRect.left}px`,
              width: `${targetRect.width}px`,
              height: `${targetRect.height}px`,
              borderRadius: '12px',
              border: '2px solid rgba(234, 179, 8, 0.6)',
              boxShadow: '0 0 20px rgba(234, 179, 8, 0.2), 0 0 60px rgba(234, 179, 8, 0.1)',
              pointerEvents: 'none',
            }}
          />
        )}
      </motion.div>

      <motion.div
        ref={tooltipRef}
        key={`tour-tooltip-${tourStep}`}
        initial={{ opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.97 }}
        transition={{ duration: 0.25, delay: 0.15 }}
        style={{
          ...getTooltipStyle(),
          zIndex: 10001,
          pointerEvents: 'auto',
        }}
      >
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden max-w-[440px] w-[90vw] sm:w-[420px]">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-yellow-500 uppercase tracking-wider">
                  Tour Guide
                </span>
                <span className="text-xs text-slate-500">
                  {tourStep + 1}/{totalSteps}
                </span>
              </div>
              <button
                onClick={skipTour}
                className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
                title="Skip tour (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 pb-3">
              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{step.content}</p>
            </div>

            <div className="px-5 pb-3">
              <div className="flex gap-1">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full flex-1 transition-colors duration-300 ${
                      i <= tourStep ? 'bg-yellow-500' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between px-5 pb-4 pt-1">
              <button
                onClick={skipTour}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Skip tour
              </button>

              <div className="flex items-center gap-2">
                {!isFirstStep && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-4 py-1.5 text-sm font-bold bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg transition-colors"
                >
                  {isLastStep ? (
                    "Let's go!"
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
    </>
  )
}
