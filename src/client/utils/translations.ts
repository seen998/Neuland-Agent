import { Language } from '../../shared/types';

type TranslationKey = 
  | 'welcome'
  | 'welcomeDescription'
  | 'nameLabel'
  | 'namePlaceholder'
  | 'ageLabel'
  | 'agePlaceholder'
  | 'languageLabel'
  | 'english'
  | 'german'
  | 'startButton'
  | 'required'
  | 'space'
  | 'settings'
  | 'unlockTab'
  | 'password'
  | 'passwordPlaceholder'
  | 'unlockButton'
  | 'cancel'
  | 'invalidPassword'
  | 'typeMessage'
  | 'send'
  | 'selectModel'
  | 'comparisonMode'
  | 'loading'
  | 'error'
  | 'retry'
  | 'back';

type Translations = Record<Language, Record<TranslationKey, string>>;

export const translations: Translations = {
  en: {
    welcome: 'Welcome',
    welcomeDescription: 'I\'m here to explore your personal vision with you.',
    nameLabel: 'What is your name?',
    namePlaceholder: 'Enter your name',
    ageLabel: 'And your age?',
    agePlaceholder: 'Enter your age (optional)',
    languageLabel: 'Select your language',
    english: 'English',
    german: 'Deutsch',
    startButton: 'Start Journey',
    required: 'Required',
    space: 'Space',
    settings: 'Settings',
    unlockTab: 'Unlock Tab',
    password: 'Password',
    passwordPlaceholder: 'Enter password',
    unlockButton: 'Unlock',
    cancel: 'Cancel',
    invalidPassword: 'Invalid password',
    typeMessage: 'Type your message...',
    send: 'Send',
    selectModel: 'Select Model',
    comparisonMode: 'Comparison Mode',
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    back: 'Back'
  },
  de: {
    welcome: 'Willkommen',
    welcomeDescription: 'Ich bin hier, um deine persönliche Vision mit dir zu erkunden.',
    nameLabel: 'Wie heißt du?',
    namePlaceholder: 'Gib deinen Namen ein',
    ageLabel: 'Und wie alt bist du?',
    agePlaceholder: 'Gib dein Alter ein (optional)',
    languageLabel: 'Wähle deine Sprache',
    english: 'English',
    german: 'Deutsch',
    startButton: 'Reise beginnen',
    required: 'Erforderlich',
    space: 'Raum',
    settings: 'Einstellungen',
    unlockTab: 'Tab freischalten',
    password: 'Passwort',
    passwordPlaceholder: 'Passwort eingeben',
    unlockButton: 'Freischalten',
    cancel: 'Abbrechen',
    invalidPassword: 'Ungültiges Passwort',
    typeMessage: 'Schreibe deine Nachricht...',
    send: 'Senden',
    selectModel: 'Modell auswählen',
    comparisonMode: 'Vergleichsmodus',
    loading: 'Laden...',
    error: 'Fehler',
    retry: 'Wiederholen',
    back: 'Zurück'
  }
};

export function t(key: TranslationKey, lang: Language): string {
  return translations[lang][key];
}
