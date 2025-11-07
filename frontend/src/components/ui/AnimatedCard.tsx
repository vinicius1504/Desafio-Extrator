/**
 * Componente wrapper para animações de cards
 */

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
  index?: number
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: custom * 0.1,
      duration: 0.5,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  }),
}

export function AnimatedCard({
  children,
  className = '',
  delay = 0,
  index = 0,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      custom={delay || index}
      variants={cardVariants}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
