import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { API_URL } from '../lib/api';
import { Bell, BellOff, Save, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Settings() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState<'email' | 'sms' | null>(null);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user, profile]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setNotificationsEnabled(data.notifications_enabled);
        setSmsEnabled(data.sms_enabled);
      }

      if (profile?.phone) {
        setPhone(profile.phone);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const { error: settingsError } = await supabase
        .from('user_settings')
        .update({
          notifications_enabled: notificationsEnabled,
          sms_enabled: smsEnabled
        })
        .eq('user_id', user!.id);

      if (settingsError) throw settingsError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ phone })
        .eq('id', user!.id);

      if (profileError) throw profileError;

      showToast(t('settingsSaved'), 'success');
    } catch (error) {
      showToast(t('settingsSaveFailed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async (type: 'email' | 'sms') => {
    setSendingTest(type);
    try {
      const response = await fetch(`${API_URL}/api/test-${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          phone: phone,
          name: profile?.name || 'Devotee'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test notification');
      }

      // Show success message with additional info
      if (data.mock) {
        showToast(t('testSentMock', { type, dest: type === 'email' ? 'server console' : 'server console' }), 'success');
      } else {
        showToast(t('testSentSuccess', { type, dest: type === 'email' ? 'inbox' : 'phone' }), 'success');
      }
    } catch (error: any) {
      console.error(`Test ${type} error:`, error);
      showToast(error.message || t('testFailed', { type }), 'error');
    } finally {
      setSendingTest(null);
    }
  };


  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('settings')}</h1>
          <p className="text-gray-600 mt-2">{t('notificationPreferences')}</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-12 shadow-lg border border-orange-100 text-center">
            <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading settings...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-600" />
                {t('notificationPreferences')}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Language Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-600 shrink-0">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{t('language')}</h3>
                    <p className="text-sm text-gray-600">{t('languageDesc')}</p>
                  </div>
                </div>

                <div className="flex bg-white rounded-lg border border-orange-200 p-1">
                  <button
                    onClick={() => i18n.changeLanguage('en')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${i18n.language === 'en'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-orange-50'
                      }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => i18n.changeLanguage('kn')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${i18n.language === 'kn'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-orange-50'
                      }`}
                  >
                    ಕನ್ನಡ
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${notificationsEnabled
                    ? 'bg-gradient-to-br from-orange-500 to-amber-600'
                    : 'bg-gray-300'
                    }`}>
                    {notificationsEnabled ? (
                      <Bell className="w-6 h-6 text-white" />
                    ) : (
                      <BellOff className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{t('monthlyReminders')}</h3>
                    <p className="text-sm text-gray-600">
                      {t('monthlyRemindersDesc')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${notificationsEnabled ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${smsEnabled
                    ? 'bg-gradient-to-br from-orange-500 to-amber-600'
                    : 'bg-gray-300'
                    }`}>
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{t('smsReminders')}</h3>
                    <p className="text-sm text-gray-600">
                      {t('smsRemindersDesc')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSmsEnabled(!smsEnabled)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${smsEnabled ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${smsEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t('phoneNumber')}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 transition-all"
                  placeholder={t('enterPhone')}
                  maxLength={10}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => sendTestNotification('email')}
                  disabled={!!sendingTest}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-orange-100 rounded-xl text-orange-600 font-semibold hover:bg-orange-50 transition-all disabled:opacity-50"
                >
                  {sendingTest === 'email' ? t('sending') : t('sendTestEmail')}
                </button>
                <button
                  onClick={() => sendTestNotification('sms')}
                  disabled={!!sendingTest || !phone}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-orange-100 rounded-xl text-orange-600 font-semibold hover:bg-orange-50 transition-all disabled:opacity-50"
                >
                  {sendingTest === 'sms' ? t('sending') : t('sendTestSms')}
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>{t('note')}:</strong> {t('noteDesc')}
                </p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-600 text-white px-8 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {t('saveChanges')}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout >
  );
}
