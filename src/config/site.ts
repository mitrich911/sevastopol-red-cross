// Все контактные данные и интеграции сайта — в одном месте.
// Перед запуском замените значения на подтверждённые.

export const site = {
  name: 'Севастопольский Красный Крест',
  unit: 'Патронажная служба и служба милосердия',
  city: 'Севастополь',

  phone: '+7 (8692) 00-00-00',
  phoneHref: 'tel:+78692000000',
  hotline: '8 (800) 000-00-00',
  hotlineHref: 'tel:+78000000000',
  email: 'care@redcross-sevastopol.example',
  address: 'г. Севастополь, ул. Примерная, д. 1',
  hours: [
    { days: 'Пн–Пт', time: '09:00–18:00' },
    { days: 'Сб', time: '10:00–15:00' },
    { days: 'Вс', time: 'выходной' },
  ],
  // Координаты для карты OpenStreetMap
  map: { lat: 44.6166, lon: 33.5254 },

  // Ссылки на мессенджеры. Пустая строка — кнопка не показывается.
  messengers: {
    telegram: '',
    whatsapp: '',
    max: '',
    vk: '',
  },

  // Адрес серверного приёма заявок (см. server/README.md).
  formsEndpoint: (import.meta.env.VITE_FORMS_ENDPOINT as string | undefined) || '',
} as const;

export type ContactMethod = 'phone' | 'sms' | 'max' | 'telegram' | 'whatsapp' | 'email';

export const contactMethods: { value: ContactMethod; label: string }[] = [
  { value: 'phone', label: 'Звонок' },
  { value: 'sms', label: 'SMS' },
  { value: 'max', label: 'MAX' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Электронная почта' },
];
