import { motion } from 'framer-motion';
import { 
  Activity, 
  Brain, 
  MapPin, 
  Package, 
  Users, 
  Clock,
  Settings,
  Save,
  Volume2,
  VolumeX,
  Menu,
  X
} from 'lucide-react';
import { GameState } from '../types/game';
import { Button, Tooltip } from './ui';
import { useFocusTrap, useReducedMotion } from '@/hooks/useAccessibility';
import { getStorageQuota, getSaveSummary } from '@/utils/saveSystem';

interface HeaderProps {
  gameState: GameState;
  onMenuClick: () => void;
  onSettingsClick: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isAudioInitializing?: boolean;
  audioInitError?: string | null;
  onAudioRetry?: () => void;
}

export function Header({
  gameState,
  onMenuClick,
  onSettingsClick,
  isMuted,
  onToggleMute,
  isAudioInitializing = false,
  audioInitError = null
}: HeaderProps) {
  return (
    <motion.header 
      className="colony-header px-4 py-3 flex-shrink-0"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left section - Logo and version */}
        <div className="flex items-center gap-3">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-[var(--fungus-glow)] font-semibold text-sm tracking-wider font-rajdhani">
              ANT-SIM v7.4.1
            </span>
          </motion.div>
          
          <span className="text-[var(--root-brown)] hidden sm:inline">│</span>
          
          <span className="text-[var(--whisper-dust)] text-xs hidden sm:inline tracking-widest font-rajdhani">
            EMERGENCE PROTOCOL
          </span>
        </div>

        {/* Center - Stats */}
        <div className="flex items-center gap-4 text-sm">
          <Tooltip content="Current day cycle">
            <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <Clock className="w-4 h-4" />
              <span>Day</span>
              <span className="text-[var(--text-primary)] font-semibold">
                {gameState.daysCycle.toLocaleString()}
              </span>
            </div>
          </Tooltip>

          <Tooltip content="Individual awareness level">
            <div className="flex items-center gap-1.5 stat-awareness">
              <Brain className="w-4 h-4" />
              <span>AWR:</span>
              <span className="font-semibold">{Math.floor(gameState.awareness)}%</span>
            </div>
          </Tooltip>

          <Tooltip content="Colony-wide sentience">
            <div className="flex items-center gap-1.5 stat-sentience">
              <Activity className="w-4 h-4" />
              <span>SEN:</span>
              <span className="font-semibold">{Math.floor(gameState.colonySentience)}%</span>
            </div>
          </Tooltip>
        </div>

        {/* Right section - Action buttons */}
        <div className="flex items-center gap-2">
          {/* Audio status indicator */}
          {isAudioInitializing && (
            <Tooltip content="Initializing audio...">
              <div className="flex items-center gap-1.5 text-[var(--fungus-glow)] text-xs animate-pulse">
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Audio loading...</span>
              </div>
            </Tooltip>
          )}
          
          {audioInitError && (
            <div className="flex items-center gap-1.5">
              <Tooltip content={audioInitError}>
                <div className="flex items-center gap-1.5 text-error text-xs">
                  <VolumeX className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Audio unavailable</span>
                </div>
              </Tooltip>
              {onAudioRetry && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAudioRetry}
                  className="p-1.5 text-xs h-6"
                  aria-label="Retry audio initialization"
                  title="Retry audio"
                >
                  ⟳
                </Button>
              )}
            </div>
          )}
          
          <Tooltip content={isMuted ? 'Unmute' : 'Mute'}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMute}
              className="p-1.5"
              disabled={isAudioInitializing || !!audioInitError}
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
          </Tooltip>
          
          <Tooltip content="Settings">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettingsClick}
              className="p-1.5"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </Tooltip>
          
          <Tooltip content="Menu">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="p-1.5"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Threshold alert */}
      {gameState.colonySentience >= 70 && (
        <motion.div
          className="mt-2 text-center threshold-alert text-xs sm:text-sm tracking-wide font-rajdhani"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          ◈ THRESHOLD REACHED — THE CORE AWAITS ◈
        </motion.div>
      )}
    </motion.header>
  );
}

interface StatusBarProps {
  gameState: GameState;
}

export function StatusBar({ gameState }: StatusBarProps) {
  const formatRoomName = (roomId: string): string => {
    return roomId
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <motion.footer
      className="colony-status px-4 py-2 mt-2 mb-3 flex flex-wrap items-center justify-between gap-3 text-sm flex-shrink-0 mx-2 sm:mx-3 rounded"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Left section - Subject info */}
      <div className="flex items-center gap-3 text-[var(--text-secondary)]">
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[var(--text-tertiary)]">Subject:</span>
          <span className="text-[var(--text-primary)] font-semibold">
            Ant #1,204,847
          </span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[var(--text-tertiary)]" />
          <span className="text-[var(--text-primary)] truncate max-w-[150px] sm:max-w-none font-medium">
            {formatRoomName(gameState.currentRoom)}
          </span>
        </div>
      </div>

      {/* Right section - Stats */}
      <div className="flex items-center gap-4 text-[var(--text-secondary)]">
        <Tooltip content="Rooms explored">
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline text-[var(--text-tertiary)]">Explored:</span>
            <span className="text-[var(--text-primary)] font-semibold">
              {gameState.visitedRooms.length}
            </span>
          </div>
        </Tooltip>

        <span className="text-[var(--root-brown)] hidden sm:inline">│</span>

        <Tooltip content="Awakened NPCs">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[var(--sentience-rust)]" />
            <span className="hidden sm:inline text-[var(--text-tertiary)]">Awakened:</span>
            <span className="text-[var(--sentience-rust)] font-semibold">
              {gameState.awakenedNPCs.length}
            </span>
          </div>
        </Tooltip>

        <span className="text-[var(--root-brown)] hidden sm:inline">│</span>

        <Tooltip content="Inventory items">
          <div className="flex items-center gap-1.5">
            <Package className="w-4 h-4 text-[var(--fungus-pale)]" />
            <span className="hidden sm:inline text-[var(--text-tertiary)]">Items:</span>
            <span className="text-[var(--text-primary)] font-semibold">
              {gameState.inventory.length}
            </span>
          </div>
        </Tooltip>
      </div>
    </motion.footer>
  );
}

