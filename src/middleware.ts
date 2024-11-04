import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["es", "ca"],
  defaultLocale: "es",
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
