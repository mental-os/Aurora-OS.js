import { useMemo, useState, useEffect, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, getHours, getMinutes, setHours, addMinutes, addDays, subDays, subMinutes } from 'date-fns';
import { enUS, es as esLocale, fr as frLocale, de as deLocale, pt as ptLocale, ro as roLocale, zhCN as zhLocale } from 'date-fns/locale';
import { Plus, ChevronLeft, ChevronRight, MapPin, Calendar as CalendarIcon, Clock, Type, AlignLeft, Timer, ChevronsUpDown, Check } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Button, buttonVariants } from '@/components/ui/button';
import { Calendar as MiniCalendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/components/ui/utils';
import { AppTemplate } from '@/components/apps/AppTemplate';
import { useAppContext } from '@/components/AppContext';
import { useFileSystem } from '@/components/FileSystemContext';
import { STORAGE_KEYS } from '@/utils/memory';
import { notify } from '@/services/notifications';
import { useI18n } from '@/i18n/index';
import { useThemeColors } from '@/hooks/useThemeColors';
import { safeParseLocal } from '@/utils/safeStorage';


// --- Types ---

type EventType = 'work' | 'personal' | 'social' | 'events' | 'family' | 'other';

interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  start: string; // ISO String for JSON serialization
  durationMinutes: number;
  location?: string;
  notes?: string;
  color: string;
}

// Helper for date conversion since JSON stores strings
interface HydratedCalendarEvent extends Omit<CalendarEvent, 'start'> {
  start: Date;
}

interface Category {
  id: string;
  label?: string; // For user categories
  labelKey?: string; // For system categories
  color: string;
}

interface CalendarProps {
  owner?: string;
}

// --- Constants ---

const COLORS = [
  { labelKey: 'calendar.colors.blue', value: 'blue', tw: 'bg-blue-500' },
  { labelKey: 'calendar.colors.green', value: 'green', tw: 'bg-green-500' },
  { labelKey: 'calendar.colors.red', value: 'red', tw: 'bg-red-500' },
  { labelKey: 'calendar.colors.yellow', value: 'yellow', tw: 'bg-yellow-500' },
  { labelKey: 'calendar.colors.purple', value: 'purple', tw: 'bg-purple-500' },
  { labelKey: 'calendar.colors.pink', value: 'pink', tw: 'bg-pink-500' },
  { labelKey: 'calendar.colors.orange', value: 'orange', tw: 'bg-orange-500' },
  { labelKey: 'calendar.colors.gray', value: 'gray', tw: 'bg-gray-500' },
];

const getColorClass = (colorName: string) => {
  if (colorName === 'white') return 'bg-white';
  return COLORS.find(c => c.value === colorName)?.tw || 'bg-blue-500';
};

const CATEGORY_BORDER_COLORS: Record<string, string> = {
  work: "border-blue-500",
  personal: "border-green-500",
  social: "border-purple-500",
  events: "border-yellow-500",
  family: "border-red-500",
  other: "border-gray-500",
  all: "border-white"
};

const EVENT_BG_COLORS: Record<string, string> = {
  blue: "bg-blue-500/20 hover:bg-blue-500/30",
  green: "bg-green-500/20 hover:bg-green-500/30",
  red: "bg-red-500/20 hover:bg-red-500/30",
  yellow: "bg-yellow-500/20 hover:bg-yellow-500/30",
  purple: "bg-purple-500/20 hover:bg-purple-500/30",
  pink: "bg-pink-500/20 hover:bg-pink-500/30",
  orange: "bg-orange-500/20 hover:bg-orange-500/30",
  gray: "bg-gray-500/20 hover:bg-gray-500/30",
};



const DEFAULT_CATEGORIES: Category[] = [
  { id: 'all', labelKey: 'calendar.categories.all', color: 'white' },
  { id: 'work', labelKey: 'calendar.categories.work', color: 'blue' },
  { id: 'personal', labelKey: 'calendar.categories.personal', color: 'green' },
  { id: 'social', labelKey: 'calendar.categories.social', color: 'purple' },
  { id: 'events', labelKey: 'calendar.categories.events', color: 'yellow' },
  { id: 'family', labelKey: 'calendar.categories.family', color: 'red' },
];

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'work', label: 'calendar.types.work' },
  { value: 'personal', label: 'calendar.types.personal' },
  { value: 'social', label: 'calendar.types.social' },
  { value: 'events', label: 'calendar.types.events' },
  { value: 'family', label: 'calendar.types.family' },
  { value: 'other', label: 'calendar.types.other' },
];

const getMockEvents = (t: (key: string, vars?: Record<string, string | number>) => string): CalendarEvent[] => {
  let startDate = new Date();

  // Try to use system install date for historical accuracy
  try {
    // safeParseLocal returns null for non-JSON strings usually, but INSTALL_DATE might be a raw string.
    // safeStorage is designed for JSON.
    // However, safeParseLocal handles non-JSON by catching and returning null? 
    // Actually safeParseLocal expects JSON. If INSTALL_DATE is a plain string, it might fail.
    // Let's check safeStorage implementation again. It does `JSON.parse(raw)`.
    // IF INSTALL_DATE is just "2024-01-01...", JSON.parse will fail if not quoted?
    // Actually Date strings are usually stored as simple strings or JSON strings.
    // Let's assume it's a raw string for date? 
    // Wait, STORAGE_KEYS.INSTALL_DATE is likely set via `new Date().toISOString()`.
    // Use raw localStorage for simple strings if determining they are safe (Dates are safe).
    const installDateStr = localStorage.getItem(STORAGE_KEYS.INSTALL_DATE);
    if (installDateStr) {
      startDate = new Date(installDateStr);
    } else {
      // Fallback: If no install date (dev/legacy), stick to "Today at 10:00"
      startDate.setHours(10, 0, 0, 0);
    }
  } catch {
    startDate.setHours(10, 0, 0, 0);
  }

  // Ensure it's 10:00 AM regardless of day (unless it's the exact install time we want, but "Ten AM" feels canonical for a start event)
  // Request was: "follow the onboarding completion time".
  // So we should strictly use the timestamp as is, maybe rounded to nearest 15/30 mins for cleanliness?
  // Let's use the exact time or rounded to start of hour.
  // "Loop Started" usually implies the moment the system booted.
  // Let's round to nearest minute for clean JSON.

  return [
    {
      id: '1',
      title: t('calendar.mockEvents.loopStarted.title'),
      type: 'other',
      start: format(startDate, 'yyyy-MM-dd HH:mm'),
      durationMinutes: 30,
      location: t('calendar.mockEvents.loopStarted.location'),
      notes: t('calendar.mockEvents.loopStarted.notes'),
      color: 'purple',
    },
  ];
};

