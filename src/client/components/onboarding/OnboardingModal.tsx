import { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { sessionApi } from '../../utils/api';
import { t } from '../../utils/translations';
import { Globe, User, Calendar, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const { language, setLanguage, setSession, setAvailableModels, setSelectedModel } = useAppStore();
  
  const [step, setStep] = useState<'language' | 'details'>('language');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Load available models on mount
  useEffect(() => {
    fetch('/api/config/models')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          setAvailableModels(data.data);
          if (data.data.length > 0) {
            setSelectedModel(data.data[0].id);
          }
        }
      })
      .catch(console.error);
  }, [setAvailableModels, setSelectedModel]);
  
  const handleLanguageSelect = (lang: 'en' | 'de') => {
    setLanguage(lang);
    setStep('details');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError(t('required', language));
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await sessionApi.create({
        userName: name.trim(),
        userAge: age ? parseInt(age, 10) : undefined,
        language
      });
      
      if (response.success && response.data) {
        setSession(response.data);
        onComplete();
      } else {
        setError(response.error || 'Failed to create session');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 modal-backdrop p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            {step === 'language' ? t('welcome', language) : t('welcome', language)}
          </h1>
          <p className="text-white/80 text-sm">
            {t('welcomeDescription', language)}
          </p>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {step === 'language' ? (
            <div className="space-y-4">
              <p className="text-center text-gray-600 mb-6">
                {t('languageLabel', 'en')} / {t('languageLabel', 'de')}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleLanguageSelect('en')}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-100 hover:border-primary-500 hover:bg-primary-50 transition-all group"
                >
                  <Globe className="w-8 h-8 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  <span className="font-medium text-gray-700 group-hover:text-primary-700">
                    {t('english', 'en')}
                  </span>
                </button>
                
                <button
                  onClick={() => handleLanguageSelect('de')}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-100 hover:border-primary-500 hover:bg-primary-50 transition-all group"
                >
                  <Globe className="w-8 h-8 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  <span className="font-medium text-gray-700 group-hover:text-primary-700">
                    {t('german', 'de')}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  {t('nameLabel', language)}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('namePlaceholder', language)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  autoFocus
                />
              </div>
              
              {/* Age Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  {t('ageLabel', language)}
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder={t('agePlaceholder', language)}
                  min="1"
                  max="120"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                />
              </div>
              
              {/* Error */}
              {error && (
                <div className="text-red-500 text-sm text-center">
                  {error}
                </div>
              )}
              
              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('language')}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {t('back', language)}
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="flex-[2] px-4 py-3 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full spinner" />
                  ) : (
                    <>
                      {t('startButton', language)}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
