import { Layout } from '../components/Layout';
import { useTranslation } from 'react-i18next';
import { FileText, Shield, CheckCircle, Scale, AlertCircle } from 'lucide-react';

export function Terms() {
    const { t } = useTranslation();

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 rounded-2xl bg-orange-100 text-orange-600 mb-2">
                        <Scale className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        {t('termsAndConditions')}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Last Updated: August 2026 | Effective for Sri Ballamanja Temple Seva Trust (Regd.)
                    </p>
                </div>

                {/* Content Box */}
                <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-orange-100 space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-orange-700">
                            <FileText className="w-5 h-5" />
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            Welcome to the official online portal of <strong>Sri Ballamanja Temple Seva Trust (Regd.)</strong>. By accessing or using our website, initiating online donations, registering for sevas, or receiving automated communications (SMS/Email), you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-orange-700">
                            <CheckCircle className="w-5 h-5" />
                            2. Online Sevas, Poojas & Voluntary Donations
                        </h2>
                        <p>
                            All contributions made through this portal are voluntary religious donations intended for the noble purposes of:
                        </p>
                        <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-600">
                            <li><strong>Annadana Seva:</strong> Daily mass feeding and prasadam distribution for visiting devotees.</li>
                            <li><strong>Daily Poojas & Utsavas:</strong> Morning/evening deeparadhana, archana, and annual festival ceremonies.</li>
                            <li><strong>Temple Maintenance & Goshala:</strong> Temple premises upkeep, cow protection, and infrastructure development.</li>
                        </ul>
                        <p>
                            Each online donation generates an authentic digital receipt with a unique transaction reference identifier.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-orange-700">
                            <Shield className="w-5 h-5" />
                            3. Payment Gateway & Security
                        </h2>
                        <p>
                            Online payments are securely processed through <strong>Razorpay Payment Gateway</strong> using 256-bit SSL encryption. The temple trust does not store or access your credit/debit card numbers, CVV, or banking passwords. Devotees are responsible for ensuring that they provide accurate bank account/UPI credentials when making a transaction.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-orange-700">
                            <AlertCircle className="w-5 h-5" />
                            4. Code of Conduct & Temple Traditions
                        </h2>
                        <p>
                            Devotees using this portal agree to provide truthful and accurate information during registration or donation. Misuse of the platform, fraudulent transaction attempts, or unauthorized access is strictly prohibited under Indian law (Information Technology Act, 2000).
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-orange-700">
                            <FileText className="w-5 h-5" />
                            5. Modifications to the Terms
                        </h2>
                        <p>
                            The Trust reserves the right to modify these terms and conditions at any time to comply with legal, regulatory, or administrative guidelines. Continued use of the platform constitutes acceptance of updated terms.
                        </p>
                    </section>

                    <section className="pt-6 border-t border-gray-100 space-y-2 text-xs sm:text-sm text-gray-500">
                        <p><strong>Registered Trust Address:</strong> Sri Ballamanja Temple Seva Trust, Ballamanja, Belthangady Taluk, Dakshina Kannada, Karnataka - 574214, India.</p>
                        <p><strong>Official Contact:</strong> info@ballamanjatemple.org | +91 94800 00000</p>
                    </section>
                </div>
            </div>
        </Layout>
    );
}
