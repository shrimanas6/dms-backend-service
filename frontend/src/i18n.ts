import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const resources = {
    en: {
        translation: {
            // Layout
            dashboard: 'Dashboard',
            about: 'About',
            history: 'History',
            settings: 'Settings',
            templeName: 'Sri Ballamanja Temple',
            signOut: 'Sign Out',

            // Dashboard
            welcome: 'Welcome',
            greeting: 'May your day be filled with peace and blessings',
            totalDonations: 'Total Donations',
            lastDonation: 'Last Donation',
            noDonationsYet: 'No donations yet',
            makeDonation: 'Make a Donation',
            donateNow: 'Donate Now',
            recentDonations: 'Recent Donations',
            noDonationsMessage: 'No donations yet. Make your first donation!',

            // Donation Modal
            chooseAmount: 'Choose Amount & Pay',
            processingPayment: 'Processing Payment',
            donationSuccessful: 'Donation Successful',
            donationAmount: 'Donation Amount',
            payUsing: 'Pay using',
            payUsingUpi: 'All UPI Apps / QR Code',
            securedBy: 'SECURED BY RAZORPAY',
            qrNote: 'Note: For QR Code, select "UPI" in the payment window',
            testModeNote: 'Please use Domestic Cards or UPI for testing. International cards are currently restricted.',
            contacting: 'Contacting',
            securingPayment: 'Securing your payment of Rs.',
            donationConfirmed: 'Donation Confirmed!',
            contributionMessage: 'Your contribution of',
            processedSuccessfully: 'has been processed successfully via',
            receiptId: 'Receipt ID',
            done: 'Done',
            enterValidAmount: 'Please enter a valid amount first',
            paymentInitFailed: 'Payment initialization failed',
            donationFailed: 'Donation failed. Please try again.',
            thankYou: 'Thank you for your donation!',
            verificationFailed: 'Failed to verify donation. Please contact support.',
            paymentCancelled: 'Payment cancelled',
            proceedToDonate: 'Proceed to Donate',
            selectPaymentMethod: 'Select Payment Option',
            payWith: 'Pay with',
            amountOutOfRange: 'Amount must be between ₹1 and ₹5,00,000',

            // Settings
            notificationPreferences: 'Notification Preferences',
            monthlyReminders: 'Monthly Donation Reminders',
            monthlyRemindersDesc: 'Receive reminders to make your monthly donation',
            smsReminders: 'SMS Reminders',
            smsRemindersDesc: 'Receive reminders via SMS on your mobile',
            phoneNumber: 'Phone Number for Reminders',
            enterPhone: 'Enter your 10-digit mobile number',
            sendTestEmail: 'Send Test Email',
            sendTestSms: 'Send Test SMS',
            sending: 'Sending...',
            note: 'Note',
            noteDesc: 'When enabled, you will receive a reminder notification one month after your last donation. This helps you maintain regular contributions to the temple.',
            saveChanges: 'Save Changes',
            settingsSaved: 'Settings saved successfully!',
            settingsSaveFailed: 'Failed to save settings',
            language: 'Language',
            languageDesc: 'Select your preferred language',
            testSentMock: 'Test {{type}} sent in MOCK mode! Check the server console for details.',
            testSentSuccess: 'Test {{type}} sent successfully! Check your {{dest}}.',
            testFailed: 'Failed to send test {{type}}',

            // History
            donationHistory: 'Donation History',
            totalContributed: 'Total Contributed',
            loadingHistory: 'Loading your donation history...',
            dateTime: 'Date & Time',
            transactionId: 'Transaction ID',
            amount: 'Amount',
            noDonationsHistoryTitle: 'No Donations Yet',
            noDonationsHistoryMsg: 'You haven\'t made any donations yet. Start your journey of giving today!',

            // About Page
            aboutTemple: 'About Our Temple',
            templeSubtitle: 'A sacred place of devotion and spirituality',
            templeHistory: 'Temple History',
            templeHistoryText: 'Sri Ballamanja Temple has been a beacon of spiritual light for generations. Built with devotion and maintained with love, this sacred place welcomes devotees from all walks of life. The temple stands as a testament to faith, tradition, and community service.',
            deity: 'Deity',
            deityText: 'The temple is dedicated to Lord Shiva and houses beautiful idols that inspire devotion and peace. Daily pujas and special ceremonies are performed with utmost devotion, creating a divine atmosphere for all visitors.',
            timings: 'Temple Timings',
            morningDarshan: 'Morning Darshan',
            eveningDarshan: 'Evening Darshan',
            specialPuja: 'Special Puja',
            onRequest: 'On Request',
            location: 'Location',
            locationText: 'The temple is located in a serene environment, easily accessible from the main city. Visit us to experience peace and divine blessings.',
            viewOnMap: 'View on Map',
            templeFeatures: 'Temple Features',
            dailyPuja: 'Daily Puja',
            dailyPujaDesc: 'Regular morning and evening prayers',
            festivals: 'Festivals',
            festivalsDesc: 'Grand celebrations throughout the year',
            prasadam: 'Prasadam',
            prasadamDesc: 'Sacred food offered to devotees',
        }
    },
    kn: {
        translation: {
            // Layout
            dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
            about: 'ನಮ್ಮ ಬಗ್ಗೆ',
            history: 'ಇತಿಹಾಸ',
            settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
            templeName: 'ಶ್ರೀ ಬಲ್ಲಮಂಜ ದೇವಸ್ಥಾನ',
            signOut: 'ನಿರ್ಗಮಿಸಿ',

            // Dashboard
            welcome: 'ಸ್ವಾಗತ',
            greeting: 'ನಿಮ್ಮ ದಿನ ಶಾಂತಿ ಮತ್ತು ಆಶೀರ್ವಾದಗಳಿಂದ ತುಂಬಿರಲಿ',
            totalDonations: 'ಒಟ್ಟು ದೇಣಿಗೆಗಳು',
            lastDonation: 'ಕೊನೆಯ ದೇಣಿಗೆ',
            noDonationsYet: 'ಇನ್ನೂ ಯಾವುದೇ ದೇಣಿಗೆ ಇಲ್ಲ',
            makeDonation: 'ದೇಣಿಗೆ ನೀಡಿ',
            donateNow: 'ಈಗಲೇ ದೇಣಿಗೆ ನೀಡಿ',
            recentDonations: 'ಇತ್ತೀಚಿನ ದೇಣಿಗೆಗಳು',
            noDonationsMessage: 'ಇನ್ನೂ ಯಾವುದೇ ದೇಣಿಗೆ ಇಲ್ಲ. ನಿಮ್ಮ ಮೊದಲ ದೇಣಿಗೆಯನ್ನು ನೀಡಿ!',

            // Donation Modal
            chooseAmount: 'ಮೊತ್ತವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಪಾವತಿಸಿ',
            processingPayment: 'ಪಾವತಿಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ',
            donationSuccessful: 'ದೇಣಿಗೆ ಯಶಸ್ವಿಯಾಗಿದೆ',
            donationAmount: 'ದೇಣಿಗೆ ಮೊತ್ತ',
            payUsing: 'ಇದರ ಮೂಲಕ ಪಾವತಿಸಿ',
            payUsingUpi: 'ಎಲ್ಲಾ UPI ಅಪ್ಲಿಕೇಶನ್‌ಗಳು / QR ಕೋಡ್',
            securedBy: 'RAZORPAY ಮೂಲಕ ಸುರಕ್ಷಿತವಾಗಿದೆ',
            qrNote: 'ಗಮನಿಸಿ: QR ಕೋಡ್‌ಗಾಗಿ, ಪಾವತಿ ವಿಂಡೋದಲ್ಲಿ "UPI" ಆಯ್ಕೆಮಾಡಿ',
            testModeNote: 'ಪರೀಕ್ಷೆಗಾಗಿ ದಯವಿಟ್ಟು ದೇಶೀಯ ಕಾರ್ಡ್‌ಗಳು ಅಥವಾ UPI ಬಳಸಿ.',
            contacting: 'ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ',
            securingPayment: 'ನಿಮ್ಮ ಪಾವತಿಯನ್ನು ಸುರಕ್ಷಿತಗೊಳಿಸಲಾಗುತ್ತಿದೆ ರೂ.',
            donationConfirmed: 'ದೇಣಿಗೆ ದೃಢೀಕರಿಸಲಾಗಿದೆ!',
            contributionMessage: 'ನಿಮ್ಮ ದೇಣಿಗೆ',
            processedSuccessfully: 'ಯಶಸ್ವಿಯಾಗಿ ಪಾವತಿಯಾಗಿದೆ',
            receiptId: 'ರಶೀದಿ ID',
            done: 'ಮುಗಿದಿದೆ',
            enterValidAmount: 'ದಯವಿಟ್ಟು ಮೊದಲು ಮಾನ್ಯವಾದ ಮೊತ್ತವನ್ನು ನಮೂದಿಸಿ',
            paymentInitFailed: 'ಪಾವತಿ ಪ್ರಾರಂಭ ವಿಫಲವಾಗಿದೆ',
            donationFailed: 'ದೇಣಿಗೆ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
            thankYou: 'ನಿಮ್ಮ ದೇಣಿಗೆಗಾಗಿ ಧನ್ಯವಾದಗಳು!',
            verificationFailed: 'ದೇಣಿಗೆಯನ್ನು ಪರಿಶೀಲಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ.',
            paymentCancelled: 'ಪಾವತಿ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ',
            proceedToDonate: 'ದೇಣಿಗೆ ನೀಡಲು ಮುಂದುವರಿಯಿರಿ',
            selectPaymentMethod: 'ಪಾವತಿ ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ',
            payWith: 'ಪಾವತಿಸಿ',
            amountOutOfRange: 'ಮೊತ್ತವು ₹1 ರಿಂದ ₹5,00,000 ರ ನಡುವೆ ಇರಬೇಕು',

            // Settings
            notificationPreferences: 'ಅಧಿಸೂಚನೆ ಆದ್ಯತೆಗಳು',
            monthlyReminders: 'ಮಾಸಿಕ ದೇಣಿಗೆ ಜ್ಞಾಪನೆಗಳು',
            monthlyRemindersDesc: 'ನಿಮ್ಮ ಮಾಸಿಕ ದೇಣಿಗೆ ನೀಡಲು ಜ್ಞಾಪನೆಗಳನ್ನು ಸ್ವೀಕರಿಸಿ',
            smsReminders: 'SMS ಜ್ಞಾಪನೆಗಳು',
            smsRemindersDesc: 'ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಲ್ಲಿ SMS ಮೂಲಕ ಜ್ಞಾಪನೆಗಳನ್ನು ಸ್ವೀಕರಿಸಿ',
            phoneNumber: 'ಜ್ಞಾಪನೆಗಳಿಗಾಗಿ ಫೋನ್ ಸಂಖ್ಯೆ',
            enterPhone: 'ನಿಮ್ಮ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ',
            sendTestEmail: 'ಪರೀಕ್ಷಾ ಇಮೇಲ್ ಕಳುಹಿಸಿ',
            sendTestSms: 'ಪರೀಕ್ಷಾ SMS ಕಳುಹಿಸಿ',
            sending: 'ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...',
            note: 'ಸೂಚನೆ',
            noteDesc: 'ಸಕ್ರಿಯಗೊಳಿಸಿದಾಗ, ನಿಮ್ಮ ಕಳೆದ ದೇಣಿಗೆಯ ಒಂದು ತಿಂಗಳ ನಂತರ ನೀವು ಜ್ಞಾಪನೆ ಅಧಿಸೂಚನೆಯನ್ನು ಪಡೆಯುತ್ತೀರಿ. ಇದು ದೇವಸ್ಥಾನಕ್ಕೆ ನಿಯಮಿತ ಕೊಡುಗೆಗಳನ್ನು ನೀಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
            saveChanges: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ',
            settingsSaved: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!',
            settingsSaveFailed: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ',
            language: 'ಭಾಷೆ',
            languageDesc: 'ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
            testSentMock: 'ಪರೀಕ್ಷಾ {{type}} MOCK ಮೋಡ್‌ನಲ್ಲಿ ಕಳುಹಿಸಲಾಗಿದೆ! ಸರ್ವರ್ ಕನ್ಸೋಲ್ ಪರಿಶೀಲಿಸಿ.',
            testSentSuccess: 'ಪರೀಕ್ಷಾ {{type}} ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ! ನಿಮ್ಮ {{dest}} ಪರಿಶೀಲಿಸಿ.',
            testFailed: '{{type}} ಕಳುಹಿಸಲು ವಿಫಲವಾಗಿದೆ',

            // History
            donationHistory: 'ದೇಣಿಗೆ ಇತಿಹಾಸ',
            totalContributed: 'ಒಟ್ಟು ಕೊಡುಗೆ',
            loadingHistory: 'ನಿಮ್ಮ ದೇಣಿಗೆ ಇತಿಹಾಸವನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
            dateTime: 'ದಿನಾಂಕ ಮತ್ತು ಸಮಯ',
            transactionId: 'ವಹಿವಾಟು ID',
            amount: 'ಮೊತ್ತ',
            noDonationsHistoryTitle: 'ಇನ್ನೂ ಯಾವುದೇ ದೇಣಿಗೆಗಳಿಲ್ಲ',
            noDonationsHistoryMsg: 'ನೀವು ಇನ್ನೂ ಯಾವುದೇ ದೇಣಿಗೆ ನೀಡಿಲ್ಲ. ಇಂದೇ ನಿಮ್ಮ ಕೊಡುಗೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ!',

            // About Page
            aboutTemple: 'ನಮ್ಮ ದೇವಸ್ಥಾನದ ಬಗ್ಗೆ',
            templeSubtitle: 'ಭಕ್ತಿ ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕತೆಯ ಪವಿತ್ರ ಸ್ಥಳ',
            templeHistory: 'ದೇವಸ್ಥಾನದ ಇತಿಹಾಸ',
            templeHistoryText: 'ಶ್ರೀ ಬಲ್ಲಮಂಜ ದೇವಸ್ಥಾನವು ತಲೆಮಾರುಗಳಿಂದ ಆಧ್ಯಾತ್ಮಿಕ ಬೆಳಕಿನ ದೀಪಸ್ತಂಭವಾಗಿದೆ. ಭಕ್ತಿಯಿಂದ ನಿರ್ಮಿಸಲಾಗಿದೆ ಮತ್ತು ಪ್ರೀತಿಯಿಂದ ನಿರ್ವಹಿಸಲಾಗುತ್ತಿದೆ, ಈ ಪವಿತ್ರ ಸ್ಥಳವು ಎಲ್ಲಾ ವರ್ಗದ ಭಕ್ತರನ್ನು ಸ್ವಾಗತಿಸುತ್ತದೆ.',
            deity: 'ದೇವತೆ',
            deityText: 'ದೇವಸ್ಥಾನವು ಶಿವನಿಗೆ ಸಮರ್ಪಿತವಾಗಿದೆ ಮತ್ತು ಭಕ್ತಿ ಮತ್ತು ಶಾಂತಿಯನ್ನು ಪ್ರೇರೇಪಿಸುವ ಸುಂದರ ವಿಗ್ರಹಗಳನ್ನು ಹೊಂದಿದೆ. ದೈನಂದಿನ ಪೂಜೆಗಳು ಮತ್ತು ವಿಶೇಷ ಸಮಾರಂಭಗಳನ್ನು ಅತ್ಯಂತ ಭಕ್ತಿಯಿಂದ ನಡೆಸಲಾಗುತ್ತದೆ.',
            timings: 'ದೇವಸ್ಥಾನದ ಸಮಯ',
            morningDarshan: 'ಬೆಳಗಿನ ದರ್ಶನ',
            eveningDarshan: 'ಸಂಜೆಯ ದರ್ಶನ',
            specialPuja: 'ವಿಶೇಷ ಪೂಜೆ',
            onRequest: 'ಕೋರಿಕೆಯ ಮೇರೆಗೆ',
            location: 'ಸ್ಥಳ',
            locationText: 'ದೇವಸ್ಥಾನವು ಶಾಂತ ವಾತಾವರಣದಲ್ಲಿದೆ, ಮುಖ್ಯ ನಗರದಿಂದ ಸುಲಭವಾಗಿ ತಲುಪಬಹುದು. ಶಾಂತಿ ಮತ್ತು ದೈವಿಕ ಆಶೀರ್ವಾದವನ್ನು ಅನುಭವಿಸಲು ನಮ್ಮನ್ನು ಭೇಟಿ ಮಾಡಿ.',
            viewOnMap: 'ನಕ್ಷೆಯಲ್ಲಿ ನೋಡಿ',
            templeFeatures: 'ದೇವಸ್ಥಾನದ ವೈಶಿಷ್ಟ್ಯಗಳು',
            dailyPuja: 'ದೈನಂದಿನ ಪೂಜೆ',
            dailyPujaDesc: 'ನಿಯಮಿತ ಬೆಳಗಿನ ಮತ್ತು ಸಂಜೆಯ ಪ್ರಾರ್ಥನೆಗಳು',
            festivals: 'ಹಬ್ಬಗಳು',
            festivalsDesc: 'ವರ್ಷವಿಡೀ ಭವ್ಯ ಆಚರಣೆಗಳು',
            prasadam: 'ಪ್ರಸಾದ',
            prasadamDesc: 'ಭಕ್ತರಿಗೆ ನೀಡುವ ಪವಿತ್ರ ಆಹಾರ',
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
