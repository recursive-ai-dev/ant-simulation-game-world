import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Volume2,
  Music,
  Type,
  Monitor,
  Accessibility,
  Save,
  RotateCcw,
  Speaker
} from 'lucide-react';
import { GameSettings, DEFAULT_SETTINGS } from '../types/game';
import { Modal, Button, Slider, Switch, Divider } from './ui';
import { audioEngine } from '@/utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSave: (settings: GameSettings) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);
  const [isTestingAudio, setIsTestingAudio] = useState(false);
  const [audioTestResult, setAudioTestResult] = useState<'success' | 'error' | null>(null);

  const handleSave = () => {
    onSave(localSettings);
    audioEngine.updateSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    setAudioTestResult(null);
  };

  const handleTestAudio = async () => {
    setIsTestingAudio(true);
    setAudioTestResult(null);

    try {
      const success = await audioEngine.testAudio();
      setAudioTestResult(success ? 'success' : 'error');
      setTimeout(() => setAudioTestResult(null), 3000);
    } catch {
      setAudioTestResult('error');
      setTimeout(() => setAudioTestResult(null), 3000);
    } finally {
      setIsTestingAudio(false);
    }
  };

  const updateSetting = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      size="lg"
    >
      <div className="space-y-6">
        {/* Audio Settings */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Volume2 className="w-5 h-5 text-[var(--clay-orange)]" />
            <h3 className="text-base font-medium text-[var(--text-primary)] font-rajdhani">
              Audio
            </h3>
          </div>
          
          <div className="space-y-4">
            <Slider
              label="Master Volume"
              value={localSettings.masterVolume}
              onChange={(v) => updateSetting('masterVolume', v)}
              min={0}
              max={1}
              step={0.05}
              showValue
              valueLabel={`${Math.round(localSettings.masterVolume * 100)}%`}
            />
            
            <Slider
              label="Music Volume"
              value={localSettings.musicVolume}
              onChange={(v) => updateSetting('musicVolume', v)}
              min={0}
              max={1}
              step={0.05}
              showValue
              valueLabel={`${Math.round(localSettings.musicVolume * 100)}%`}
            />
            
            <Slider
              label="Sound Effects"
              value={localSettings.sfxVolume}
              onChange={(v) => updateSetting('sfxVolume', v)}
              min={0}
              max={1}
              step={0.05}
              showValue
              valueLabel={`${Math.round(localSettings.sfxVolume * 100)}%`}
            />
            
            <Slider
              label="Ambient Sounds"
              value={localSettings.ambientVolume}
              onChange={(v) => updateSetting('ambientVolume', v)}
              min={0}
              max={1}
              step={0.05}
              showValue
              valueLabel={`${Math.round(localSettings.ambientVolume * 100)}%`}
            />

            {/* Audio test button */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                onClick={handleTestAudio}
                variant="secondary"
                size="sm"
                icon={<Speaker className="w-4 h-4" />}
                loading={isTestingAudio}
                className="flex-1"
              >
                Test Audio
              </Button>
              {audioTestResult === 'success' && (
                <span className="text-xs text-success">✓ Sound played</span>
              )}
              {audioTestResult === 'error' && (
                <span className="text-xs text-error">✗ Test failed</span>
              )}
            </div>
          </div>
        </section>

        <Divider />

        {/* Display Settings */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-[var(--clay-orange)]" />
            <h3 className="text-base font-medium text-[var(--text-primary)] font-rajdhani">
              Display
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-[var(--text-secondary)] font-medium mb-2 block">
                Text Speed
              </label>
              <div className="flex gap-2">
                {(['instant', 'fast', 'normal', 'slow'] as const).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => updateSetting('textSpeed', speed)}
                    className={`
                      flex-1 px-3 py-2 text-xs rounded transition-all
                      ${localSettings.textSpeed === speed
                        ? 'bg-[var(--clay-orange)] text-[var(--text-primary)]'
                        : 'bg-[var(--soil-medium)] text-[var(--text-tertiary)] hover:bg-[var(--soil-light)]'
                      }
                    `}
                  >
                    {speed.charAt(0).toUpperCase() + speed.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-[var(--text-secondary)] font-medium mb-2 block">
                Font Size
              </label>
              <div className="flex gap-2">
                {(['small', 'medium', 'large', 'xlarge'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSetting('fontSize', size)}
                    className={`
                      flex-1 px-3 py-2 text-xs rounded transition-all
                      ${localSettings.fontSize === size
                        ? 'bg-[var(--clay-orange)] text-[var(--text-primary)]'
                        : 'bg-[var(--soil-medium)] text-[var(--text-tertiary)] hover:bg-[var(--soil-light)]'
                      }
                    `}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <Switch
              label="High Contrast Mode"
              checked={localSettings.highContrast}
              onChange={(checked) => updateSetting('highContrast', checked)}
            />
          </div>
        </section>

        <Divider />

        {/* Accessibility Settings */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Accessibility className="w-5 h-5 text-[var(--clay-orange)]" />
            <h3 className="text-base font-medium text-[var(--text-primary)] font-rajdhani">
              Accessibility
            </h3>
          </div>
          
          <div className="space-y-4">
            <Switch
              label="Reduced Motion"
              checked={localSettings.reducedMotion}
              onChange={(checked) => updateSetting('reducedMotion', checked)}
            />
            
            <Switch
              label="Enable Notifications"
              checked={localSettings.notifications}
              onChange={(checked) => updateSetting('notifications', checked)}
            />
          </div>
        </section>

        <Divider />

        {/* Game Settings */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Save className="w-5 h-5 text-[var(--clay-orange)]" />
            <h3 className="text-base font-medium text-[var(--text-primary)] font-rajdhani">
              Game
            </h3>
          </div>
          
          <div className="space-y-4">
            <Switch
              label="Auto-Save (every 5 minutes)"
              checked={localSettings.autoSave}
              onChange={(checked) => updateSetting('autoSave', checked)}
            />
          </div>
        </section>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <Button
            onClick={handleReset}
            variant="secondary"
            icon={<RotateCcw className="w-4 h-4" />}
            className="flex-1"
          >
            Reset to Defaults
          </Button>
          
          <Button
            onClick={handleSave}
            className="flex-1"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </Modal>
  );
}
