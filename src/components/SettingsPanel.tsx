import { useState, useEffect } from 'react';
import { Settings, X, Clock, Bell, Volume2, Loader2, CheckCircle, Mail, AlertCircle, Moon, MessageSquare } from 'lucide-react';
import { VOICE_OPTIONS } from '../types';

interface SettingsPanelProps {
  refreshInterval: number;
  onRefreshIntervalChange: (interval: number) => void;
  defaultTheme: 'light' | 'dark';
  onDefaultThemeChange: (theme: 'light' | 'dark') => void;
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
  { value: 604800000, label: '1 week' },
  { value: 1209600000, label: '2 weeks' },
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
  { value: 604800000, label: 'Once a week' },
  { value: 1209600000, label: 'Every two weeks' },
];

export function SettingsPanel({ refreshInterval, onRefreshIntervalChange, defaultTheme, onDefaultThemeChange }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState(false);
  const [alwaysSendEmail, setAlwaysSendEmail] = useState(false);
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
      setSmsNotificationsEnabled(settings.smsNotificationsEnabled === 'true');
      setAlwaysSendEmail(settings.alwaysSendEmail === 'true');
      setNotificationCheckInterval(parseInt(settings.notificationCheckInterval) || 0);
      setNotificationVoice(settings.notificationVoice || 'Charon');
      setMonitorStatus(status);
      // Sync to localStorage for Header email button access
      localStorage.setItem('smsNotificationsEnabled', settings.smsNotificationsEnabled === 'true' ? 'true' : 'false');
      localStorage.setItem('notificationVoice', settings.notificationVoice || 'Charon');
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

  const handleSmsNotificationsChange = async (enabled: boolean) => {
    setSmsNotificationsEnabled(enabled);
    // Save to localStorage for Header email button access
    localStorage.setItem('smsNotificationsEnabled', enabled.toString());
    await saveSetting('smsNotificationsEnabled', enabled.toString());
  };

  const handleAlwaysSendEmailChange = async (enabled: boolean) => {
    setAlwaysSendEmail(enabled);
    await saveSetting('alwaysSendEmail', enabled.toString());
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
        body: JSON.stringify({ voice: notificationVoice, includeSms: smsNotificationsEnabled }),
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
        className="p-2.5 text-brutal-secondary hover:text-brutal-primary hover:bg-brutal-secondary/10 transition-colors"
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
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-brutal-elevated border-brutal shadow-brutal z-50 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-brutal heading-brutal-md">Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-brutal-secondary hover:bg-brutal-secondary/10 transition-colors"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent-coral" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Appearance Section */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-brutal uppercase tracking-wide text-brutal-primary mb-4">
                    <Moon className="w-4 h-4" />
                    Appearance
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-brutal-secondary">
                      Use dark mode by default
                    </span>
                    <button
                      onClick={() => onDefaultThemeChange(defaultTheme === 'dark' ? 'light' : 'dark')}
                      className={`relative inline-flex h-6 w-11 items-center border-brutal transition-colors ${
                        defaultTheme === 'dark' ? 'bg-accent-green' : 'bg-brutal-secondary/30'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform bg-white border-2 border-black transition-transform ${
                          defaultTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t-brutal" />

                {/* Auto-refresh interval */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-brutal uppercase tracking-wide text-brutal-secondary mb-2">
                    <Clock className="w-4 h-4" />
                    Auto-refresh interval (UI)
                  </label>
                  <select
                    value={refreshInterval}
                    onChange={(e) => onRefreshIntervalChange(parseInt(e.target.value))}
                    className="select-brutal w-full"
                  >
                    {INTERVAL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Divider */}
                <div className="border-t-brutal" />

                {/* Email Notifications Section */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-brutal uppercase tracking-wide text-brutal-primary mb-4">
                    <Bell className="w-4 h-4" />
                    Email Notifications
                  </h3>

                  {/* Enable toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-brutal-secondary">
                      Notify me when a new version is released
                    </span>
                    <button
                      onClick={() => handleEmailNotificationsChange(!emailNotificationsEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center border-brutal transition-colors ${
                        emailNotificationsEnabled ? 'bg-accent-green' : 'bg-brutal-secondary/30'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform bg-white border-2 border-black transition-transform ${
                          emailNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Always send email toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-sm text-brutal-secondary">
                        Send email on every check
                      </span>
                      <p className="text-xs text-brutal-secondary/70">
                        Even when no new version is released
                      </p>
                    </div>
                    <button
                      onClick={() => handleAlwaysSendEmailChange(!alwaysSendEmail)}
                      disabled={!emailNotificationsEnabled}
                      className={`relative inline-flex h-6 w-11 items-center border-brutal transition-colors disabled:opacity-50 ${
                        alwaysSendEmail ? 'bg-accent-green' : 'bg-brutal-secondary/30'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform bg-white border-2 border-black transition-transform ${
                          alwaysSendEmail ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Check interval */}
                  <div className="mb-4">
                    <label className="block text-sm text-brutal-secondary mb-1">
                      Check for new versions
                    </label>
                    <select
                      value={notificationCheckInterval}
                      onChange={(e) => handleNotificationIntervalChange(parseInt(e.target.value))}
                      disabled={!emailNotificationsEnabled}
                      className="select-brutal w-full disabled:opacity-50"
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
                    <label className="flex items-center gap-2 text-sm text-brutal-secondary mb-1">
                      <Volume2 className="w-4 h-4" />
                      Audio voice for email attachment
                    </label>
                    <select
                      value={notificationVoice}
                      onChange={(e) => handleNotificationVoiceChange(e.target.value)}
                      disabled={!emailNotificationsEnabled}
                      className="select-brutal w-full disabled:opacity-50"
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
                    <div className="p-3 bg-brutal-secondary/10 border-brutal-thin text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-brutal-secondary">Cron status:</span>
                        <span className={`flex items-center gap-1 ${monitorStatus.isRunning ? 'text-accent-green' : 'text-brutal-secondary'}`}>
                          <span className={`w-2 h-2 ${monitorStatus.isRunning ? 'bg-accent-green animate-pulse' : 'bg-brutal-secondary/50'}`} />
                          {monitorStatus.isRunning ? 'Running' : 'Stopped'}
                        </span>
                      </div>
                      {monitorStatus.cronExpression && (
                        <div className="text-brutal-secondary mb-1">
                          Schedule: <span className="font-mono text-xs bg-brutal-secondary/20 px-1.5 py-0.5 border border-black">{monitorStatus.cronExpression}</span>
                        </div>
                      )}
                      {monitorStatus.lastKnownVersion && (
                        <div className="text-brutal-secondary">
                          Last known version: <span className="font-mono">{monitorStatus.lastKnownVersion}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Test button */}
                  <button
                    onClick={testNotificationCheck}
                    disabled={testingNotification || !emailNotificationsEnabled}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-brutal-secondary/10 text-brutal-primary border-brutal-thin hover:bg-brutal-secondary/20 transition-colors disabled:opacity-50 font-brutal uppercase tracking-wide text-sm"
                  >
                    {testingNotification ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking...
                      </>
                    ) : testResult === 'success' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-accent-green" />
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
                    className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent-coral text-white border-brutal shadow-brutal-sm transition-all duration-100 hover:shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] disabled:opacity-50 font-brutal uppercase tracking-wide text-sm"
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

                {/* Divider */}
                <div className="border-t-brutal" />

                {/* SMS Notifications Section */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-brutal uppercase tracking-wide text-brutal-primary mb-4">
                    <MessageSquare className="w-4 h-4" />
                    SMS Notifications
                  </h3>

                  {/* Enable toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-sm text-brutal-secondary">
                        Send SMS when new version is released
                      </span>
                      <p className="text-xs text-brutal-secondary/70">
                        Requires Twilio credentials in .env
                      </p>
                    </div>
                    <button
                      onClick={() => handleSmsNotificationsChange(!smsNotificationsEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center border-brutal transition-colors ${
                        smsNotificationsEnabled ? 'bg-accent-green' : 'bg-brutal-secondary/30'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform bg-white border-2 border-black transition-transform ${
                          smsNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 bg-accent-coral/10 border-brutal border-l-4 border-l-accent-coral">
                  <p className="text-xs text-brutal-secondary">
                    When a new changelog version is detected, you'll receive an email with the AI-generated summary and an audio file attachment. If SMS is enabled, you'll also get a text message.
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
