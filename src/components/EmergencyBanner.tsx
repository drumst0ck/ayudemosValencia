"use client";

import { useTranslations } from "next-intl";

export function EmergencyBanner() {
  const t = useTranslations();

  return (
    <div className="sticky top-0 z-[9999] bg-red-600 p-3 text-center text-white shadow-lg">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-1 sm:flex-row sm:gap-2">
        <p className="font-medium">{t("emergency.title")}</p>
        <a href="tel:900365112" className="text-xl font-bold hover:underline">
          {t("emergency.phone")}
        </a>
      </div>
    </div>
  );
}
