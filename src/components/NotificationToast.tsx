import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Star } from 'lucide-react';
import { Achievement } from '../types/game';
import { cn } from '@/utils/cn';
import { useDismissibleNotification, useReducedMotion } from '@/hooks/useAccessibility';

interface NotificationToastProps {
  achievement: Achievement;
  onDismiss: () => void;
}

const rarityColors = {
  common: 'from-[var(--rarity-common)]/20 to-transparent border-[var(--rarity-common)]/30',
  uncommon: 'from-[var(--rarity-uncommon)]/20 to-transparent border-[var(--rarity-uncommon)]/30',
  rare: 'from-[var(--rarity-rare)]/20 to-transparent border-[var(--rarity-rare)]/30',
  epic: 'from-[var(--rarity-epic)]/20 to-transparent border-[var(--rarity-epic)]/30',
  legendary: 'from-[var(--rarity-legendary)]/20 to-transparent border-[var(--rarity-legendary)]/30',
};

const rarityGlow = {
  common: 'shadow-[var(--rarity-common)]/20',
  uncommon: 'shadow-[var(--rarity-uncommon)]/30',
  rare: 'shadow-[var(--rarity-rare)]/30',
  epic: 'shadow-[var(--rarity-epic)]/40',
  legendary: 'shadow-[var(--rarity-legendary)]/50',
};

export function NotificationToast({ achievement, onDismiss }: NotificationToastProps) {
  const { pauseProps, remainingTime } = useDismissibleNotification(5000, onDismiss);
  const prefersReducedMotion = useReducedMotion();

  // Announce to screen readers
  useEffect(() => {
    const announcement = `Achievement unlocked: ${achievement.name}. ${achievement.description}`;
    const liveRegion = document.getElementById('achievement-announcer');
    if (liveRegion) {
      liveRegion.textContent = announcement;
    }
  }, [achievement]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
        initial={prefersReducedMotion ? { opacity: 0 } : { y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { y: 50, opacity: 0, scale: 0.9 }}
        transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', damping: 20, stiffness: 300 }}
        {...pauseProps}
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-lg border backdrop-blur-xl p-4 min-w-[320px] max-w-md',
            'bg-gradient-to-r',
            rarityColors[achievement.rarity],
            'shadow-lg',
            rarityGlow[achievement.rarity]
          )}
        >
          {/* Animated background shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, delay: 0.2 }}
          />

          <div className="relative flex items-start gap-3">
            {/* Icon */}
            <div
              className={cn(
                'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl',
                'bg-[var(--soil-deep)]/80 border border-[var(--border-subtle)]',
                achievement.rarity === 'legendary' && 'animate-pulse'
              )}
            >
              {achievement.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-3.5 h-3.5 text-[var(--rarity-legendary)]" />
                <span className="text-xs font-medium text-[var(--rarity-legendary)] uppercase tracking-wider">
                  Achievement Unlocked
                </span>
              </div>
              
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                {achievement.name}
              </h4>
              
              <p className="text-xs text-[var(--text-tertiary)] line-clamp-2">
                {achievement.description}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 hover:bg-[var(--soil-medium)] rounded transition-colors"
            >
              <X className="w-4 h-4 text-[var(--text-tertiary)]" />
            </button>
          </div>

          {/* Progress bar for achievements with progress */}
          {achievement.progress !== undefined && achievement.maxProgress && (
            <div className="mt-3 h-1 bg-[var(--soil-deep)] rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  achievement.rarity === 'legendary' ? 'bg-[var(--rarity-legendary)]' :
                  achievement.rarity === 'epic' ? 'bg-[var(--rarity-epic)]' :
                  achievement.rarity === 'rare' ? 'bg-[var(--rarity-rare)]' :
                  'bg-[var(--clay-orange)]'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </div>
          )}

          {/* Progress bar for auto-dismiss */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--soil-deep)]">
            <motion.div
              className="h-full bg-[var(--clay-orange)]"
              initial={{ width: '100%' }}
              animate={{ width: `${(remainingTime / 5000) * 100}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          </div>

          {/* Corner decoration for legendary achievements */}
          {achievement.rarity === 'legendary' && (
            <>
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-[var(--rarity-legendary)]/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-[var(--rarity-legendary)]/10 rounded-full blur-2xl" />
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
  compact?: boolean;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border p-4 transition-all',
        'hover:border-[var(--border-medium)] hover:shadow-lg',
        achievement.unlocked
          ? 'bg-[var(--soil-deep)]/80 border-[var(--border-subtle)]'
          : 'bg-[var(--soil-dark)]/50 border-[var(--border-subtle)]/50 opacity-60',
        achievement.hidden && !achievement.unlocked && 'blur-sm'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl',
            'bg-[var(--soil-medium)] border border-[var(--border-subtle)]',
            achievement.unlocked && 'text-[var(--text-primary)]',
            !achievement.unlocked && 'text-[var(--text-dim)]'
          )}
        >
          {achievement.unlocked ? achievement.icon : '?'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn(
              'text-sm font-medium',
              achievement.unlocked ? 'text-[var(--text-primary)]' : 'text-[var(--text-dim)]'
            )}>
              {achievement.hidden && !achievement.unlocked ? '???' : achievement.name}
            </h4>
            {achievement.unlocked && (
              <Star className="w-3 h-3 text-[var(--rarity-legendary)] fill-[var(--rarity-legendary)]" />
            )}
          </div>
          
          <p className={cn(
            'text-xs',
            achievement.unlocked ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-dim)]'
          )}>
            {achievement.hidden && !achievement.unlocked
              ? '??? Hidden Achievement ???'
              : achievement.description}
          </p>

          {/* Progress */}
          {achievement.progress !== undefined && achievement.maxProgress && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-dim)]">Progress</span>
                <span className="text-[var(--text-secondary)]">
                  {achievement.progress} / {achievement.maxProgress}
                </span>
              </div>
              <div className="h-1.5 bg-[var(--soil-deep)] rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    achievement.rarity === 'legendary' ? 'bg-[var(--rarity-legendary)]' :
                    achievement.rarity === 'epic' ? 'bg-[var(--rarity-epic)]' :
                    achievement.rarity === 'rare' ? 'bg-[var(--rarity-rare)]' :
                    'bg-[var(--clay-orange)]'
                  )}
                  style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
