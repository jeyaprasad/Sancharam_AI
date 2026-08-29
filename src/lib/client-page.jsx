import React, { Suspense, useEffect, useState } from "react";

// Wraps a page that depends on browser-only libs (Leaflet) so it is only
// imported and rendered on the client, never during SSR.
export function clientOnly(importer) {
  const Lazy = React.lazy(importer);
  return function ClientOnlyPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) {
      return <div style={{ minHeight: "100vh", background: "#0e0e17" }} />;
    }
    return (
      <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0e0e17" }} />}>
        <Lazy />
      </Suspense>
    );
  };
}
