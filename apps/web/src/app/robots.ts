import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/#product", "/#security", "/#how-it-works", "/#faq", "/login", "/register"],
        disallow: ["/dashboard/", "/files/", "/shared/", "/transfers/", "/storage/", "/settings/", "/api/"],
      },
    ],
    sitemap: "https://neardrop.dev/sitemap.xml",
  };
}
