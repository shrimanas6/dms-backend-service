import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Send,
    CheckCircle,
    Building2,
    ExternalLink
} from 'lucide-react';

export function Contact() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Visual confirmation for devotee
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setSubmitted(false), 6000);
    };

    return (
        <Layout>
            <div className="space-y-8 max-w-6xl mx-auto pb-12">
                {/* Page Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                        {t('contactUsTitle')}
                    </h1>
                    <p className="text-gray-600 max-w-xl mx-auto text-sm sm:text-base">
                        {t('contactUsSubtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Official Contact & Trust Info Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Trust Details */}
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-100 space-y-4">
                            <div className="flex items-center gap-3 text-orange-600">
                                <Building2 className="w-6 h-6 shrink-0" />
                                <h3 className="font-bold text-gray-900 text-lg">{t('registeredOffice')}</h3>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 text-sm">{t('templeTrustName')}</p>
                                <p className="text-gray-600 text-xs mt-1 leading-relaxed">{t('templeAddress')}</p>
                            </div>
                            <a
                                href="https://maps.google.com/?q=Ballamanja+Temple+Belthangady"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 transition"
                            >
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{t('viewOnMap')}</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>

                        {/* Phone & Email */}
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-100 space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">{t('officialPhone')}</p>
                                        <p className="font-semibold text-gray-800 text-sm mt-0.5">{t('primaryPhone')}</p>
                                        <p className="text-xs text-gray-600">{t('secondaryPhone')}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
                                    <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">{t('officialEmail')}</p>
                                        <p className="font-semibold text-gray-800 text-sm mt-0.5">{t('primaryEmail')}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
                                    <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">{t('officeHours')}</p>
                                        <p className="font-semibold text-gray-800 text-sm mt-0.5">{t('officeHoursTime')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact / Inquiry Form */}
                    <div className="lg:col-span-2 bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-orange-100">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">{t('sendInquiry')}</h2>
                            <p className="text-gray-600 text-sm mt-1">{t('contactUsSubtitle')}</p>
                        </div>

                        {submitted && (
                            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 flex items-center gap-3 animate-in fade-in duration-300">
                                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                                <span className="text-sm font-medium">{t('inquirySent')}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {t('nameLabel')} *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Srikanth Sharma"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition text-sm text-gray-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        {t('phoneLabel')} *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="9876543210"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition text-sm text-gray-800"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    {t('emailLabel')}
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="devotee@example.com"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition text-sm text-gray-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    {t('messageLabel')} *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Inquiry regarding special pooja dates, seva offerings, or temple visit..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition text-sm text-gray-800 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold text-sm shadow-md transition-all hover:scale-105 active:scale-95"
                            >
                                <Send className="w-4 h-4" />
                                <span>{t('sendButton')}</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
