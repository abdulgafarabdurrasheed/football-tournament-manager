import { animate, Variants } from 'framer-motion'

export const pageVariants: Variants = {
    initial: {
        opacity: 0,
        y: 20,
    },

    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.2,
        },
    },
}

export const slideUpVariants: Variants = {
    initial: {
        opacity: 0,
        y: 20, 
        scale: 0.95,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            duration: 0.4,
            bounce: 0.2,
        },
    },
    exit: {
        opacity: 0,
        y: 20,
        scale: 0.95,
        transition: { duration: 0.2 }
    },
}

export const staggerContainerVariants: Variants ={ 
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
}

export const staggerItemVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 },
    },
}

export const hoverScaleVariants: Variants = {
    initial: { scale: 1 },
    hover: {
        scale: 1.02,
        transition: { duration: 0.2 },
    },
    tap: { scale: 0.98 },
}

export const skeletonVariants: Variants = {
    initial: {opacity: 0.5},
    animate: {
        opacity: 1,
        transition: { duration: 0.8, repeat: Infinity, repeatType: 'reverse' },
    },
}