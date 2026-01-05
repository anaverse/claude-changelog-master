import { useState, useEffect } from 'react';
import { Settings, X, Clock, Bell, Volume2, Loader2, CheckCircle, Mail, AlertCircle } from 'lucide-react';
import { VOICE_OPTIONS } from '../types';

interface SettingsPanelProps {
  refreshInterval: number;
  onRefreshIntervalChange: (interval: number) => void;
}

const INTERVAL_OPTIONS = [
  { value: 0, label: 'Manual only' },
  { value: 60000, label: '1 minute' },
  { value: 300000, label: '5 minutes' },
  { value: 900000, label: '15 minutes' },
  { value: 1800000, label: '30 minutes' },
  { value: 3600000, label: '1 hour' },
  { value: 7200000, label: '2 hours' },
  { value: 21600000, label: '6 hours' },
  { value: 86400000, label: '24 hours' },
];

const NOTIFICATION_INTERVALS = [
  { value: 0, label: 'Disabled' },
  { value: 300000, label: 'Every 5 minutes' },
  { value: 900000, label: 'Every 15 minutes' },
  { value: 1800000, label: 'Every 30 minutes' },
  { value: 3600000, label: 'Every hour' },
  { value: 21600000, label: 'Every 6 hours' },
  { value: 43200000, label: 'Every 12 hours' },
  { value: 86400000, label: 'Once a day' },
];

export function SettingsPanel({ refreshInterval, onRefreshIntervalChange }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [notificationCheckInterval, setNotificationCheckInterval] = useState(0);
  const [notificationVoice, setNotificationVoice] = useState('Charon');
  const [monitorStatus, setMonitorStatus] = useState<{
    lastKnownVersion: string | null;
    isRunning: boolean;
    cronExpression: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [sendingDemoEmail, setSendingDemoEmail] = useState(false);
  const [demoEmailResult, setDemoEmailResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      loadSettings();
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const [settingsRes, statusRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/monitor/status'),
      ]);

      const settings = await settingsRes.json();
      const status = await statusRes.json();

      setEmailNotificationsEnabled(settings.emailNotificationsEnabled === 'true');
      setNotificationCheckInterval(parseInt(settings.notificationCheckInterval) || 0);
      setNotificationVoice(settings.notificationVoice || 'Charon');
      setMonitorStatus(status);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    try {
      await fetch(`/api/settings/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      // Refresh monitor status
      const statusRes = await fetch('/api/monitor/status');
      setMonitorStatus(await statusRes.json());
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const handleEmailNotificationsChange = async (enabled: boolean) => {
    setEmailNotificationsEnabled(enabled);
    await saveSetting('emailNotificationsEnabled', enabled.toString());
  };

  const handleNotificationIntervalChange = async (interval: number) => {
    setNotificationCheckInterval(interval);
    await saveSetting('notificationCheckInterval', interval.toString());
  };

  const handleNotificationVoiceChange = async (voice: string) => {
    setNotificationVoice(voice);
    await saveSetting('notificationVoice', voice);
  };

  const testNotificationCheck = async () => {
    setTestingNotification(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/monitor/check', { method: 'POST' });
      if (res.ok) {
        setTestResult('success');
        // Refresh status after check
        const statusRes = await fetch('/api/monitor/status');
        setMonitorStatus(await statusRes.json());
      } else {
        setTestResult('error');
      }
    } catch {
      setTestResult('error');
    } finally {
      setTestingNotification(false);
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  const sendDemoEmail = async () => {
    setSendingDemoEmail(true);
    setDemoEmailResult(null);
    try {
      const res = await fetch('/api/send-demo-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice: notificationVoice }),
      });
      if (res.ok) {
        setDemoEmailResult('success');
      } else {
        setDemoEmailResult('error');
      }
    } catch {
      setDemoEmailResult('error');
    } finally {
      setSendingDemoEmail(false);
      setTimeout(() => setDemoEmailResult(null), 5000);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label="Settings"
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Auto-refresh interval */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Clock className="w-4 h-4" />
                    Auto-refresh interval (UI)
                  </label>
                  <select
                    value={refreshInterval}
                    onChange={(e) => onRefreshIntervalChange(parseInt(e.target.value))}
                    className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {INTERVAL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700" />

                {/* Email Notifications Section */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-4">
                    <Bell className="w-4 h-4" />
                    Email Notifications
                  </h3>

                  {/* Enable toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Notify me when a new version is released
                    </span>
                    <button
                      onClick={() => handleEmailNotificationsChange(!emailNotificationsEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        emailNotificationsEnabled ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          emailNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Check interval */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Check for new versions
                    </label>
                    <select
                      value={notificationCheckInterval}
                      onChange={(e) => handleNotificationIntervalChange(parseInt(e.target.value))}
                      disabled={!emailNotificationsEnabled}
                      className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
                    >
                      {NOTIFICATION_INTERVALS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Voice selection for notifications */}
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <Volume2 className="w-4 h-4" />
                      Audio voice for email attachment
                    </label>
                    <select
                      value={notificationVoice}
                      onChange={(e) => handleNotificationVoiceChange(e.target.value)}
                      disabled={!emailNotificationsEnabled}
                      className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
                    >
                      {VOICE_OPTIONS.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} ({voice.tone})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status indicator */}
                  {monitorStatus && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Cron status:</span>
                        <span className={`flex items-center gap-1 ${monitorStatus.isRunning ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className={`w-2 h-2 rounded-full ${monitorStatus.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                          {monitorStatus.isRunning ? 'Running' : 'Stopped'}
                        </span>
                      </div>
                      {monitorStatus.cronExpression && (
                        <div className="text-gray-500 dark:text-gray-400 mb-1">
                          Schedule: <span className="font-mono text-xs bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded">{monitorStatus.cronExpression}</span>
                        </div>
                      )}
                      {monitorStatus.lastKnownVersion && (
                        <div className="text-gray-500 dark:text-gray-400">
                          Last known version: <span className="font-mono">{monitorStatus.lastKnownVersion}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Test button */}
                  <button
                    onClick={testNotificationCheck}
                    disabled={testingNotification || !emailNotificationsEnabled}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    {testingNotification ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking...
                      </>
                    ) : testResult === 'success' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Check complete
                      </>
                    ) : (
                      'Check for new version now'
                    )}
                  </button>

                  {/* Demo Email Button */}
                  <button
                    onClick={sendDemoEmail}
                    disabled={sendingDemoEmail}
                    className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {sendingDemoEmail ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating & Sending...
                      </>
                    ) : demoEmailResult === 'success' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Email Sent!
                      </>
                    ) : demoEmailResult === 'error' ? (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        Failed to send
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Send Demo Email with Audio
                      </>
                    )}
                  </button>
                </div>

                {/* Info */}
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    When a new changelog version is detected, you'll receive an email with the AI-generated summary and an audio file attachment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
