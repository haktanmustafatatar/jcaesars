import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['tr', 'en', 'ru', 'ar', 'fr', 'de', 'gr'],
  defaultLocale: 'tr',
  localePrefix: 'as-needed'
});

export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);
