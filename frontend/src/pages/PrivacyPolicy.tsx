import { Layout } from '../components/Layout';
import { useTranslation } from 'react-i18next';
import { Lock, ShieldCheck, Database, Bell, EyeOff } from 'lucide-react';

export function PrivacyPolicy() {
    const { t } = useTranslation();

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 rounded-2xl bg-orange-100 text-orange-600 mb-2">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        {t('privacyPolicy')}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Last Updated: August 2026 | Sri Ballamanja Temple Seva Trust (Regd.)
                    </p>
                </div>

                {/* Content Box */}
                <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-orange-100 space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-orange-700">
                            <ShieldCheck className="w-5 h-5" />
                            1. Overview & Commitment to Privacy
                        </h2>
                        <p>
                            <strong>Sri Ballamanja Temple Seva Trust (Regd.)</strong> values your trust and is committed to protecting the privacy of all devotees, donors, and visitors. This Privacy Policy details how we collect, store, and utilize information provided on our website.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-orange-700">
                            <Database className="w-5 h-5" />
                            2. Information We Collect
                        </h2>
                        <p>When you register, make an online donation, or request reminders, we collect:</p>
                        <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-600">
                            <li><strong>Personal Identity:</strong> Full Name, Email Address, and Mobile Phone Number.</li>
                            <li><strong>Transaction Details:</strong> Amount contributed, date, seva category, and Razorpay Order/Payment IDs (Stored for digital receipt issuance).</li>
                            <li><strong>Preferences:</strong> Opt-in preferences for monthly seva reminders and communications.</li>
                        </ul>
                        <p className="text-sm bg-orange-50 p-4 rounded-xl border border-orange-100 text-orange-950 font-medium">
                            🔒 <strong>Note on Payment Security:</strong> We do NOT collect or store your credit/debit card numbers, UPI PINs, CVV, or net banking passwords. All payment transactions are handled through Razorpay's PCI-DSS Level 1 compliant gateway.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-orange-700">
                            <Bell className="w-5 h-5" />
                            3. How We Use Your Information
                        </h2>
                        <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-600">
                            <li>To generate and provide official digital donation receipts.</li>
                            <li>To maintain authentic accounts and audit records required by law for religious/charitable trusts.</li>
                            <li>To send monthly donation reminder SMS/Emails if opted-in by the devotee.</li>
                            <li>To notify devotees regarding major temple festivals, utsav dates, and seva schedules.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-orange-700">
                            <EyeOff className="w-5 h-5" />
                            4. Information Sharing & Third Parties
                        </h2>
                        <p>
                            We treat devotee records with utmost sanctity. We do <strong>NOT</strong> sell, trade, rent, or disclose devotee personal information to commercial third parties or marketing agencies. Information is shared only with:
                        </p>
                        <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-600">
                            <li><strong>Razorpay:</strong> To process secure transactions.</li>
                            <li><strong>Twilio / SMTP Providers:</strong> To deliver requested SMS/Email receipts and notifications.</li>
                            <li><strong>Statutory Authorities:</strong> If required by Indian law or tax audit regulations.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-orange-700">
                            <ShieldCheck className="w-5 h-5" />
                            5. Devotee Rights & Contact Information
                        </h2>
                        <p>
                            You have the right to review your transaction history, update your profile or phone number, and toggle notification preferences at any time via the <strong>Settings</strong> page.
                        </p>
                        <p className="pt-2 text-gray-600">
                            For any privacy inquiries or assistance, reach us at: <strong>info@ballamanjatemple.org</strong>.
                        </p>
                    </section>
                </div>
            </div>
        </Layout>
    );
}
