import { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { tabApi } from '../../utils/api';
import { t } from '../../utils/translations';
import { PasswordModal } from './PasswordModal';
import {
  User,
  Settings,
  Lock,
  Sparkles,
  Users,
  Globe
} from 'lucide-react';

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const {
    userName,
    language,
    currentTab,
    unlockedTabs,
    sessionId,
    tabs,
    setTabs,
    setCurrentTab,
    setLanguage
  } = useAppStore();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedTabId, setSelectedTabId] = useState<string>('');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // Load tabs
  useEffect(() => {
    if (sessionId) {
      tabApi.getAvailable(sessionId)
        .then(response => {
          if (response.success && response.data) {
            setTabs(response.data);
          }
        })
        .catch(console.error);
    }
  }, [sessionId, setTabs, unlockedTabs]);

  const handleTabClick = (tabId: string, isLocked: boolean) => {
    if (isLocked) {
      setSelectedTabId(tabId);
      setIsPasswordModalOpen(true);
    } else {
      setCurrentTab(tabId);
      onNavigate?.();
    }
  };

  const handleLanguageChange = (lang: 'en' | 'de') => {
    setLanguage(lang);
    setShowLanguageMenu(false);
  };

  const getTabIcon = (tabId: string) => {
    switch (tabId) {
      case 'self-exploration':
        return <Sparkles className="w-5 h-5" />;
      case 'multi-minds':
        return <Users className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getTabLabel = (tab: { id: string; labelEn: string; labelDe: string }) => {
    return language === 'de' ? tab.labelDe : tab.labelEn;
  };

  return (
    <>
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* User Space Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg">
                {userName || 'Guest'}
              </h2>
              <p className="text-sm text-gray-500">
                {t('space', language)}
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Globe className="w-4 h-4" />
              {language === 'en' ? 'English' : 'Deutsch'}
            </button>

            {showLanguageMenu && (
              <div className="absolute top-full left-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${language === 'en' ? 'text-primary-600 font-medium' : 'text-gray-700'
                    }`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange('de')}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${language === 'de' ? 'text-primary-600 font-medium' : 'text-gray-700'
                    }`}
                >
                  Deutsch
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => {
            const isLocked = tab.locked;
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id, isLocked)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } ${isLocked ? 'opacity-70' : ''}`}
              >
                <div className={`${isActive ? 'text-primary-500' : 'text-gray-400'}`}>
                  {getTabIcon(tab.id)}
                </div>
                <span className="flex-1 text-left font-medium">
                  {getTabLabel(tab)}
                </span>
                {isLocked ? (
                  <Lock className="w-4 h-4 text-gray-400" />
                ) : isActive ? (
                  <div className="w-2 h-2 rounded-full bg-primary-500" />
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Footer with Settings */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => {
              setSelectedTabId('multi-minds');
              setIsPasswordModalOpen(true);
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">{t('settings', language)}</span>
          </button>
        </div>
      </aside>

      {/* Password Modal */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        tabId={selectedTabId}
        onSuccess={() => {
          // Refresh tabs after unlock
          if (sessionId) {
            tabApi.getAvailable(sessionId)
              .then(response => {
                if (response.success && response.data) {
                  setTabs(response.data);
                  setCurrentTab(selectedTabId);
                }
              });
          }
        }}
      />
    </>
  );
}
