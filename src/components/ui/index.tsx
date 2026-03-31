import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useReducedMotion, useAccessibleTooltip } from '@/hooks/useAccessibility';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
}

const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
    },
  },
};

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
}: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[90vw] max-h-[90vh]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 modal-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className={cn(
                'w-full modal-content rounded-lg overflow-hidden',
                sizeClasses[size]
              )}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Header */}
              {(title || showClose) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--soil-deep)]">
                  {title && (
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] font-rajdhani tracking-wide">
                      {title}
                    </h2>
                  )}
                  {showClose && (
                    <button
                      onClick={onClose}
                      className="p-1 hover:bg-[var(--soil-medium)] rounded transition-colors"
                    >
                      <X className="w-5 h-5 text-[var(--text-tertiary)]" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {children}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  children,
  disabled,
  onClick,
  type,
  title,
  tabIndex,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHasPopup,
  'aria-describedby': ariaDescribedBy,
}: ButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const variantClasses = {
    primary: 'chitin-button',
    secondary: 'chitin-button opacity-80',
    ghost: 'bg-transparent hover:bg-[var(--soil-medium)] text-[var(--text-secondary)]',
    danger: 'bg-[var(--error)]/20 hover:bg-[var(--error)]/30 text-[var(--error)] border-[var(--error)]/50',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded font-medium transition-all',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      whileHover={prefersReducedMotion || disabled || loading ? undefined : { scale: 1.02 }}
      whileTap={prefersReducedMotion || disabled || loading ? undefined : { scale: 0.98 }}
      onClick={onClick}
      type={type}
      title={title}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled || loading}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {icon}
      {children}
    </motion.button>
  );
}

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  variant?: 'awareness' | 'sentience' | 'default';
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  value,
  max,
  label,
  variant = 'default',
  showValue = true,
  size = 'md',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const fillClasses = {
    awareness: 'progress-fill-awareness',
    sentience: 'progress-fill-sentience',
    default: 'bg-[var(--clay-orange)]',
  };

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-xs text-[var(--text-tertiary)]">{label}</span>}
          {showValue && (
            <span className="text-xs text-[var(--text-secondary)]">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'progress-bar rounded-full overflow-hidden',
          sizeClasses[size]
        )}
      >
        <motion.div
          className={cn('h-full rounded-full transition-all duration-500', fillClasses[variant])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = true, onClick }: CardProps) {
  return (
    <motion.div
      className={cn(
        'info-card rounded-lg p-4',
        className
      )}
      whileHover={hover ? { y: -2 } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  disabled?: boolean;
}

export function Tooltip({ content, children, side = 'top', disabled }: TooltipProps) {
  const { isVisible, triggerRef, triggerProps, tooltipProps } = useAccessibleTooltip(content, disabled);
  const prefersReducedMotion = useReducedMotion();

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef as React.RefObject<HTMLDivElement>}
        {...triggerProps}
        className="inline-block"
      >
        {children}
      </div>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={cn(
              'absolute z-50 px-2 py-1 text-xs text-[var(--text-primary)] bg-[var(--soil-deep)] border border-[var(--border-medium)] rounded pointer-events-none whitespace-nowrap',
              positionClasses[side]
            )}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: side === 'top' ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: side === 'top' ? 4 : -4 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
            {...tooltipProps}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'rare' | 'epic' | 'legendary';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const variantClasses = {
    default: 'bg-[var(--soil-medium)] text-[var(--text-secondary)]',
    success: 'bg-[var(--success)]/20 text-[var(--success)]',
    warning: 'bg-[var(--warning)]/20 text-[var(--warning)]',
    error: 'bg-[var(--error)]/20 text-[var(--error)]',
    rare: 'bg-[var(--rarity-rare)]/20 text-[var(--rarity-rare)]',
    epic: 'bg-[var(--rarity-epic)]/20 text-[var(--rarity-epic)]',
    legendary: 'bg-[var(--rarity-legendary)]/20 text-[var(--rarity-legendary)]',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded font-medium',
        variantClasses[variant],
        sizeClasses[size]
      )}
    >
      {children}
    </span>
  );
}

interface ScrollPanelProps {
  children: React.ReactNode;
  className?: string;
  autoScroll?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}

export function ScrollPanel({ children, className, autoScroll = false, ref }: ScrollPanelProps) {
  return (
    <div
      ref={ref}
      data-auto-scroll={autoScroll}
      className={cn(
        'scrollable-panel overflow-y-auto',
        className
      )}
    >
      {children}
    </div>
  );
}

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Divider({ orientation = 'horizontal', className }: DividerProps) {
  return (
    <div
      className={cn(
        'bg-[var(--border-subtle)]',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        className
      )}
    />
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <motion.div
      className={cn(
        'border-2 border-[var(--clay-orange)]/30 border-t-[var(--clay-orange)] rounded-full',
        sizeClasses[size],
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
}

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  valueLabel?: string;
}

export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  showValue = false,
  valueLabel,
}: SliderProps) {
  const sliderId = `slider-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const valueTextId = `${sliderId}-value`;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label id={`${sliderId}-label`} className="text-sm text-[var(--text-secondary)] font-medium">
          {label}
        </label>
        {showValue && (
          <span id={valueTextId} className="text-sm text-[var(--text-primary)] font-semibold" aria-live="polite">
            {valueLabel || Math.round(value * 100)}%
          </span>
        )}
      </div>
      <input
        type="range"
        id={sliderId}
        aria-labelledby={`${sliderId}-label`}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={valueLabel || `${Math.round(value * 100)}%`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-[var(--soil-deep)] rounded-lg appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--clay-orange)]
          [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110
          [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-[var(--clay-orange)] [&::-moz-range-thumb]:border-0"
      />
    </div>
  );
}

interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function Switch({ label, checked, onChange, description }: SwitchProps) {
  const switchId = `switch-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <label id={`${switchId}-label`} htmlFor={switchId} className="text-base text-[var(--text-primary)] font-medium cursor-pointer">
          {label}
        </label>
        {description && (
          <div id={`${switchId}-desc`} className="text-sm text-[var(--text-secondary)]">{description}</div>
        )}
      </div>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${switchId}-label`}
        aria-describedby={description ? `${switchId}-desc` : undefined}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-12 h-7 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--clay-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--soil-dark)]',
          checked ? 'bg-[var(--clay-orange)]' : 'bg-[var(--soil-medium)]'
        )}
      >
        <motion.div
          className={cn(
            'absolute top-1 w-5 h-5 rounded-full bg-[var(--text-primary)]',
            checked ? 'right-1' : 'left-1'
          )}
          layout={!prefersReducedMotion}
          transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}
