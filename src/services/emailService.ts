// Email service now uses the demo email endpoint with audio attachment
export async function sendChangelogEmail(): Promise<boolean> {
  try {
    // Get voice preference from localStorage or use default
    const voice = localStorage.getItem('notificationVoice') || 'Charon';
    // Check if SMS notifications are enabled (stored by SettingsPanel)
    const smsEnabled = localStorage.getItem('smsNotificationsEnabled') === 'true';

    const response = await fetch('/api/send-demo-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ voice, includeSms: smsEnabled }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}
