import { useEffect } from "react";
import { useLocation } from "wouter";

export default function OAuthCallback() {
  const [location] = useLocation();

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get("connected");
    const error = urlParams.get("error");
    const message = urlParams.get("message");

    // Send message to parent window (the one that opened the popup)
    if (window.opener && !window.opener.closed) {
      const result = {
        success: !!connected && !error,
        platform: connected || null,
        error: error || null,
        message: message || null,
      };

      // Send postMessage to parent
      window.opener.postMessage(
        {
          type: "OAUTH_CALLBACK",
          ...result,
        },
        window.location.origin,
      );

      // Close the popup after a short delay
      setTimeout(() => {
        if (window.opener && !window.opener.closed) {
          window.close();
        }
      }, 500);
    } else {
      // If no opener (direct navigation), redirect to dashboard after a delay
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [location]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black via-violet-900/20 to-black">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-display gradient-text">
          Connexion en cours...
        </h2>
        <p className="text-muted-foreground text-sm">
          Cette fenêtre se fermera automatiquement
        </p>
      </div>
    </div>
  );
}
