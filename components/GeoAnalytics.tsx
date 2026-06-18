"use client";

import Script from "next/script";
import { GA_ID } from "@/lib/analytics";

export default function GeoAnalytics() {
  return (
    <Script id="geo-gtag" strategy="lazyOnload">
      {`
        (function() {
          var geo = document.cookie.match(/(?:^|; )_geo_ok=([^;]*)/);
          if (geo && geo[1] === '1') {
            var s = document.createElement('script');
            s.async = true;
            s.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_ID}';
            document.head.appendChild(s);
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          }
        })();
      `}
    </Script>
  );
}
