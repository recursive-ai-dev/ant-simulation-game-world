import { useState, useRef, useEffect, KeyboardEvent, useImperativeHandle, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Send, ChevronRight } from 'lucide-react';
import { Button } from './ui';
import { audioEngine } from '@/utils/audio';
import { useAnnouncer, useReducedMotion } from '@/hooks/useAccessibility';

export interface CommandInputRef {
  focus: () => void;
}

interface CommandInputProps {
  onSubmit: (command: string) => void;
  commandHistory: string[];
  disabled?: boolean;
  placeholder?: string;
}

export const CommandInput = forwardRef<CommandInputRef, CommandInputProps>(function CommandInput(
  { onSubmit, commandHistory, disabled = false, placeholder = 'Enter command...' },
  ref
) {
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { announce } = useAnnouncer();
  const prefersReducedMotion = useReducedMotion();

  // Expose focus method to parent
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      announce(`Command submitted: ${input}`, 'polite');
      onSubmit(input);
      setInput('');
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1
          ? historyIndex + 1
          : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple auto-complete suggestion
      const suggestions = [
        'help', 'look', 'go', 'examine', 'take', 'inventory',
        'talk', 'listen', 'smell', 'status', 'exits', 'think', 'wait'
      ];
      const match = suggestions.find(s => s.startsWith(input.toLowerCase()));
      if (match) {
        setInput(match);
        announce(`Autocompleted: ${match}`, 'polite');
      }
    }
  };

  // Play typing sound on input change
  useEffect(() => {
    if (input.length > 0) {
      audioEngine.playTypingSound();
    }
  }, [input]);

  return (
    <motion.div
      className="tunnel-border mx-2 sm:mx-3 mt-2 p-3 sm:p-4 flex-shrink-0 rounded"
      style={{ background: 'var(--soil-deep)' }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <div className="flex items-center gap-2">
        <motion.span
          className="text-[var(--clay-orange)] flex-shrink-0 opacity-90"
          animate={prefersReducedMotion ? {} : { opacity: [0.7, 1, 0.7] }}
          transition={prefersReducedMotion ? {} : { duration: 2, repeat: Infinity }}
        >
          <ChevronRight className="w-5 h-5" />
        </motion.span>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 command-input bg-transparent outline-none min-w-0 px-2 py-2 text-base sm:text-lg"
          placeholder={placeholder}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={disabled}
        />

        <Button
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          size="md"
          icon={<Send className="w-4 h-4" />}
          className="tracking-wide font-semibold"
        >
          <span className="hidden sm:inline">EXECUTE</span>
        </Button>
      </div>

      {/* Command history hint */}
      {commandHistory.length > 0 && (
        <motion.div
          className="mt-2 text-sm text-[var(--text-dim)] flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-[var(--text-secondary)] font-semibold">↑↓</span>
          <span>to navigate history</span>
          <span className="text-[var(--root-brown)]">•</span>
          <span className="text-[var(--text-secondary)] font-semibold">Tab</span>
          <span>to autocomplete</span>
        </motion.div>
      )}
    </motion.div>
  );
});
