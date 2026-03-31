import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Hook to detect and respond to reduced motion preferences
 * Respects both user settings and system prefers-reduced-motion
 */
export function useReducedMotion(userPreference?: boolean): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // User setting overrides system preference
  return userPreference ?? prefersReducedMotion;
}

/**
 * Hook to manage focus trap within a container element
 * Implements focus cycling and escape-to-close
 */
export function useFocusTrap(
  isActive: boolean,
  onEscape?: () => void,
  containerRef?: React.RefObject<HTMLElement>
): {
  containerRef: React.RefObject<HTMLElement>;
  activateTrap: () => void;
  deactivateTrap: () => void;
} {
  const internalRef = useRef<HTMLElement>(null);
  const ref = containerRef || internalRef;
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const focusableSelector = [
    'button',
    'a[href]',
    'input',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]',
  ].join(', ');

  const getFocusableElements = useCallback((): HTMLElement[] => {
    const container = ref.current;
    if (!container) return [];
    return Array.from(container.querySelectorAll(focusableSelector));
  }, [ref]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    },
    [getFocusableElements, onEscape]
  );

  const activateTrap = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [getFocusableElements]);

  const deactivateTrap = useCallback(() => {
    if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
      previousFocusRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    activateTrap();
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      deactivateTrap();
    };
  }, [isActive, activateTrap, deactivateTrap, handleKeyDown]);

  return { containerRef: ref as React.RefObject<HTMLElement>, activateTrap, deactivateTrap };
}

/**
 * Hook for accessible tooltip management
 * Handles keyboard triggers, focus management, and positioning
 */
export function useAccessibleTooltip(
  _content: string,
  isDisabled?: boolean
): {
  isVisible: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
  tooltipId: string;
  triggerProps: {
    'aria-describedby'?: string;
    onFocus: () => void;
    onBlur: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  tooltipProps: {
    id: string;
    role: 'tooltip';
    'aria-hidden': boolean;
  };
} {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`).current;

  const show = useCallback(() => {
    if (!isDisabled) setIsVisible(true);
  }, [isDisabled]);

  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        hide();
      }
    },
    [isVisible, hide]
  );

  return {
    isVisible,
    triggerRef,
    tooltipId,
    triggerProps: {
      'aria-describedby': isVisible ? tooltipId : undefined,
      onFocus: show,
      onBlur: hide,
      onMouseEnter: show,
      onMouseLeave: hide,
      onKeyDown: handleKeyDown,
    },
    tooltipProps: {
      id: tooltipId,
      role: 'tooltip',
      'aria-hidden': !isVisible,
    },
  };
}

/**
 * Announcer component for screen reader live regions
 */
export function useAnnouncer(): {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  clear: () => void;
  announcement: string;
} {
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback((message: string, _priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement(message);
  }, []);

  const clear = useCallback(() => {
    setAnnouncement('');
  }, []);

  return { announce, clear, announcement };
}

/**
 * Hook for notification toast with pause on hover/focus
 */
export function useDismissibleNotification(
  duration: number = 5000,
  onDismiss?: () => void
): {
  isPaused: boolean;
  remainingTime: number;
  pauseProps: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
  };
} {
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(duration);
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);

  const pause = useCallback(() => {
    setIsPaused(true);
    pausedTimeRef.current = Date.now();
  }, []);

  const resume = useCallback(() => {
    const elapsed = Date.now() - pausedTimeRef.current;
    setIsPaused(false);
    startTimeRef.current += elapsed;
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const checkTimeout = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, duration - elapsed);
      setRemainingTime(remaining);

      if (remaining === 0 && onDismiss) {
        onDismiss();
      }
    }, 100);

    return () => clearInterval(checkTimeout);
  }, [isPaused, duration, onDismiss]);

  return {
    isPaused,
    remainingTime,
    pauseProps: {
      onMouseEnter: pause,
      onMouseLeave: resume,
      onFocus: pause,
      onBlur: resume,
    },
  };
}
