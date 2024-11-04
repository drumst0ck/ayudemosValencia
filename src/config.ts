export type Locale = "es" | "ca";

export const defaultLocale: Locale = "es";
export const locales: Locale[] = ["es", "ca"];

export const pathnames = {
  "/": "/",
  "/admin": "/admin",
} as const;

export type Pathnames = typeof pathnames;
