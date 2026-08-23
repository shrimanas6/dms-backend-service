import { Layout } from '../components/Layout';
import { useTranslation } from 'react-i18next';
import { RefreshCcw, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

export function RefundPolicy() {
    const { t } = useTranslation();

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 rounded-2xl bg-orange-100 text-orange-600 mb-2">
                        <RefreshCcw className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        {t('refundPolicy')}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Guidelines regarding Seva Contributions & Payment Dispute Resolution
                    </p>
                </div>

                {/* Content Box */}
                <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-orange-100 space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-orange-700">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                            1. Nature of Religious Donations & Seva Offerings
                        </h2>
                        <p>
                            All contributions made on this portal towards <strong>Annadana</strong>, <strong>Daily/Special Poojas</strong>, <strong>Temple Development</strong>, or <strong>General Offerings</strong> are voluntary religious donations.
                        </p>
                        <p className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-900 text-sm font-medium">
                            ⚠️ As a general rule applicable to religious and charitable endowments, donations once successfully made cannot be cancelled, modified, or refunded after the seva or prayer has been scheduled/performed.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-orange-700">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            2. Exceptions: Duplicate & Erroneous Transactions
                        </h2>
                        <p>
                            The Trust will promptly review and process refunds in the following legitimate circumstances:
                        </p>
                        <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-600">
                            <li><strong>Duplicate Charges:</strong> If a technical glitch or network error resulted in your bank account being charged multiple times for a single intended donation.</li>
                            <li><strong>Failed Status Debits:</strong> If money was debited from your bank account but the website failed to generate a confirmation receipt. (Such transactions are usually reversed automatically by your bank within 3–5 working days).</li>
                            <li><strong>Erroneous Excess Amount:</strong> In rare cases where a typing error occurred (e.g. ₹50,000 entered instead of ₹500), reported within 24 hours of the transaction before receipt book closure.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-orange-700">
                            <HelpCircle className="w-5 h-5" />
                            3. How to Request a Refund / Dispute Resolution
                        </h2>
                        <p>
                            If you believe a duplicate or erroneous debit has occurred, please write to our temple office within <strong>7 days</strong> of the transaction with the following details:
                        </p>
                        <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 text-sm space-y-1 text-gray-800">
                            <p><strong>1. Devotee Name & Mobile Number</strong></p>
                            <p><strong>2. Razorpay Payment ID</strong> (e.g. <code>pay_XXXXXXXXXX</code>)</p>
                            <p><strong>3. Date & Time of Transaction</strong></p>
                            <p><strong>4. Proof of bank debit / screenshot</strong></p>
                        </div>
                        <p className="pt-2">
                            Send the details to our official email: <strong>info@ballamanjatemple.org</strong> with the subject <em>"Payment Dispute - [Payment ID]"</em>.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-orange-700">
                            <RefreshCcw className="w-5 h-5" />
                            4. Refund Processing Timeframe
                        </h2>
                        <p>
                            Upon verification, approved refunds will be credited back directly to the original payment source (same UPI account, Debit Card, or Bank Account used during payment) via the <strong>Razorpay Payment Gateway</strong> within <strong>5 to 7 business days</strong>, subject to your bank’s processing timelines.
                        </p>
                    </section>

                    <section className="pt-6 border-t border-gray-100 text-xs sm:text-sm text-gray-500">
                        <p><strong>Office Support:</strong> Sri Ballamanja Temple Seva Trust, Ballamanja, Belthangady, Karnataka - 574214</p>
                        <p><strong>Support Email:</strong> info@ballamanjatemple.org | <strong>Helpline:</strong> +91 94800 00000</p>
                    </section>
                </div>
            </div>
        </Layout>
    );
}
