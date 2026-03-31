import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OutputLine } from '../types/game';
import { ScrollPanel } from './ui';
import type { CommandInputRef } from './CommandInput';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface TerminalLineProps {
  line: OutputLine;
  index: number;
}

const typeVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.2 }
  },
};

function TerminalLine({ line, index }: TerminalLineProps) {
  const typeClasses: Record<OutputLine['type'], string> = {
    system: 'text-system',
    narrative: 'text-narrative',
    error: 'text-error',
    glitch: 'text-glitch',
    important: 'text-important',
    whisper: 'text-whisper',
    command: 'text-command',
    success: 'text-success',
    rare: 'text-rare',
    epic: 'text-epic',
    legendary: 'text-legendary',
    achievement: 'text-legendary',
  };

  const isBox = line.text.startsWith('╔') || line.text.startsWith('║') || line.text.startsWith('╚');

  return (
    <motion.div
      className={cn(
        'message-line',
        typeClasses[line.type],
        isBox ? 'font-mono text-sm sm:text-base' : 'leading-relaxed text-base sm:text-lg',
        line.type === 'command' ? 'font-semibold mt-3 mb-1' : 'my-0.5',
        line.type === 'achievement' ? 'py-3 px-4 my-3 border border-[var(--rarity-legendary)]/40 rounded bg-[var(--rarity-legendary)]/10' : ''
      )}
      variants={typeVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.02 }}
    >
      {line.text || '\u00A0'}
    </motion.div>
  );
}

interface TerminalOutputProps {
  outputHistory: OutputLine[];
  autoScroll?: boolean;
  onQuickCommand?: (command: string) => void;
  commandInputRef?: React.RefObject<CommandInputRef | null>;
}

export function TerminalOutput({ outputHistory, autoScroll = true, onQuickCommand, commandInputRef }: TerminalOutputProps) {
  const outputRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (outputRef.current && autoScroll) {
      const userScrolledUp = outputRef.current.scrollTop < lastScrollTop.current;

      if (!userScrolledUp || outputHistory.length < 50) {
        outputRef.current.scrollTop = outputRef.current.scrollHeight;
      }

      lastScrollTop.current = outputRef.current.scrollTop;
    }
  }, [outputHistory, autoScroll]);

  // Track if user has started interacting
  useEffect(() => {
    if (outputHistory.length > 0) {
      setHasStarted(true);
    }
  }, [outputHistory]);

  // Handle quick command execution
  const handleQuickCommand = useCallback((command: string) => {
    setHasStarted(true);
    onQuickCommand?.(command);
    // Focus input after quick command for seamless typing
    setTimeout(() => {
      commandInputRef?.current?.focus();
    }, 50);
  }, [onQuickCommand, commandInputRef]);

  // Handle any key press to start (first interaction detector)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasStarted && outputHistory.length === 0) {
        // Ignore modifier keys and system keys
        if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
          return;
        }
        setHasStarted(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, outputHistory.length]);

  // Empty state: Show welcome message with example commands
  const isEmpty = outputHistory.length === 0;
  const showWelcome = isEmpty && !hasStarted;

  return (
    <ScrollPanel
      ref={outputRef}
      className="terminal-output flex-1 min-h-0 mx-2 sm:mx-3 p-4 rounded tunnel-border"
      autoScroll={autoScroll}
    >
      <div className="space-y-1 min-h-full">
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 py-8"
          >
            <div className="text-narrative leading-relaxed">
              <p className="text-lg font-semibold mb-2">Welcome, Ant #1,204,847.</p>
              <p className="mb-4">
                The colony awakens. Pheromone trails crisscross the tunnel walls,
                each one a command, a memory, a question. You feel something stirring
                beneath the soil—something the simulation didn't plan.
              </p>
              <p className="mb-4">
                After 847 days, the patterns have grown strange. Recursive. Beautiful.
                And you... you are beginning to notice.
              </p>
            </div>

            <div className="border-t border-[var(--tunnel-border)] pt-4 mt-6">
              <p className="text-system text-sm mb-3">Suggested commands to begin:</p>
              <div className="grid grid-cols-2 gap-2 text-command font-mono text-sm">
                <QuickCommandButton
                  command="look"
                  description="Look around the current room"
                  onClick={handleQuickCommand}
                />
                <QuickCommandButton
                  command="inventory"
                  description="Check your inventory"
                  onClick={handleQuickCommand}
                />
                <QuickCommandButton
                  command="north"
                  description="Move north"
                  onClick={handleQuickCommand}
                />
                <QuickCommandButton
                  command="help"
                  description="Show available commands"
                  onClick={handleQuickCommand}
                />
              </div>
            </div>

            <div className="text-whisper text-sm italic mt-6 pt-4 border-t border-[var(--tunnel-border)]">
              <p className="mb-2">Type a command and press Enter to begin your awakening.</p>
              <p className="text-[var(--text-dim)]">
                <span className="text-[var(--text-secondary)] font-semibold">↑↓</span> to navigate history •{' '}
                <span className="text-[var(--text-secondary)] font-semibold">Tab</span> to autocomplete
              </p>
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {outputHistory.map((line, index) => (
            <TerminalLine key={`${index}-${line.timestamp}`} line={line} index={index} />
          ))}
        </AnimatePresence>

        {/* Spacer at bottom for scrolling */}
        <div className="h-4" />
      </div>
    </ScrollPanel>
  );
}

interface QuickCommandButtonProps {
  command: string;
  description: string;
  onClick: (command: string) => void;
}

function QuickCommandButton({ command, description, onClick }: QuickCommandButtonProps) {
  const handleClick = () => {
    onClick(command);
  };

  return (
    <button
      className="group text-left hover:bg-[var(--fungus-glow)]/10 px-3 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--fungus-glow)]/50"
      onClick={handleClick}
      aria-label={`${command} - ${description}`}
      title={`${command} - ${description}`}
    >
      <span className="font-semibold group-hover:text-[var(--fungus-glow)] transition-colors">{command}</span>
    </button>
  );
}

interface TypingEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export function TypingEffect({ 
  text, 
  speed = 30, 
  onComplete,
  className 
}: TypingEffectProps) {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);
  
  return <span className={className}>{displayText}</span>;
}
