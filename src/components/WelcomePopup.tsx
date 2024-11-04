"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";

export function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(true);
  const t = useTranslations();

  useEffect(() => {
    const hasSeenWelcome = Cookies.get("hasSeenWelcome");
    if (hasSeenWelcome) {
      setIsVisible(false);
    } else {
      Cookies.set("hasSeenWelcome", "true", { expires: 2 });
    }
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed inset-0 z-[1002] bg-black bg-opacity-50" />
      
      <div className="fixed left-1/2 top-1/2 z-[1003] w-[90%] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-2xl font-bold text-teal-600">
          {t("welcome.title")}
        </h2>
        
        <div className="space-y-4 text-gray-600">
          <p>{t("welcome.description")}</p>
          
          <p>{t("welcome.markerInfo")}</p>
          
          <ul className="ml-6 list-disc space-y-2">
            <li>{t("welcome.features.address")}</li>
            <li>{t("welcome.features.items")}</li>
            <li>{t("welcome.features.schedule")}</li>
            <li>{t("welcome.features.contact")}</li>
          </ul>
          
          <p>{t("welcome.filterTip")}</p>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="mt-6 w-full rounded-lg bg-teal-500 px-4 py-2 text-white transition hover:bg-teal-600"
        >
          {t("welcome.understood")}
        </button>
      </div>
    </>
  );
} 