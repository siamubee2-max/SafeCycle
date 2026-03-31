import { useApp } from '@/context/AppContext';
import { TRANSLATIONS } from '@/lib/constants';

export function useTranslation() {
  const { state } = useApp();
  const lang = state.settings.language;
  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  
  const formatDate = (dateStr: string, options?: Intl.DateTimeFormatOptions) => {
    const locale = lang === 'en' ? 'en-US' : 'fr-FR';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(locale, options);
  };
  
  const getSymptomLabel = (symptom: string): string => {
    const symptoms = t.symptoms;
    const allSymptoms = [
      ...symptoms.common,
      ...symptoms.sopk,
      ...symptoms.endometriosis,
      ...symptoms.contraception,
    ];
    return allSymptoms.find(s => s.toLowerCase() === symptom.toLowerCase()) || symptom;
  };

  return { t, lang, formatDate, getSymptomLabel };
}
