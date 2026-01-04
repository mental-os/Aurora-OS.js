import { Mail, Calendar, LucideIcon, FileQuestion } from 'lucide-react';
import { useThemeColors } from '../../hooks/useThemeColors';
import { EmptyState } from '../ui/empty-state';
import { useI18n } from '../../i18n';

interface PlaceholderAppProps {
    title: string;
}

const APP_ICONS: Record<string, LucideIcon> = {
    'Mail': Mail,
    'Calendar': Calendar
};

const APP_DESCRIPTIONS: Record<string, string> = {
    'Mail': 'placeholderApp.descriptions.mail',
    'Calendar': 'placeholderApp.descriptions.calendar'
};

export function PlaceholderApp({ title }: PlaceholderAppProps) {
    const { blurStyle } = useThemeColors();
    const { t } = useI18n();
    const Icon = APP_ICONS[title] || FileQuestion;
    const descriptionKey = APP_DESCRIPTIONS[title] || 'placeholderApp.descriptions.default';

    return (
        <div
            className="h-full flex flex-col items-center justify-center bg-black/40"
            style={{
                ...blurStyle
            }}
        >
            <EmptyState
                icon={Icon}
                title={t('placeholderApp.comingSoonTitle', { title })}
                description={t(descriptionKey)}
            />
        </div>
    );
}
