import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import {
    Heart,
    Clock,
    Utensils,
    Sparkles,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    Calendar,
    Flame
} from 'lucide-react';

export function Home() {
    const { t } = useTranslation();
    const { user } = useAuth();

    return (
        <Layout>
            <div className="space-y-12 pb-12">
                {/* Hero Section */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-amber-700 via-orange-600 to-amber-900 text-white">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                    <div className="relative max-w-4xl mx-auto px-6 py-16 sm:py-24 text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-orange-200 text-sm font-medium">
                            <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
                            <span>{t('templeName')}</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                            {t('heroTitle')}
                        </h1>

                        <p className="text-lg sm:text-xl text-orange-100 max-w-2xl mx-auto leading-relaxed">
                            {t('heroSubtitle')}
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                            <Link
                                to={user ? '/dashboard' : '/login'}
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-bold shadow-lg hover:from-amber-300 hover:to-yellow-300 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Heart className="w-5 h-5 text-amber-900 fill-amber-900" />
                                <span>{user ? t('dashboard') : t('donateNow')}</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>

                            <Link
                                to="/about"
                                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold transition-all hover:scale-105"
                            >
                                <span>{t('learnMore')}</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Darshan & Pooja Schedule Cards */}
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                            {t('darshanTimingsTitle')}
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base mt-1">
                            {t('templeSubtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Morning Darshan */}
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-100 hover:shadow-xl transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 mb-4">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg mb-1">{t('morningDarshan')}</h3>
                            <p className="text-orange-600 font-semibold text-lg">{t('morningDarshanTime')}</p>
                            <p className="text-gray-500 text-xs mt-2">Daily morning prayers and archana.</p>
                        </div>

                        {/* Evening Darshan */}
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-100 hover:shadow-xl transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg mb-1">{t('eveningDarshan')}</h3>
                            <p className="text-amber-600 font-semibold text-lg">{t('eveningDarshanTime')}</p>
                            <p className="text-gray-500 text-xs mt-2">Evening Deeparadhana and Mangala Aarti.</p>
                        </div>

                        {/* Maha Pooja */}
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-100 hover:shadow-xl transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 mb-4">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg mb-1">{t('specialPuja')}</h3>
                            <p className="text-red-600 font-semibold text-lg">{t('mahaPoojaTime')}</p>
                            <p className="text-gray-500 text-xs mt-2">Mid-day and night Mahapooja seva.</p>
                        </div>

                        {/* Annadana */}
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-100 hover:shadow-xl transition-all duration-300">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 mb-4">
                                <Utensils className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg mb-1">{t('annadanaPrasadam')}</h3>
                            <p className="text-green-600 font-semibold text-lg">12:30 PM - 2:30 PM</p>
                            <p className="text-gray-500 text-xs mt-2">{t('annadanaPrasadamDesc')}</p>
                        </div>
                    </div>
                </div>

                {/* Seva & Offerings Highlights */}
                <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-orange-100 space-y-8">
                    <div className="max-w-2xl">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {t('templeHighlights')}
                        </h2>
                        <p className="text-gray-600 mt-2">
                            {t('supportTheTempleDesc')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="rounded-2xl p-6 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-md">
                                <Utensils className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">{t('annadanaSeva')}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{t('annadanaSevaDesc')}</p>
                        </div>

                        <div className="rounded-2xl p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-md">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">{t('poojaSeva')}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{t('poojaSevaDesc')}</p>
                        </div>

                        <div className="rounded-2xl p-6 bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-md">
                                <Heart className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg">{t('templeRenovation')}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{t('templeRenovationDesc')}</p>
                        </div>
                    </div>

                    {/* Trust Banner */}
                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-orange-50/50 rounded-2xl p-6">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-8 h-8 text-green-600 shrink-0" />
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                                    {t('quickDonateCta')}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-600">
                                    {t('quickDonateCtaDesc')}
                                </p>
                            </div>
                        </div>

                        <Link
                            to={user ? '/dashboard' : '/login'}
                            className="shrink-0 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm shadow-md transition"
                        >
                            {user ? t('dashboard') : t('signIn')}
                        </Link>
                    </div>
                </div>

                {/* Features & Devotion Assurance */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                    <div className="p-6 rounded-2xl bg-white/70 border border-orange-100">
                        <CheckCircle2 className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <h4 className="font-bold text-gray-800 mb-1">{t('templeTrustName')}</h4>
                        <p className="text-xs text-gray-500">{t('trustRegInfo')}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/70 border border-orange-100">
                        <ShieldCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h4 className="font-bold text-gray-800 mb-1">{t('securedBy')}</h4>
                        <p className="text-xs text-gray-500">256-Bit SSL Encrypted & Direct Settlement</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/70 border border-orange-100">
                        <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <h4 className="font-bold text-gray-800 mb-1">{t('dailyPuja')}</h4>
                        <p className="text-xs text-gray-500">{t('templeSubtitle')}</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
