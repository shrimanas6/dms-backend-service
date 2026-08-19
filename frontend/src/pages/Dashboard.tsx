import { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { api, ApiError } from '../lib/api';
import { Heart, X, TrendingUp, IndianRupee, Lock, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

interface Donation {
  id: string;
  amount: number;
  created_at: string;
}

// Mirrors the server-side validation in backend/server/index.js. This copy exists
// for immediate feedback only - the server's check is the authoritative one.
const AMOUNT_RE = /^\d{1,7}(\.\d{1,2})?$/;
const MIN_RUPEES = 1;
const MAX_RUPEES = 500000;

/**
 * All three buttons are UPI, so restrict checkout to the UPI tab instead of
 * showing cards/netbanking/wallets. Targeting a specific app (PhonePe, GPay)
 * would need UPI intent, which only works on Android mobile web.
 */
const UPI_ONLY = {
  upi: true,
  card: false,
  netbanking: false,
  wallet: false,
  paylater: false,
  emi: false,
};

export function Dashboard() {
  const { profile, user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'selection' | 'processing' | 'success'>('selection');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'phonepe' | 'googlepay' | null>(null);
  const [amount, setAmount] = useState('');
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [totalDonations, setTotalDonations] = useState(0);
  const [lastDonation, setLastDonation] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  // Tracks whether the payment resolved, so modal.ondismiss does not fight the
  // handler / payment.failed callbacks over the step state.
  const paidRef = useRef(false);

  useEffect(() => {
    if (user) {
      loadDonationStats();
    }
  }, [user]);


  const loadDonationStats = async () => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      if (data) {
        setRecentDonations(data);
        const { data: allDonations } = await supabase
          .from('donations')
          .select('amount')
          .eq('user_id', user!.id)
          .eq('status', 'paid');

        if (allDonations) {
          const total = allDonations.reduce((sum, d) => sum + Number(d.amount), 0);
          setTotalDonations(total);
        }

        if (data.length > 0) {
          setLastDonation(data[0].created_at);
        }
      }
    } catch (error) {
      console.error('Error loading donation stats:', error);
    }
  };

  const handleRazorpayPayment = async (method: 'upi' | 'phonepe' | 'googlepay') => {
    if (isPaying) return;

    const trimmed = amount.trim();
    if (!AMOUNT_RE.test(trimmed)) {
      showToast(t('enterValidAmount'), 'error');
      return;
    }
    const rupees = Number(trimmed);
    if (rupees < MIN_RUPEES || rupees > MAX_RUPEES) {
      showToast(t('amountOutOfRange'), 'error');
      return;
    }

    // checkout.js is loaded from index.html.
    if (!window.Razorpay) {
      showToast(t('paymentInitFailed'), 'error');
      return;
    }

    setIsPaying(true);
    setPaymentMethod(method);
    setPaymentStep('processing');
    paidRef.current = false;

    // 1. Ask the server to create the order. It validates the amount, records a
    //    pending donation, and returns the publishable key.
    let order;
    try {
      order = await api.createOrder({ amount: trimmed });
    } catch (err) {
      console.error(err);
      showToast(err instanceof ApiError ? err.message : t('paymentInitFailed'), 'error');
      setPaymentStep('selection');
      setIsPaying(false);
      return;
    }

    // 2. Open checkout bound to that order. Because order_id is present, Razorpay
    //    charges the order's amount - the client cannot influence it.
    const options = {
      key: order.key_id,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency,
      name: 'Temple Donations',
      description: 'Donation Payment',
      method: UPI_ONLY,
      prefill: {
        name: profile?.name || '',
        email: user?.email || '',
        contact: profile?.phone || '',
      },
      theme: {
        color: '#F97316',
      },

      // 3. Confirm server-side. Only the server can mark the donation paid.
      handler: async (response: RazorpaySuccessResponse) => {
        paidRef.current = true;
        try {
          const result = await api.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          setReceiptId(result.payment_id);
          setPaymentStep('success');
          showToast(t('donationSuccessful'), 'success');
          await loadDonationStats();
        } catch (err) {
          console.error(err);
          // The payment itself succeeded - only our confirmation call failed, and
          // the webhook will still record it. Saying "failed" here would be wrong.
          setReceiptId(response.razorpay_payment_id ?? null);
          setPaymentStep('success');
          showToast(t('verificationFailed'), 'info');
        } finally {
          setIsPaying(false);
        }
      },

      modal: {
        ondismiss: () => {
          if (!paidRef.current) {
            showToast(t('paymentCancelled'), 'info');
            setPaymentStep('selection');
            setIsPaying(false);
          }
        },
      },
    };

    const paymentObject = new window.Razorpay(options);

    paymentObject.on('payment.failed', (resp: RazorpayFailureResponse) => {
      paidRef.current = true; // suppress the ondismiss double-fire
      console.error('Razorpay payment failed:', resp?.error);
      showToast(resp?.error?.description || t('donationFailed'), 'error');
      setPaymentStep('selection');
      setIsPaying(false);
    });

    paymentObject.open();
  };

  const resetModal = () => {
    setShowDonateModal(false);
    setPaymentStep('selection');
    setAmount('');
    setPaymentMethod(null);
    setReceiptId(null);
    setIsPaying(false);
    paidRef.current = false;
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Banner */}
        <div className="relative h-64 rounded-2xl overflow-hidden shadow-2xl">
          <img
            src="https://images.pexels.com/photos/12398207/pexels-photo-12398207.jpeg"
            alt="Temple"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end">
            <div className="p-6 md:p-8 w-full">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                {t('welcome')}, {profile?.name}!
              </h1>
              <p className="text-white/90 text-lg">
                {t('greeting')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">{t('totalDonations')}</h3>
              <IndianRupee className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">Rs.{totalDonations.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-medium">{t('lastDonation')}</h3>
              <TrendingUp className="w-8 h-8 text-amber-500" />
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {lastDonation ? dayjs(lastDonation).format('MMM DD, YYYY') : t('noDonationsYet')}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">{t('makeDonation')}</h3>
              <Heart className="w-8 h-8 text-white" />
            </div>
            <button
              onClick={() => setShowDonateModal(true)}
              className="w-full bg-white text-orange-600 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors"
            >
              {t('donateNow')}
            </button>
          </div>
        </div>

        {/* Recent Donations Table */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('recentDonations')}</h2>
          {recentDonations.length > 0 ? (
            <div className="space-y-3">
              {recentDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-semibold text-gray-800">Rs.{Number(donation.amount).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {dayjs(donation.created_at).format('MMM DD, YYYY, h:mm A')}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">{t('noDonationsMessage')}</p>
          )}
        </div>
      </div>

      {/* Donation Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl transform animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-6 flex items-center justify-between text-white relative">
              <h2 className="text-xl font-bold pr-12">
                {paymentStep === 'selection' && t('chooseAmount')}
                {paymentStep === 'processing' && t('processingPayment')}
                {paymentStep === 'success' && t('donationSuccessful')}
              </h2>
              <button
                onClick={resetModal}
                className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors z-10"
                aria-label="Close modal"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              {paymentStep === 'selection' && (
                <div className="space-y-6">
                  {/* Amount Selection Section */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="amount" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        {t('donationAmount')}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-semibold">
                          ₹
                        </span>
                        <input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0.01"
                          autoFocus
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all text-xl font-bold text-gray-800"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {[100, 500, 1000, 2000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAmount(preset.toString())}
                          className={`py-2 px-1 border-2 rounded-xl transition-all font-bold text-sm ${amount === preset.toString()
                            ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200'
                            : 'border-gray-100 text-gray-600 hover:border-orange-200 hover:bg-orange-50'
                            }`}
                        >
                          ₹{preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-gray-100 my-2"></div>

                  {/* Payment Methods Section */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('payUsing')} UPI</p>

                    <button
                      onClick={() => handleRazorpayPayment('phonepe')}
                      disabled={isPaying}
                      className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <img src="https://cryptologos.cc/logos/phonepe-logo.png" alt="PhonePe" className="w-7 h-7 object-contain" onError={(e) => (e.currentTarget.src = "https://www.phonepe.com/favicon-32x32.png")} />
                        </div>
                        <p className="font-bold text-gray-800">PhonePe</p>
                      </div>
                      <div className="w-5 h-5 border-2 border-gray-200 rounded-full group-hover:border-purple-500 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleRazorpayPayment('googlepay')}
                      disabled={isPaying}
                      className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <img src="https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png" alt="Google Pay" className="w-7 h-7 object-contain" />
                        </div>
                        <p className="font-bold text-gray-800">Google Pay</p>
                      </div>
                      <div className="w-5 h-5 border-2 border-gray-200 rounded-full group-hover:border-blue-500 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleRazorpayPayment('upi')}
                      disabled={isPaying}
                      className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold text-xs">
                          UPI
                        </div>
                        <p className="font-bold text-gray-800">{t('payUsingUpi')}</p>
                      </div>
                      <div className="w-5 h-5 border-2 border-gray-200 rounded-full group-hover:border-orange-500 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col items-center gap-2 text-[10px] text-gray-400 justify-center pt-2">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        <span>{t('securedBy')}</span>
                      </div>
                      <p className="text-gray-400 font-medium italic">{t('qrNote')}</p>
                      <p className="text-[9px] text-amber-500 font-semibold bg-amber-50 px-3 py-1 rounded-full border border-amber-100 mt-1">
                        {t('testModeNote')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="py-12 text-center space-y-6">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-4 border-orange-50 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <IndianRupee className="w-10 h-10 text-orange-500" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{t('contacting')} {paymentMethod === 'phonepe' ? 'PhonePe' : paymentMethod === 'googlepay' ? 'Google Pay' : 'UPI'}...</h3>
                    <p className="text-gray-500 mt-2">{t('securingPayment')} {amount}</p>
                  </div>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="py-8 text-center space-y-6 animate-in zoom-in duration-500">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{t('donationConfirmed')}</h3>
                    <p className="text-gray-600 mt-2">
                      {t('contributionMessage')} <span className="font-bold text-green-600">Rs.{amount}</span> {t('processedSuccessfully')} {paymentMethod?.toUpperCase()}.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{t('receiptId')}</p>
                    <p className="font-mono text-gray-700 break-all">{receiptId ?? '—'}</p>
                  </div>
                  <button
                    onClick={resetModal}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-colors shadow-lg"
                  >
                    {t('done')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
