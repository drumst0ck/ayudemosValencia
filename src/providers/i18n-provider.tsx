"use client";

import { NextIntlClientProvider } from "next-intl";
import { useLocale } from "next-intl";

type Props = {
  children: React.ReactNode;
};

export function I18nProvider({ children }: Props) {
  const locale = useLocale();

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require(`@/messages/${locale}.json`)
      }
    >
      {children}
    </NextIntlClientProvider>
  );
} 