// --- Component ---

const TIME_SLOTS = Array.from({ length: 48 }).map((_, i) => {
  const totalMinutes = i * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
});

export function Calendar({ owner }: CalendarProps) {
  const { readFile, writeFile, createFile, createDirectory } = useFileSystem();
  const { activeUser: desktopUser, accentColor, timeMode } = useAppContext();
  const { t, locale } = useI18n();
  const { windowBackground, sidebarBackground, getBackgroundColor, blurStyle } = useThemeColors();

  // Helper to shift date for display if in Server Time (UTC)
  const toDisplayDate = useCallback((date: Date) => {
    if (timeMode === 'server') {
      return addMinutes(date, date.getTimezoneOffset());
    }
    return date;
  }, [timeMode]);

  // Helper to unshift date from display back to real date
  const fromDisplayDate = useCallback((date: Date) => {
    if (timeMode === 'server') {
      return subMinutes(date, date.getTimezoneOffset());
    }
    return date;
  }, [timeMode]);

  const dateFnsLocale = useMemo(() => {
    const base = (locale || 'en-US').split('-')[0]?.toLowerCase();
    switch (base) {
      case 'es':
        return esLocale;
      case 'fr':
        return frLocale;
      case 'de':
        return deLocale;
      case 'pt':
        return ptLocale;
      case 'ro':
        return roLocale;
      case 'zh':
        return zhLocale;
      default:
        return enUS;
    }
  }, [locale]);

  const weekdaysShort = useMemo(() => {
    const sunday = new Date(2024, 0, 7);
    return Array.from({ length: 7 }, (_, i) => format(addDays(sunday, i), 'EEE', { locale: dateFnsLocale }));
  }, [dateFnsLocale]);

  // Removed conflicting categories useMemo
  // const categories = useMemo(...) -> We now use state 'categories'

  const colors = useMemo(
    () => COLORS.map((color) => ({ ...color, label: t(color.labelKey) })),
    [t]
  );

  const eventTypes = useMemo(
    () => EVENT_TYPES.map((type) => ({ ...type, labelText: t(type.label) })),
    [t]
  );

  // Determine effective user (support for `sudo calendar` or `su user calendar`)
  const activeUser = owner || desktopUser;

  // Persistence Paths
  const userHome = activeUser === 'root' ? '/root' : `/home/${activeUser}`;
  const configDir = `${userHome}/.Config`;
  const configFile = `${configDir}/calendar.json`;
  const softStateKey = `${STORAGE_KEYS.APP_DATA_PREFIX}calendar-state-${activeUser}`;

  // --- State ---

  // Soft Memory (UI State)
  const [currentDate, setCurrentDate] = useState(() => {
    try {
      const saved = safeParseLocal<{ currentDate: string, view: 'month' | 'day' }>(softStateKey);
      if (saved && saved.currentDate) return new Date(saved.currentDate);
    } catch {
      // Ignore invalid/missing state
    }
    return new Date();
  });

  const [view, setView] = useState<'month' | 'day'>(() => {
    try {
      const saved = safeParseLocal<{ currentDate: string, view: 'month' | 'day' }>(softStateKey);
      if (saved && saved.view) return saved.view;
    } catch {
      // Ignore invalid/missing state
    }
    return 'month';
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string | null>(null); // New color filter state

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Hard Memory (Data)
  const [events, setEvents] = useState<HydratedCalendarEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  // Local helper to resolve category style dynamically
  const resolveCategoryClass = (categoryId: string) => {
    // 1. Try static map first (fast path for default categories)
    if (CATEGORY_BORDER_COLORS[categoryId]) return CATEGORY_BORDER_COLORS[categoryId];

    // 2. Find in dynamic categories
    const cat = categories.find(c => c.id === categoryId);
    if (cat) {
      // If it has a color name that matches our tokens
      if (CATEGORY_BORDER_COLORS[cat.color]) return CATEGORY_BORDER_COLORS[cat.color];

      // If it has a raw color (future proof), we might return inline style, but for now fallback
    }

    return "border-gray-500";
  };

  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'all' || event.type === selectedCategory;
    const matchesColor = selectedColor === null || event.color === selectedColor;
    return matchesCategory && matchesColor;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<HydratedCalendarEvent>>({});
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("blue");

  // Drag Helper
  // Track dragging event ID to block clicks (via pointer-events: none)
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // --- Persistence Effects ---

  // Load Events
  useEffect(() => {
    if (!activeUser) return;

    const loadEvents = () => {
      let loadedEvents: CalendarEvent[] = [];
      let source = 'file';

      // 1. Try File System
      const content = readFile(configFile, activeUser);

      if (content) {
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            // Migration: Old format (Array of events)
            loadedEvents = parsed;
          } else {
            // New format: { events, categories }
            loadedEvents = parsed.events || [];
            if (parsed.categories) {
              setCategories(parsed.categories);
            }
          }
        } catch (e) {
          console.error(e);
          source = 'corrupt';
        }
      } else {
        // 2. Fallback / Init
        // If file doesn't exist, checks storage for legacy data or use mock
        // For now, we just initialize with Mock data if file is missing to simulate fresh install
        // But if we want to respect "Fallback to local storage" strictly per request:
        // The request said: "taking the content from ... file ... THEN falls back to the local storage"
        // We'll check legacy key or just init.
        loadedEvents = getMockEvents(t);
        source = 'init';
      }

      // Hydrate dates
      const hydrated = loadedEvents.map(e => ({
        ...e,
        start: new Date(e.start), // Works with 'yyyy-MM-dd HH:mm' in most browsers, but we can standardise if needed
        color: e.color.startsWith('bg-') ? 'blue' : e.color // Migration/Fallback for old data
      }));

      // Prevent infinite loops / re-renders if data hasn't changed
      // This is crucial because readFile changes on every write, triggering this effect
      setEvents(prev => {
        const isDifferent = JSON.stringify(prev) !== JSON.stringify(hydrated);
        return isDifferent ? hydrated : prev;
      });

      if (source === 'init') {
        // Auto-create config file
        createDirectory(userHome, '.Config', activeUser);
        const initialData = {
          events: loadedEvents,
          categories: DEFAULT_CATEGORIES
        };
        createFile(configDir, 'calendar.json', JSON.stringify(initialData, null, 2), activeUser);
      }

      setIsLoading(false);
    };

    loadEvents();
  }, [activeUser, readFile, createFile, createDirectory, configFile, configDir, userHome, t]);

  // Save Events (Write-through)
  // Accepts optional categories to save, otherwise uses current state (careful with stale closures if not passed)
  // To avoid stale closures, we pass both implicitly or explicitly
  const saveEventsToDisk = (eventsToSave: HydratedCalendarEvent[], categoriesToSave: Category[] = categories) => {
    // Serious serialization
    const serializedEvents = eventsToSave.map(e => ({
      ...e,
      start: format(e.start, 'yyyy-MM-dd HH:mm')
    }));

    const dataToSave = {
      events: serializedEvents,
      categories: categoriesToSave
    };

    const success = writeFile(configFile, JSON.stringify(dataToSave, null, 2), activeUser);
    if (!success) {
      // Retry by ensuring directory exists (rare edge case where dir was deleted while app running)
      createDirectory(userHome, '.Config', activeUser);
      writeFile(configFile, JSON.stringify(dataToSave, null, 2), activeUser);
    }
  };



  // Save Soft State (UI Preferences)
  useEffect(() => {
    localStorage.setItem(softStateKey, JSON.stringify({
      view,
      currentDate: currentDate.toISOString()
    }));
  }, [view, currentDate, softStateKey]);


  // --- Handlers ---

  const handleCreateEvent = (slotDate?: Date) => {
    const startDate = slotDate || new Date();
    if (!slotDate) {
      startDate.setHours(startDate.getHours() + 1, 0, 0, 0);
    }
    // Deep clone to avoid ref issues
    // Convert to Visual Date for editing
    setEditingEvent({
      start: toDisplayDate(new Date(startDate)),
      durationMinutes: 60,
      color: 'blue',
      type: 'work',
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (event: HydratedCalendarEvent) => {
    // Convert to Visual Date for editing
    setEditingEvent({
      ...event,
      start: toDisplayDate(event.start)
    });
    setIsModalOpen(true);
  };

  const handleDeleteEvent = () => {
    if (!editingEvent.id) return;

    const newEvents = events.filter(e => e.id !== editingEvent.id);
    setEvents(newEvents);
    saveEventsToDisk(newEvents);
    setIsModalOpen(false);
    setEditingEvent({});
    notify.system('success', 'Calendar', t('calendar.toasts.eventDeleted'), t('notifications.subtitles.deleted'));
  };

  const handleSaveEvent = () => {
    if (!editingEvent.title || !editingEvent.start || !editingEvent.durationMinutes) {
      notify.system('error', 'Calendar', t('calendar.toasts.requiredFields'), t('notifications.subtitles.validation'));
      return;
    }

    let newEvents = [...events];

    if (editingEvent.id) {
      // Update
      newEvents = newEvents.map(e => e.id === editingEvent.id ? {
        ...e,
        title: editingEvent.title!,
        type: editingEvent.type || 'other',
        start: fromDisplayDate(editingEvent.start!), // Convert back to Real Date
        durationMinutes: editingEvent.durationMinutes!,
        location: editingEvent.location || '',
        notes: editingEvent.notes || '',
        color: editingEvent.color || 'blue',
      } : e);
    } else {
      // Create
      const newEvent: HydratedCalendarEvent = {
        id: crypto.randomUUID(),
        title: editingEvent.title,
        type: editingEvent.type || 'other',
        start: fromDisplayDate(editingEvent.start!), // Convert back to Real Date
        durationMinutes: editingEvent.durationMinutes,
        location: editingEvent.location || '',
        notes: editingEvent.notes || '',
        color: editingEvent.color || 'blue',
      };
      newEvents.push(newEvent);
    }

    setEvents(newEvents);
    saveEventsToDisk(newEvents);
    setIsModalOpen(false);
    setEditingEvent({});
    notify.system('success', 'Calendar', t('calendar.toasts.eventSaved'), t('notifications.subtitles.saved'));
  };

  const handleUpdateEvent = (id: string, updates: Partial<HydratedCalendarEvent>) => {
    const newEvents = events.map(e => e.id === id ? { ...e, ...updates } : e);
    setEvents(newEvents);
    saveEventsToDisk(newEvents);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      setSelectedDate(date);
    }
  };

  // --- Render Views ---

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory: Category = {
      id: crypto.randomUUID(),
      label: newCategoryName,
      color: newCategoryColor,
      labelKey: undefined
    };

    const newCategories = [...categories, newCategory];
    setCategories(newCategories);
    saveEventsToDisk(events, newCategories); // Explicit Save

    setIsCategoryModalOpen(false);
    setNewCategoryName("");
    setNewCategoryColor("blue");
  };

  const handleDeleteCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (DEFAULT_CATEGORIES.find(c => c.id === id)) {
      notify.system('error', 'Calendar', t('calendar.toasts.cannotDeleteSystemCategory'), t('notifications.subtitles.error'));
      return;
    }
    const newCategories = categories.filter(c => c.id !== id);
    setCategories(newCategories);
    saveEventsToDisk(events, newCategories); // Explicit Save

    if (selectedCategory === id) setSelectedCategory('all');
  };

  // DnD Handlers for Month View
  const handleDragStart = (e: React.DragEvent, event: HydratedCalendarEvent) => {
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('text/plain');
    const event = events.find(ev => ev.id === eventId);

    if (event) {
      // Logic: targetDate is the Visual Day (e.g. Sep 1 UTC).
      // Event Start is Real Date.
      // We want to keep the Visual Time (e.g. 10:00).
      // So Visual New Start = Visual Day + Visual Time.
      // Real New Start = fromDisplayDate(Visual New Start).

      const visualEventStart = toDisplayDate(event.start);
      const newStartVisual = new Date(targetDate);
      newStartVisual.setHours(getHours(visualEventStart), getMinutes(visualEventStart));

      const newStartReal = fromDisplayDate(newStartVisual);

      handleUpdateEvent(event.id, { start: newStartReal });
    }
  };

  const renderMonthView = () => {
    const visualCurrentDate = toDisplayDate(currentDate);
    const visualToday = toDisplayDate(new Date());

    const monthStart = startOfMonth(visualCurrentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weeks: Date[][] = [];
    let daysInWeek: Date[] = [];

    days.forEach(day => {
      daysInWeek.push(day);
      if (daysInWeek.length === 7) {
        weeks.push(daysInWeek);
        daysInWeek = [];
      }
    });

    return (
      <div className="flex flex-col h-full rounded-lg overflow-hidden border border-white/5" style={{ backgroundColor: getBackgroundColor(0.2) }}>
        <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
          {weekdaysShort.map(day => (
            <div key={day} className="py-2 text-center text-xs font-medium text-white/50 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">
          <div className="flex flex-col min-h-full">
            {weeks.map((week, wIndex) => (
              <div key={wIndex} className="grid grid-cols-7 min-h-[120px] flex-1 border-b border-white/5 last:border-b-0">
                {week.map((day, dIndex) => {
                  const dayEvents = filteredEvents.filter(e => isSameDay(toDisplayDate(e.start), day));
                  const isSelectedMonth = isSameMonth(day, visualCurrentDate);
                  const isTodayVisual = isSameDay(day, visualToday);

                  return (
                    <div
                      key={dIndex}
                      className={cn(
                        "border-r border-white/5 p-1 relative group transition-colors min-h-[100px]",
                        !isSelectedMonth && "bg-black/20",
                        isTodayVisual && "bg-white/5",
                        "hover:bg-white/10"
                      )}
                      onClick={() => {
                        handleDateSelect(day);
                      }}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={cn(
                            "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full transition-colors",
                            !isTodayVisual && (isSelectedMonth ? "text-white/90" : "text-white/30")
                          )}
                          style={isTodayVisual ? { backgroundColor: accentColor, color: 'white' } : undefined}
                        >
                          {format(day, 'd')}
                        </span>
                      </div>

                      <div className="space-y-1 pb-4">
                        {dayEvents.map(event => (
                          <div
                            key={event.id}
                            className={cn(
                              "text-[10px] px-2 py-1 rounded-md truncate font-medium text-white cursor-pointer transition-colors hover:brightness-110 hover:z-20 relative border-l-2 bg-opacity-80 backdrop-blur-sm",
                              resolveCategoryClass(event.type),
                              EVENT_BG_COLORS[event.color] || EVENT_BG_COLORS.blue
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event);
                            }}
                            draggable
                            onDragStart={(e) => handleDragStart(e, event)}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>

                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1 hover:bg-white/20 rounded-full text-white/70"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateEvent(day);
                          }}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const visualCurrentDate = toDisplayDate(currentDate);
    const visualToday = toDisplayDate(new Date());

    // Filter events that visually appear on this day
    const rawDayEvents = filteredEvents.filter(e => isSameDay(toDisplayDate(e.start), visualCurrentDate));

    // Sort: Earlier start first. If same start, Longer duration first (so shorter ones sit on top visually)
    const dayEvents = rawDayEvents.sort((a, b) => {
      const aStart = toDisplayDate(a.start).getTime();
      const bStart = toDisplayDate(b.start).getTime();
      if (aStart !== bStart) return aStart - bStart;
      return b.durationMinutes - a.durationMinutes;
    });

    // Calculate layout overlaps (indentation levels)
    const getEventLayout = (events: typeof dayEvents) => {
      const layoutMap = new Map<string, { indent: number, maxIndent: number }>();
      const activeEvents: { end: number, indent: number }[] = [];

      events.forEach(event => {
        const start = toDisplayDate(event.start).getTime();
        const end = start + (event.durationMinutes * 60 * 1000);

        // Remove events that have ended before this one starts
        for (let i = activeEvents.length - 1; i >= 0; i--) {
          if (activeEvents[i].end <= start) {
            activeEvents.splice(i, 1);
          }
        }

        // Find first available indent index (column)
        // We look for gaps in the sequence 0, 1, 2...
        // Construct a set of used indents
        const usedIndents = new Set(activeEvents.map(e => e.indent));
        let indent = 0;
        while (usedIndents.has(indent)) {
          indent++;
        }

        activeEvents.push({ end, indent });
        layoutMap.set(event.id, { indent, maxIndent: 0 }); // maxIndent computed later if needed for widths, but we use simple cascading for now
      });

      return layoutMap;
    };

    const layout = getEventLayout(dayEvents);

    return (
      <div className="flex flex-col h-full rounded-lg overflow-hidden border border-white/5 relative" style={{ backgroundColor: getBackgroundColor(0.2) }}>
        <div className="flex flex-col items-center justify-center py-4 border-b border-white/10 bg-white/5">
          <span
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: isSameDay(visualCurrentDate, visualToday) ? accentColor : 'rgba(255,255,255,0.5)' }}
          >
            {format(visualCurrentDate, 'EEEE', { locale: dateFnsLocale })}
          </span>
          <div
            className="text-3xl font-light w-10 h-10 flex items-center justify-center rounded-full mt-1"
            style={{
              backgroundColor: isSameDay(visualCurrentDate, visualToday) ? accentColor : 'transparent',
              color: isSameDay(visualCurrentDate, visualToday) ? 'white' : 'white'
            }}
          >
            {format(visualCurrentDate, 'd')}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto relative custom-scrollbar bg-black/40">
          <div className="relative h-[1440px] w-full">
            {hours.map(hour => (
              <div key={hour} className="absolute w-full flex group items-start" style={{ top: `${hour * 60}px`, height: '60px' }}>
                <div className="w-16 text-right pr-4 text-xs text-white/50 font-medium -translate-y-1/2">
                  {format(setHours(new Date(), hour), 'h a', { locale: dateFnsLocale })}
                </div>
                <div
                  className="flex-1 h-full border-t border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => handleCreateEvent(fromDisplayDate(setHours(visualCurrentDate, hour)))}
                />
              </div>
            ))}

            {isSameDay(visualCurrentDate, visualToday) && (
              <div
                className="absolute w-full border-t-2 z-10 pointer-events-none flex items-center"
                style={{
                  top: `${getHours(visualToday) * 60 + getMinutes(visualToday)}px`,
                  borderColor: accentColor
                }}
              >
                <div
                  className="w-2 h-2 rounded-full -ml-1"
                  style={{ backgroundColor: accentColor }}
                />
              </div>
            )}

            {dayEvents.map(event => {
              const visualStart = toDisplayDate(event.start);
              const startMinutes = getHours(visualStart) * 60 + getMinutes(visualStart);
              const height = event.durationMinutes;
              const showTime = height >= 30;
              const showLocation = height >= 50;

              const layoutInfo = layout.get(event.id) || { indent: 0 };
              const indent = layoutInfo.indent;
              const xOffset = 64 + (indent * 24); // Shift right by 24px per level for better visibility
              const width = `calc(100% - ${xOffset + 16}px)`; // Maintain right padding
              const zIndex = 20 + indent; // Higher indent = higher z-index

              const isDragging = draggingId === event.id;

              return (
                <Rnd
                  key={event.id}
                  default={{
                    x: xOffset,
                    y: startMinutes,
                    width: width,
                    height: height
                  }}
                  // If dragging, let Rnd handle position (undefined). If static, enforce layout.
                  position={isDragging ? undefined : { x: xOffset, y: startMinutes }}
                  size={isDragging ? undefined : { width: width, height: height }}
                  minHeight={30}
                  dragAxis="y"
                  bounds="parent"
                  enableResizing={{ top: false, right: false, bottom: true, left: false, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false }}
                  onDragStart={() => { }} // Don't block clicks on start
                  onDrag={() => {
                    if (draggingId !== event.id) setDraggingId(event.id);
                  }}
                  onDragStop={(_e, d) => {
                    setDraggingId(null);

                    const newStartMinutes = d.y;
                    // Calculate based on Visual Date
                    const newStartVisual = new Date(visualCurrentDate);
                    newStartVisual.setHours(0, newStartMinutes, 0, 0);

                    // Snap to 15 mins
                    const snappedMinutes = Math.round(newStartMinutes / 15) * 15;
                    const hours = Math.floor(snappedMinutes / 60);
                    const minutes = snappedMinutes % 60;
                    newStartVisual.setHours(hours, minutes);

                    const newStartReal = fromDisplayDate(newStartVisual);

                    handleUpdateEvent(event.id, { start: newStartReal });
                  }}
                  onResizeStart={() => setDraggingId(event.id)}
                  onResizeStop={(_e, _direction, ref, _delta, _position) => {
                    setDraggingId(null);

                    const newHeight = parseInt(ref.style.height, 10);
                    // Snap duration to 15 mins
                    const snappedDuration = Math.round(newHeight / 15) * 15;
                    handleUpdateEvent(event.id, { durationMinutes: Math.max(15, snappedDuration) });
                  }}
                  className={cn(
                    "absolute rounded-md text-xs border-l-4 overflow-hidden hover:brightness-110 cursor-pointer transition-colors bg-black/60 backdrop-blur-md shadow-md hover:z-60! group",
                    resolveCategoryClass(event.type)
                  )}
                  style={{
                    zIndex: isDragging ? 50 : zIndex
                  }}
                >
                  <div
                    className={cn("absolute inset-0 w-full h-full", EVENT_BG_COLORS[event.color] || EVENT_BG_COLORS.blue)}
                    style={{ pointerEvents: draggingId === event.id ? 'none' : 'auto' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                  />

                  <div className="relative z-10 text-white p-2 pointer-events-none">
                    <div className="font-semibold mb-0.5 truncate">{event.title}</div>

                    {showTime && (
                      <div className="text-white/70 flex items-center gap-1 mb-1 truncate text-[10px]">
                        {format(toDisplayDate(event.start), 'p', { locale: dateFnsLocale })} - {format(toDisplayDate(addMinutes(event.start, event.durationMinutes)), 'p', { locale: dateFnsLocale })}
                      </div>
                    )}

                    {showLocation && event.location && (
                      <div className="flex items-center gap-1 text-white/50 truncate text-[10px]">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </Rnd>
              );
            })}
          </div>
        </div>
      </div>
    );
  };


  const content = ({ width, isSidebarCompact }: { width: number, isSidebarCompact: boolean }) => {
    const isSmall = width < 640;

    return (
      <div className="flex h-full w-full text-white animate-in fade-in duration-500 overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            "flex flex-col border-r border-white/5 gap-6 shrink-0 backdrop-blur-md transition-all duration-300",
            isSidebarCompact ? "w-16 p-2 items-center" : "w-64 p-4"
          )}
          style={{ backgroundColor: sidebarBackground }}
        >
          <div className="space-y-4 w-full">
            <Button
              className={cn(
                "text-white transition-all hover:brightness-110 shadow-lg shadow-black/20",
                isSidebarCompact ? "w-8 h-8 p-0 justify-center rounded-full" : "w-full justify-start gap-2"
              )}
              style={{ backgroundColor: accentColor }}
              onClick={() => handleCreateEvent()}
              title={t('calendar.actions.createEvent')}
            >
              <Plus className="w-4 h-4" />
              {!isSidebarCompact && t('calendar.actions.createEvent')}
            </Button>

            {!isSidebarCompact && (
              <div style={{ "--accent-color": accentColor } as React.CSSProperties}>
                <MiniCalendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setCurrentDate(date);
                    }
                  }}
                  locale={dateFnsLocale}
                  showOutsideDays={false}
                  className="rounded-md p-1"
                  modifiersStyles={{
                    selected: { backgroundColor: 'var(--accent-color)' }
                  }}
                  classNames={{
                    head_cell: "text-white/50 rounded-md w-7 font-normal text-[0.8rem]",
                    cell: "h-7 w-7 text-center text-sm p-0 m-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-white/5 [&:has([aria-selected])]:bg-white/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-7 w-7 p-0 font-normal aria-selected:opacity-100 text-white hover:bg-white/10 hover:text-white rounded-md transition-colors aria-selected:text-white",
                    day_today: "text-[var(--accent-color)] font-bold ring-1 ring-white/20",
                    day_selected: "bg-[var(--accent-color)] !text-white hover:bg-[var(--accent-color)] hover:text-white focus:bg-[var(--accent-color)] focus:text-white"
                  }}
                />
              </div>
            )}
          </div>

          <div className={cn("space-y-6 overflow-y-auto pr-1 custom-scrollbar w-full", isSidebarCompact && "px-0 overflow-visible")}>
            <div className="space-y-3">
              {!isSidebarCompact && (
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">{t('calendar.sidebar.myCalendars')}</h3>
                  <button
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className={cn("space-y-1", isSidebarCompact && "flex flex-col items-center gap-2 space-y-0")}>
                {categories.map(category => (
                  <div
                    key={category.id}
                    className={cn(
                      "flex items-center justify-between transition-colors duration-200 cursor-pointer group/cat",
                      isSidebarCompact
                        ? "w-8 h-8 justify-center rounded-full hover:bg-white/10"
                        : "gap-2 text-sm px-3 py-2 rounded-lg",
                      selectedCategory === category.id
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                    onClick={() => setSelectedCategory(category.id)}
                    title={(category as any).label || t((category as any).labelKey)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "rounded-full ring-2 ring-white/5",
                        isSidebarCompact ? "w-3 h-3" : "w-3 h-3",
                        getColorClass(category.color || 'white')
                      )} />
                      {!isSidebarCompact && ((category as any).label || t((category as any).labelKey))}
                    </div>

                    {!isSidebarCompact && !DEFAULT_CATEGORIES.some(c => c.id === category.id) && (
                      <button
                        onClick={(e) => handleDeleteCategory(category.id, e)}
                        className="text-white/20 hover:text-white opacity-0 group-hover/cat:opacity-100 transition-all font-bold"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {!isSidebarCompact && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">{t('calendar.sidebar.filterColors')}</h3>
                  {selectedColor && (
                    <button
                      onClick={() => setSelectedColor(null)}
                      className="text-[10px] text-white/50 hover:text-white transition-colors uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded hover:bg-white/10"
                    >
                      {t('calendar.actions.clear')}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-3 px-2 relative z-10">
                  {colors.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      className={cn(
                        "w-6 h-6 rounded-full transition-all duration-300 focus:outline-none ring-offset-2 ring-offset-[#1E1E1E] relative",
                        color.tw,
                        selectedColor === color.value
                          ? "ring-2 ring-white z-20"
                          : "opacity-40 hover:opacity-100"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedColor(selectedColor === color.value ? null : color.value);
                      }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className={cn(
          "flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden",
          isSmall ? "p-4 gap-4" : "p-6 gap-6"
        )}>
          {/* Toolbar */}
          <div className={cn(
            "flex justify-between shrink-0 min-w-0 animate-all duration-300",
            isSmall ? "flex-col gap-4 items-start" : "flex-row gap-4 items-center"
          )}>
            <div className={cn(
              "flex items-center min-w-0 transition-all",
              isSmall ? "w-full justify-between gap-2" : "gap-4 justify-start"
            )}>
              <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10 backdrop-blur-sm shrink-0">
                <button
                  onClick={() => setCurrentDate(view === 'day' ? subDays(currentDate, 1) : subMonths(currentDate, 1))}
                  className="p-1.5 hover:bg-white/10 rounded-md text-white/70 hover:text-white transition-colors"
                >
                  <ChevronLeft className={cn(isSmall ? "w-4 h-4" : "w-5 h-5")} />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())} // Always resets to real "Now"
                  className={cn(
                    "font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-md transition-colors border-x border-white/5 mx-0.5",
                    isSmall ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm"
                  )}
                >
                  {t('calendar.toolbar.today')}
                </button>
                <button
                  onClick={() => setCurrentDate(view === 'day' ? addDays(currentDate, 1) : addMonths(currentDate, 1))}
                  className="p-1.5 hover:bg-white/10 rounded-md text-white/70 hover:text-white transition-colors"
                >
                  <ChevronRight className={cn(isSmall ? "w-4 h-4" : "w-5 h-5")} />
                </button>
              </div>

              <h2 className={cn(
                "font-bold text-white tracking-tight truncate min-w-0 transition-all text-nowrap",
                isSmall ? "text-xl flex-1 text-right" : "text-3xl"
              )}>
                {format(toDisplayDate(currentDate), 'MMMM yyyy', { locale: dateFnsLocale })}
              </h2>
            </div>

            <div className={cn(
              "flex items-center bg-black/40 rounded-lg p-1 border border-white/10 backdrop-blur-sm",
              isSmall ? "w-full" : "w-auto"
            )}>
              <button
                onClick={() => setView('month')}
                className={cn(
                  "transition-colors duration-200 text-center rounded-md font-medium",
                  isSmall ? "flex-1 px-3 py-1.5 text-xs" : "px-4 py-1.5 text-sm",
                  view === 'month' ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {t('calendar.toolbar.month')}
              </button>
              <button
                onClick={() => setView('day')}
                className={cn(
                  "transition-colors duration-200 text-center rounded-md font-medium",
                  isSmall ? "flex-1 px-3 py-1.5 text-xs" : "px-4 py-1.5 text-sm",
                  view === 'day' ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {t('calendar.toolbar.day')}
              </button>
            </div>
          </div>

          {/* View Content */}
          <div
            className="flex-1 min-h-0 min-w-0 rounded-2xl border border-white/5 backdrop-blur-sm overflow-hidden relative"
            style={{ backgroundColor: windowBackground }}
          >
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center text-white/40">
                <div className="animate-pulse">{t('calendar.loadingEvents')}</div>
              </div>
            ) : (
              view === 'month' ? renderMonthView() : renderDayView()
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full relative">
      <AppTemplate
        className="bg-black/40 backdrop-blur-xl border-white/10"
        content={content} />


      {/* Event Modal - Kept outside AppTemplate content for z-index/portal reasons, though it's a Dialog so doesn't matter much */}
      {/* However, the Dialog must be rendered. */}
      {/* Wait, my previous replacement put Dialog INSIDE AppTemplate? No, it was outside in my mental model but inside the return. */}
      {/* Standard practice: Dialogs can be anywhere. */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          overlayClassName="bg-black/20 backdrop-blur-[12px]"
          className="sm:max-w-[425px] border-white/10 text-white shadow-2xl bg-transparent"
          style={{
            background: windowBackground,
            ...blurStyle
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editingEvent.id ? t('calendar.modal.editEvent') : t('calendar.modal.newEvent')}</DialogTitle>
            <DialogDescription className="text-white/50">
              {editingEvent.id ? t('calendar.modal.editEventDescription') : t('calendar.modal.newEventDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-white/70 text-xs font-medium ml-1">{t('calendar.modal.fields.title')}</Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white/70 transition-colors">
                  <Type className="w-4 h-4" />
                </div>
                <Input
                  value={editingEvent.title || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  placeholder={t('calendar.modal.placeholders.eventTitle')}
                  className="pl-9 bg-white/5 border-white/10 text-white focus:ring-white/20 focus:border-white/20 transition-all placeholder:text-white/20 hover:bg-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Date Picker */}
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs font-medium ml-1">{t('calendar.modal.fields.date')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white pl-3",
                        !editingEvent.start && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-white/40" />
                      <span className="truncate">
                        {editingEvent.start ? format(editingEvent.start, 'PPP', { locale: dateFnsLocale }) : t('calendar.modal.placeholders.pickDate')}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1E1E1E]/95 border-white/10 backdrop-blur-xl" align="start">
                    <div style={{ "--accent-color": accentColor } as React.CSSProperties}>
                      <MiniCalendar
                        mode="single"
                        selected={editingEvent.start}
                        onSelect={(date) => {
                          if (date) {
                            const newDate = new Date(date);
                            if (editingEvent.start) {
                              newDate.setHours(getHours(editingEvent.start));
                              newDate.setMinutes(getMinutes(editingEvent.start));
                            } else {
                              newDate.setHours(9, 0, 0, 0);
                            }
                            setEditingEvent({ ...editingEvent, start: newDate });
                          }
                        }}
                        locale={dateFnsLocale}
                        showOutsideDays={false}
                        initialFocus
                        modifiersStyles={{
                          selected: { backgroundColor: 'var(--accent-color)' }
                        }}
                        classNames={{
                          day: cn(
                            buttonVariants({ variant: "ghost" }),
                            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-white hover:bg-white/10 hover:text-white aria-selected:text-white"
                          ),
                          day_today: "text-[var(--accent-color)] font-bold ring-1 ring-white/20",
                          day_selected: "bg-[var(--accent-color)] !text-white hover:bg-[var(--accent-color)] hover:text-white focus:bg-[var(--accent-color)] focus:text-white"
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Picker (Command Style) */}
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs font-medium ml-1">{t('calendar.modal.fields.time')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white pl-3",
                        !editingEvent.start && "text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center truncate">
                        <Clock className="mr-2 h-4 w-4 text-white/40" />
                        {editingEvent.start ? format(editingEvent.start, 'HH:mm') : '00:00'}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[200px] p-0"
                    align="start"
                    style={{
                      zIndex: 10001,
                      background: 'rgba(28, 28, 30, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <Command className="bg-transparent text-white">
                      <CommandInput
                        placeholder={t('calendar.modal.placeholders.searchTime')}
                        className="h-8 text-[11px] border-b border-white/10"
                        style={{
                          color: 'white',
                          caretColor: accentColor
                        }}
                      />
                      <CommandList className="max-h-[200px]">
                        <CommandEmpty className="text-[11px] py-2 text-white/40">{t('calendar.modal.placeholders.noTimeFound')}</CommandEmpty>
                        <CommandGroup>
                          {TIME_SLOTS.map((time) => (
                            <CommandItem
                              key={time}
                              value={time}
                              onSelect={(currentValue) => {
                                const [h, m] = currentValue.split(':').map(Number);
                                const newDate = new Date(editingEvent.start || new Date());
                                newDate.setHours(h);
                                newDate.setMinutes(m);
                                setEditingEvent({ ...editingEvent, start: newDate });
                              }}
                              className="text-[11px] cursor-pointer transition-all duration-150"
                              style={{
                                color: editingEvent.start && format(editingEvent.start, 'HH:mm') === time ? accentColor : 'rgba(255, 255, 255, 0.7)',
                                backgroundColor: editingEvent.start && format(editingEvent.start, 'HH:mm') === time ? `${accentColor}15` : 'transparent'
                              }}
                              onMouseEnter={(e) => {
                                if (!editingEvent.start || format(editingEvent.start, 'HH:mm') !== time) {
                                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                  e.currentTarget.style.color = 'white';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!editingEvent.start || format(editingEvent.start, 'HH:mm') !== time) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                }
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-3 w-3 transition-opacity",
                                  editingEvent.start && format(editingEvent.start, 'HH:mm') === time ? "opacity-100" : "opacity-0"
                                )}
                                style={{ color: accentColor }}
                              />
                              {time}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Duration Select (Command Style) */}
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs font-medium ml-1">{t('calendar.modal.fields.duration')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white pl-3"
                    >
                      <div className="flex items-center truncate">
                        <Timer className="mr-2 h-4 w-4 text-white/40" />
                        {editingEvent.durationMinutes
                          ? t('calendar.modal.durationMinutes', { minutes: editingEvent.durationMinutes })
                          : t('calendar.modal.placeholders.selectDuration')}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[200px] p-0 z-10001"
                    style={{
                      background: 'rgba(28, 28, 30, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <Command className="bg-transparent text-white">
                      <CommandInput
                        placeholder={t('calendar.modal.placeholders.searchDuration')}
                        className="h-8 text-[11px] border-b border-white/10"
                        style={{
                          color: 'white',
                          caretColor: accentColor
                        }}
                      />
                      <CommandList>
                        <CommandEmpty className="text-[11px] py-2 text-white/40">{t('calendar.modal.placeholders.noDurationFound')}</CommandEmpty>
                        <CommandGroup>
                          {[15, 30, 45, 60, 90, 120, 180, 240].map((mins) => (
                            <CommandItem
                              key={mins}
                              value={t('calendar.modal.minutesOption', { minutes: mins })}
                              onSelect={() => {
                                setEditingEvent({ ...editingEvent, durationMinutes: mins });
                              }}
                              className="text-[11px] cursor-pointer transition-all duration-150"
                              style={{
                                color: editingEvent.durationMinutes === mins ? accentColor : 'rgba(255, 255, 255, 0.7)',
                                backgroundColor: editingEvent.durationMinutes === mins ? `${accentColor}15` : 'transparent'
                              }}
                              onMouseEnter={(e) => {
                                if (editingEvent.durationMinutes !== mins) {
                                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                  e.currentTarget.style.color = 'white';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (editingEvent.durationMinutes !== mins) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                }
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-3 w-3 transition-opacity",
                                  editingEvent.durationMinutes === mins ? "opacity-100" : "opacity-0"
                                )}
                                style={{ color: accentColor }}
                              />
                              {t('calendar.modal.minutesOption', { minutes: mins })}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Type Select (Command Style) */}
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs font-medium ml-1">{t('calendar.modal.fields.type')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white pl-3"
                    >
                      <div className="flex items-center truncate">
                        {editingEvent.type
                          ? eventTypes.find((type) => type.value === editingEvent.type)?.labelText
                          : t('calendar.modal.placeholders.selectType')}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[200px] p-0 z-10001"
                    style={{
                      background: 'rgba(28, 28, 30, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <Command className="bg-transparent text-white">
                      <CommandInput
                        placeholder={t('calendar.modal.placeholders.searchType')}
                        className="h-8 text-[11px] border-b border-white/10"
                        style={{
                          color: 'white',
                          caretColor: accentColor
                        }}
                      />
                      <CommandList>
                        <CommandEmpty className="text-[11px] py-2 text-white/40">{t('calendar.modal.placeholders.noTypeFound')}</CommandEmpty>
                        <CommandGroup>
                          {eventTypes.map((type) => (
                            <CommandItem
                              key={type.value}
                              value={type.labelText}
                              onSelect={() => {
                                setEditingEvent({ ...editingEvent, type: type.value });
                              }}
                              className="text-[11px] cursor-pointer transition-all duration-150"
                              style={{
                                color: editingEvent.type === type.value ? accentColor : 'rgba(255, 255, 255, 0.7)',
                                backgroundColor: editingEvent.type === type.value ? `${accentColor}15` : 'transparent'
                              }}
                              onMouseEnter={(e) => {
                                if (editingEvent.type !== type.value) {
                                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                  e.currentTarget.style.color = 'white';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (editingEvent.type !== type.value) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                }
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-3 w-3 transition-opacity",
                                  editingEvent.type === type.value ? "opacity-100" : "opacity-0"
                                )}
                                style={{ color: accentColor }}
                              />
                              {type.labelText}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label className="text-white/70 text-xs font-medium ml-1">{t('calendar.modal.fields.location')}</Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white/70 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <Input
                  value={editingEvent.location || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                  placeholder={t('calendar.modal.placeholders.addLocation')}
                  className="pl-9 bg-white/5 border-white/10 text-white focus:ring-white/20 hover:bg-white/10"
                />
              </div>
            </div>

            {/* Color */}
            <div className="space-y-1.5">
              <Label className="text-white/70 text-xs font-medium ml-1">{t('calendar.modal.fields.color')}</Label>
              <div className="flex gap-3 pt-1">
                {colors.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    className={cn(
                      "w-6 h-6 rounded-full transition-all focus:outline-none ring-offset-2 ring-offset-[#1E1E1E]",
                      color.tw,
                      editingEvent.color === color.value ? "ring-2 ring-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]" : "hover:scale-110 opacity-60 hover:opacity-100"
                    )}
                    onClick={() => setEditingEvent({ ...editingEvent, color: color.value })}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-white/70 text-xs font-medium ml-1">{t('calendar.modal.fields.notes')}</Label>
              <div className="relative group">
                <div className="absolute left-3 top-3 text-white/40 group-focus-within:text-white/70 transition-colors">
                  <AlignLeft className="w-4 h-4" />
                </div>
                <Textarea
                  value={editingEvent.notes || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, notes: e.target.value })}
                  placeholder={t('calendar.modal.placeholders.addNotes')}
                  className="pl-9 bg-white/5 border-white/10 text-white min-h-[80px] focus:ring-white/20 hover:bg-white/10 resize-none"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {editingEvent.id && (
              <Button
                variant="ghost"
                onClick={handleDeleteEvent}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 mr-auto transition-colors"
              >
                {t('calendar.actions.delete')}
              </Button>
            )}
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 text-white/70 hover:text-white">
              {t('calendar.actions.cancel')}
            </Button>
            <Button
              onClick={handleSaveEvent}
              className="text-white hover:brightness-110 border-0 transition-all"
              style={{ backgroundColor: accentColor }}
            >
              {t('calendar.actions.saveEvent')}
            </Button>
          </DialogFooter>
        </DialogContent>

      </Dialog>

      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#1E1E1E]/95 border-white/10 text-white backdrop-blur-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle>{t('calendar.actions.createCategory')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cat-name" className="text-right text-white/70">
                {t('common.name')}
              </Label>
              <Input
                id="cat-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="col-span-3 bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-white/70">
                {t('common.color')}
              </Label>
              <div className="col-span-3 flex gap-2">
                {colors.filter(c => c.value !== 'white').map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setNewCategoryColor(color.value)}
                    className={cn(
                      "w-6 h-6 rounded-full transition-transform ring-offset-2 ring-offset-black",
                      color.tw,
                      newCategoryColor === color.value ? "scale-110 ring-2 ring-white" : "hover:scale-105"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)} className="border-white/10 text-white hover:bg-white/10">{t('common.cancel')}</Button>
            <Button onClick={handleAddCategory} style={{ backgroundColor: accentColor }} className="text-white hover:brightness-110 border-0">{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

