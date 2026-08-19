import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Receipt, Calendar, IndianRupee } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

interface Donation {
  id: string;
  amount: number;
  transaction_id: string;
  notes: string | null;
  created_at: string;
}

export function History() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDonations();
    }
  }, [user]);

  const loadDonations = async () => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'paid')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error loading donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-800">{t('donationHistory')}</h1>
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-3 rounded-xl shadow-lg w-full md:w-auto">
            <p className="text-sm opacity-90">{t('totalContributed')}</p>
            <p className="text-2xl font-bold">Rs.{totalAmount.toFixed(2)}</p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-12 shadow-lg border border-orange-100 text-center">
            <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-4">{t('loadingHistory')}</p>
          </div>
        ) : donations.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      {t('dateTime')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      {t('transactionId')}
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      {t('amount')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {donations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-orange-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {dayjs(donation.created_at).format('MMM DD, YYYY')}
                            </p>
                            <p className="text-sm text-gray-500">
                              {dayjs(donation.created_at).format('h:mm A')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm text-gray-600">
                            {donation.transaction_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <IndianRupee className="w-4 h-4 text-green-600" />
                          <span className="text-lg font-semibold text-green-600">
                            {Number(donation.amount).toFixed(2)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 shadow-lg border border-orange-100 text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('noDonationsHistoryTitle')}</h3>
            <p className="text-gray-600 mb-6">
              {t('noDonationsHistoryMsg')}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