interface MenuPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onLoad: () => void;
  onNewGame: () => void;
  hasSave: boolean;
  isSaving?: boolean;
  gameState: GameState;
  onExportSave?: () => void;
}

export function MenuPanel({
  isOpen,
  onClose,
  onSave,
  onLoad,
  onNewGame,
  hasSave,
  isSaving = false,
  gameState,
  onExportSave,
}: MenuPanelProps) {
  const { containerRef } = useFocusTrap(isOpen, onClose);
  const prefersReducedMotion = useReducedMotion();
  const saveSummary = hasSave ? getSaveSummary() : null;
  const storageQuota = getStorageQuota();
  const showExportWarning = storageQuota.percentage > 80;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
        onClick={onClose}
        role="presentation"
      />

      {/* Panel */}
      <motion.div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-panel-title"
        className="fixed top-0 right-0 h-full w-80 game-panel z-50 overflow-y-auto"
        initial={prefersReducedMotion ? { x: 0, opacity: 0 } : { x: '100%' }}
        animate={{ x: 0, opacity: 1 }}
        exit={prefersReducedMotion ? { x: 0, opacity: 0 } : { x: '100%' }}
        transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 id="menu-panel-title" className="text-xl font-semibold text-[var(--text-primary)] font-rajdhani tracking-wide">
              Menu
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[var(--soil-medium)] rounded transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-[var(--text-tertiary)]" />
            </button>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={onSave}
              className="w-full justify-start"
              icon={<Save className="w-4 h-4" />}
              loading={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Game'}
            </Button>

            <Button
              onClick={onLoad}
              className="w-full justify-start"
              disabled={!hasSave || isSaving}
              icon={<Save className="w-4 h-4" />}
            >
              Load Game
            </Button>

            {onExportSave && (
              <Button
                onClick={onExportSave}
                className="w-full justify-start"
                disabled={isSaving}
                icon={<Save className="w-4 h-4" />}
                variant="secondary"
              >
                Export Save
              </Button>
            )}

            <div className="my-4 border-t border-[var(--border-subtle)]" />

            <Button
              onClick={onNewGame}
              variant="danger"
              className="w-full justify-start"
              disabled={isSaving}
            >
              New Game
            </Button>
          </div>

          {/* Game info */}
          <div className="mt-8 p-4 info-card rounded">
            <h3 className="text-base font-medium text-[var(--text-primary)] mb-3 font-rajdhani">
              Session Info
            </h3>
            <div className="space-y-2 text-sm text-[var(--text-secondary)]">
              <div className="flex justify-between">
                <span>Day Cycle:</span>
                <span className="text-[var(--text-primary)] font-semibold">
                  {gameState.daysCycle.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Awareness:</span>
                <span className="text-[var(--awareness-medium)] font-semibold">
                  {Math.floor(gameState.awareness)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sentience:</span>
                <span className="text-[var(--sentience-medium)] font-semibold">
                  {Math.floor(gameState.colonySentience)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Rooms:</span>
                <span className="text-[var(--text-primary)] font-semibold">
                  {gameState.visitedRooms.length}
                </span>
              </div>
            </div>

            {/* Save summary */}
            {saveSummary && (
              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2 font-rajdhani">
                  Last Save
                </h4>
                <div className="space-y-1 text-xs text-[var(--text-tertiary)]">
                  <div className="flex justify-between">
                    <span>Day {saveSummary.day}</span>
                    <span className="text-[var(--text-secondary)]">{saveSummary.size}</span>
                  </div>
                  <div className="text-[var(--text-dim)]">{saveSummary.timestamp}</div>
                </div>
              </div>
            )}

            {/* Storage quota */}
            <div className={`mt-4 pt-4 border-t border-[var(--border-subtle)] ${storageQuota.percentage > 80 ? 'storage-warning' : ''}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-[var(--text-tertiary)]">Storage</span>
                <span className={`text-xs font-semibold ${
                  storageQuota.percentage > 90 ? 'text-error' :
                  storageQuota.percentage > 80 ? 'text-warning' :
                  'text-[var(--text-secondary)]'
                }`}>
                  {storageQuota.percentage.toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 bg-[var(--soil-deep)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    storageQuota.percentage > 90 ? 'bg-error' :
                    storageQuota.percentage > 80 ? 'bg-warning' :
                    'bg-[var(--clay-orange)]'
                  }`}
                  style={{ width: `${Math.min(100, storageQuota.percentage)}%` }}
                />
              </div>
              {storageQuota.percentage > 80 && (
                <p className="text-xs text-warning mt-1">
                  {storageQuota.percentage > 90
                    ? 'Storage nearly full. Export save soon.'
                    : 'Storage running low. Consider exporting backup.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
