import React, { useEffect, useState } from 'react';
import { workflowApi } from '../features/workflow/services/workflowApi';

interface NotificationPreferences {
  channels: {
    EMAIL: boolean;
    SMS: boolean;
    IN_APP: boolean;
  };
  events: {
    LC_SUBMITTED: boolean;
    LC_STATUS_CHANGED: boolean;
    DOCUMENT_COMPLIANCE_FLAG: boolean;
    SETTLEMENT_CONFIRMED: boolean;
  };
}

export const NotificationPreferencesPage: React.FC = () => {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token') || 'mock-jwt-token-xyz';

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const response = await workflowApi.getNotificationPreferences(token);
        setPrefs(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, [token]);

  const handleSave = async () => {
    if (!prefs) return;
    setSaving(true);
    setMessage('');
    try {
      await workflowApi.updateNotificationPreferences({ channels: prefs.channels, events: prefs.events }, token);
      setMessage('Preferences saved successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !prefs) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const toggleChannel = (key: keyof typeof prefs.channels) => {
    setPrefs({ ...prefs, channels: { ...prefs.channels, [key]: !prefs.channels[key] } });
  };

  const toggleEvent = (key: keyof typeof prefs.events) => {
    setPrefs({ ...prefs, events: { ...prefs.events, [key]: !prefs.events[key] } });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-on-surface">Notification Preferences</h1>
        <p className="text-on-surface-variant text-sm">Manage how and when you want to receive alerts.</p>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-8 shadow-lg space-y-10">
        
        {/* Channels */}
        <section>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">speaker_notes</span>
              Delivery Channels
            </h2>
            <p className="text-sm text-outline mt-1">Select the mediums through which you receive notifications.</p>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-surface-container-highest rounded-lg border border-outline-variant/10 cursor-pointer hover:bg-surface-container-highest/80 transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-outline">web</span>
                <div>
                  <div className="font-medium text-on-surface">In-App Notifications</div>
                  <div className="text-xs text-outline">Receive alerts directly within the Lumina portal</div>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors relative ${prefs.channels.IN_APP ? 'bg-primary' : 'bg-outline-variant'}`}>
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${prefs.channels.IN_APP ? 'translate-x-6' : ''}`}></div>
              </div>
              <input type="checkbox" className="hidden" checked={prefs.channels.IN_APP} onChange={() => toggleChannel('IN_APP')} />
            </label>

            <label className="flex items-center justify-between p-4 bg-surface-container-highest rounded-lg border border-outline-variant/10 cursor-pointer hover:bg-surface-container-highest/80 transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-outline">mail</span>
                <div>
                  <div className="font-medium text-on-surface">Email</div>
                  <div className="text-xs text-outline">Receive daily summaries and critical alerts via email</div>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors relative ${prefs.channels.EMAIL ? 'bg-primary' : 'bg-outline-variant'}`}>
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${prefs.channels.EMAIL ? 'translate-x-6' : ''}`}></div>
              </div>
              <input type="checkbox" className="hidden" checked={prefs.channels.EMAIL} onChange={() => toggleChannel('EMAIL')} />
            </label>

            <label className="flex items-center justify-between p-4 bg-surface-container-highest rounded-lg border border-outline-variant/10 cursor-pointer hover:bg-surface-container-highest/80 transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-outline">sms</span>
                <div>
                  <div className="font-medium text-on-surface">SMS text messages</div>
                  <div className="text-xs text-outline">Get text alerts for urgent compliance blocks</div>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors relative ${prefs.channels.SMS ? 'bg-primary' : 'bg-outline-variant'}`}>
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${prefs.channels.SMS ? 'translate-x-6' : ''}`}></div>
              </div>
              <input type="checkbox" className="hidden" checked={prefs.channels.SMS} onChange={() => toggleChannel('SMS')} />
            </label>
          </div>
        </section>

        <hr className="border-outline-variant/20" />

        {/* Events */}
        <section>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">bolt</span>
              Event Subscriptions
            </h2>
            <p className="text-sm text-outline mt-1">Choose which lifecycle events trigger a notification.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(prefs.events).map((key) => {
              const eventKey = key as keyof typeof prefs.events;
              const title = eventKey.replace(/_/g, ' ');
              return (
                <label key={key} className="flex items-start gap-3 p-4 bg-surface/50 rounded-lg border border-outline-variant/10 cursor-pointer hover:bg-surface-container-highest/50 transition-colors">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-4 h-4 text-primary bg-surface border-outline-variant rounded focus:ring-primary focus:ring-2" 
                    checked={prefs.events[eventKey]} 
                    onChange={() => toggleEvent(eventKey)} 
                  />
                  <div>
                    <div className="font-medium text-on-surface text-sm">{title}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        <div className="pt-6 border-t border-outline-variant/20 flex items-center justify-between">
          <div className="text-sm text-green-400 font-medium">{message}</div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-on-primary font-semibold py-2.5 px-8 rounded-lg shadow-lg hover:shadow-primary/20 hover:bg-primary-fixed transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {saving ? <span className="animate-spin material-symbols-outlined text-sm">sync</span> : null}
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
