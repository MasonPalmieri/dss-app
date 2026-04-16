import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./index.css";

Sentry.init({
  dsn: "https://a2181d46ad751a341a93d8efab226c77@o4511224410996736.ingest.us.sentry.io/4511224421416960",
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD, // Only track errors in production, not local dev
  tracesSampleRate: 0.2, // 20% of transactions for performance monitoring
  beforeSend(event) {
    const msg = event.exception?.values?.[0]?.value || '';
    // Suppress Supabase internal auth lock errors (multi-tab conflict, harmless)
    if (msg.includes('Lock') && msg.includes('sb-') && msg.includes('auth-token')) return null;
    if (msg.includes('Lock broken by another request')) return null;
    return event;
  },
});

if (!window.location.hash) {
  window.location.hash = "#/";
}

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary fallback={
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d1117' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <p style={{ fontSize: 18, fontWeight: 700 }}>Something went wrong</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>Refreshing the page usually fixes this.</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: 20, background: '#c8210d', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
          Refresh Page
        </button>
      </div>
    </div>
  }>
    <App />
  </Sentry.ErrorBoundary>
);
