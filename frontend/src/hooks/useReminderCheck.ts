import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { API_URL } from '../lib/api';
import dayjs from 'dayjs';

export function useReminderCheck() {
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) return;

    const checkReminder = async () => {
      try {
        const { data: settings } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!settings || !settings.notifications_enabled) {
          return;
        }

        const { data: lastDonation } = await supabase
          .from('donations')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('status', 'paid')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!lastDonation) {
          return;
        }

        const lastDonationDate = dayjs(lastDonation.created_at);
        const now = dayjs();
        const daysSinceLastDonation = now.diff(lastDonationDate, 'day');

        if (daysSinceLastDonation >= 30) {
          const lastReminderSent = settings.last_reminder_sent
            ? dayjs(settings.last_reminder_sent)
            : null;

          const shouldShowReminder =
            !lastReminderSent || now.diff(lastReminderSent, 'day') >= 7;

          if (shouldShowReminder) {
            // Fetch profile for name and phone
            const { data: profile } = await supabase
              .from('profiles')
              .select('name, phone')
              .eq('id', user.id)
              .maybeSingle();

            showToast(
              'It has been a month since your last donation. A reminder has been sent to your email/mobile.',
              'info'
            );

            // Trigger backend reminder
            fetch(`${API_URL}/api/send-reminder`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: profile?.name || 'Devotee',
                email: user.email,
                phone: settings.sms_enabled ? profile?.phone : null,
                daysSinceLastDonation
              })
            }).catch(err => console.error('Failed to trigger backend reminder:', err));

            await supabase
              .from('user_settings')
              .update({ last_reminder_sent: now.toISOString() })
              .eq('user_id', user.id);
          }
        }
      } catch (error) {
        console.error('Error checking reminder:', error);
      }
    };

    checkReminder();

    const interval = setInterval(checkReminder, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, showToast]);
}
