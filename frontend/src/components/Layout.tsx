import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LogOut,
    LogIn,
    Home,
    Settings,
    History,
    Menu,
    X,
    Info,
    Phone,
    UserPlus,
    ShieldCheck,
    Heart,
    Flame
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export function Layout({ children }: { children: React.ReactNode }) {
    const { user, profile, signOut } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const toggleLanguage = () => {
        const nextLang = i18n.language === 'kn' ? 'en' : 'kn';
        i18n.changeLanguage(nextLang);
    };

    const isActive = (path: string) => location.pathname === path;

    // Navigation links based on auth status
    const authenticatedLinks = [
        { to: '/dashboard', label: t('dashboard'), icon: Home },
        { to: '/about', label: t('about'), icon: Info },
        { to: '/history', label: t('history'), icon: History },
        { to: '/settings', label: t('settings'), icon: Settings },
    ];

    const publicLinks = [
        { to: '/', label: t('home'), icon: Home },
        { to: '/about', label: t('about'), icon: Info },
        { to: '/contact', label: t('contact'), icon: Phone },
    ];

    const navLinks = user ? authenticatedLinks : publicLinks;

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 text-gray-800">
            {/* Header Navigation */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 relative">

                        {/* Mobile Menu Button - Left */}
                        <div className="flex items-center lg:hidden z-10">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-orange-50 transition-colors"
                                aria-label="Toggle menu"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>
                        </div>

                        {/* Logo - Center Mobile / Left Desktop */}
                        <div className="flex items-center lg:space-x-8 absolute left-1/2 -translate-x-1/2 lg:static lg:transform-none">
                            <Link
                                to={user ? '/dashboard' : '/'}
                                className="group flex items-center space-x-2 shrink-0"
                            >
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                                    <Flame className="w-5 h-5 text-yellow-100" />
                                </div>
                                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent group-hover:brightness-110 transition whitespace-nowrap">
                                    {t('templeName')}
                                </span>
                            </Link>

                            {/* Desktop Navigation Links */}
                            <div className="hidden lg:flex items-center gap-1.5">
                                {navLinks.map(({ to, label, icon: Icon }) => (
                                    <Link
                                        key={to}
                                        to={to}
                                        className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive(to)
                                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                                                : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Right Section - Language Toggle & Auth Actions */}
                        <div className="flex items-center gap-3 z-10">
                            {/* Language Switcher */}
                            <button
                                onClick={toggleLanguage}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-100/80 hover:bg-orange-200/80 text-orange-800 transition"
                                title="Toggle Language (EN / KN)"
                            >
                                {i18n.language === 'kn' ? 'EN' : 'ಕನ್ನಡ'}
                            </button>

                            {user ? (
                                /* Authenticated User State */
                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-bold text-gray-800 truncate max-w-[130px]">
                                            {profile?.name || user.email?.split('@')[0]}
                                        </p>
                                        <p className="text-[10px] text-gray-500 truncate max-w-[130px]">
                                            {user.email}
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleSignOut}
                                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 transition"
                                        title={t('signOut')}
                                    >
                                        <LogOut className="w-4 h-4 group-hover:rotate-6 transition-transform" />
                                        <span className="hidden md:inline">{t('signOut')}</span>
                                    </button>
                                </div>
                            ) : (
                                /* Unauthenticated Visitor State */
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/login"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-orange-700 hover:bg-orange-50 transition"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        <span>{t('signIn')}</span>
                                    </Link>

                                    <Link
                                        to="/register"
                                        className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm hover:from-orange-600 hover:to-amber-600 transition"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span>{t('register')}</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-lg shadow-xl animate-in slide-in-from-top-2 duration-200">
                        <div className="px-4 pt-3 pb-6 space-y-1">
                            {navLinks.map(({ to, label, icon: Icon }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all
                    ${isActive(to)
                                            ? 'bg-orange-50 text-orange-600 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive(to) ? 'text-orange-500' : 'text-gray-400'}`} />
                                    {label}
                                </Link>
                            ))}

                            {!user && (
                                <div className="pt-4 border-t border-gray-100 space-y-2">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-orange-200 text-orange-700 hover:bg-orange-50"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        <span>{t('signIn')}</span>
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span>{t('register')}</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Universal Footer */}
            <footer className="mt-auto bg-gray-900 text-gray-300 border-t border-amber-900/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Col 1: Temple Info */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-white">
                                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                                    🕉️
                                </div>
                                <span className="font-bold text-base text-amber-400">
                                    {t('templeName')}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                {t('templeSubtitle')}
                            </p>
                            <p className="text-xs text-amber-500/80 font-medium">
                                {t('trustRegInfo')}
                            </p>
                        </div>

                        {/* Col 2: Quick Links */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                                {t('quickLinks')}
                            </h4>
                            <ul className="space-y-2 text-xs">
                                <li>
                                    <Link to="/" className="text-gray-400 hover:text-amber-400 transition">
                                        {t('home')}
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/about" className="text-gray-400 hover:text-amber-400 transition">
                                        {t('about')}
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/contact" className="text-gray-400 hover:text-amber-400 transition">
                                        {t('contact')}
                                    </Link>
                                </li>
                                <li>
                                    <Link to={user ? '/dashboard' : '/login'} className="text-gray-400 hover:text-amber-400 transition">
                                        {user ? t('dashboard') : t('signIn')}
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 3: Legal & Razorpay Compliance */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                                {t('legalPolicies')}
                            </h4>
                            <ul className="space-y-2 text-xs">
                                <li>
                                    <Link to="/terms" className="text-gray-400 hover:text-amber-400 transition">
                                        {t('termsAndConditions')}
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/privacy" className="text-gray-400 hover:text-amber-400 transition">
                                        {t('privacyPolicy')}
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/refund-policy" className="text-gray-400 hover:text-amber-400 transition">
                                        {t('refundPolicy')}
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 4: Address & Support */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                                {t('contact')}
                            </h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                {t('templeAddress')}
                            </p>
                            <p className="text-xs text-gray-400">
                                <strong>Phone:</strong> {t('primaryPhone')}
                            </p>
                            <p className="text-xs text-gray-400">
                                <strong>Email:</strong> {t('primaryEmail')}
                            </p>
                        </div>
                    </div>

                    {/* Bottom Sub-footer */}
                    <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                        <p>© {new Date().getFullYear()} {t('templeTrustName')}. {t('allRightsReserved')}</p>
                        <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                            <ShieldCheck className="w-4 h-4 text-green-500" />
                            <span>{t('securedPaymentText')}</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
