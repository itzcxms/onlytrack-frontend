import { useCallback, useEffect, useState, useRef } from "react";

interface AuthWindow {
  window: Window | null;
  intervalId: number | null;
}

export function useOAuthPopup() {
  const [authWindow, setAuthWindow] = useState<AuthWindow>({
    window: null,
    intervalId: null,
  });
  const [error, setError] = useState<string | null>(null);
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(
    null,
  );

  const cleanup = useCallback(() => {
    if (authWindow.intervalId) {
      clearInterval(authWindow.intervalId);
    }
    if (authWindow.window) {
      authWindow.window.close();
    }
    if (messageHandlerRef.current) {
      window.removeEventListener("message", messageHandlerRef.current);
      messageHandlerRef.current = null;
    }
    setAuthWindow({ window: null, intervalId: null });
  }, [authWindow]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const openPopup = useCallback(
    (url: string) => {
      console.log("useOAuthPopup - Opening popup with URL:", url);
      setError(null);

      // Calculate popup dimensions and position
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2.5;

      // Open popup using _blank to avoid reusing an existing named window
      // which can sometimes lead to immediate close/reuse behavior in some browsers.
      const popup = window.open(
        url,
        "_blank",
        `width=${width},height=${height},left=${left},top=${top},toolbar=0,scrollbars=1,status=1,resizable=1,location=1,menuBar=0`,
      );

      if (!popup) {
        const errorMsg = "Popup blocked! Please allow popups for this site.";
        console.error("useOAuthPopup -", errorMsg);
        setError(errorMsg);
        return;
      }

      console.log("useOAuthPopup - Popup opened successfully");

      // Poll for popup closure
      /*const intervalId = window.setInterval(() => {
      try {
        // Accessing popup.closed can throw if the popup navigated to a domain
        // that restricts access in some browsers; wrap in try/catch.
        if (!popup || popup.closed) {
          cleanup();
          return;
        }
      } catch (e) {
        // If cross-origin navigation causes access errors, assume popup is still open.
        // We'll rely on the user to close it manually or implement postMessage in the callback.
      }
    }, 500);*/

      let oauthCompleted = false;
      let interval: ReturnType<typeof setInterval> | null = null;

      // Listen for postMessage from the OAuth callback page
      const messageHandler = (event: MessageEvent) => {
        // Verify message origin for security
        if (event.origin !== window.location.origin) {
          return;
        }

        if (event.data && event.data.type === "OAUTH_CALLBACK") {
          console.log("OAuth callback message received:", event.data);
          oauthCompleted = true;

          // Clear interval
          if (interval) {
            clearInterval(interval);
            interval = null;
          }

          // Close popup if still open
          if (popup && !popup.closed) {
            popup.close();
          }

          setAuthWindow({ window: null, intervalId: null });

          // Remove message listener
          if (messageHandlerRef.current) {
            window.removeEventListener("message", messageHandlerRef.current);
            messageHandlerRef.current = null;
          }

          // Invalidate queries to refresh OAuth status
          // The page will automatically refresh the OAuth status queries
          // Small delay before reload to ensure callback is processed
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      };

      // Store handler reference for cleanup
      messageHandlerRef.current = messageHandler;

      // Add message listener
      window.addEventListener("message", messageHandler);

      interval = setInterval(() => {
        // Check if popup was closed by user (before OAuth completion)
        if (popup.closed && !oauthCompleted) {
          console.log("Popup closed by user before OAuth completion");
          if (interval) {
            clearInterval(interval);
          }
          if (messageHandlerRef.current) {
            window.removeEventListener("message", messageHandlerRef.current);
            messageHandlerRef.current = null;
          }
          setAuthWindow({ window: null, intervalId: null });
          // Don't reload - user cancelled the OAuth flow
          return;
        }

        // If popup is closed and OAuth was completed, we already handled it
        if (popup.closed && oauthCompleted) {
          return;
        }

        // Fallback: try to detect callback URL (may fail due to cross-origin restrictions)
        try {
          const popupUrl = popup.location.href;

          // Check if popup has navigated to the oauth-callback page
          if (popupUrl.includes("/oauth-callback")) {
            console.log("Popup navigated to oauth-callback URL:", popupUrl);
            // The postMessage handler will take care of closing the popup
          }
        } catch (error) {
          // Cross-origin error - popup is on TikTok/Instagram domain, this is expected
          // This means the user is still in the OAuth flow, keep waiting
          // The postMessage handler will catch the callback
        }
      }, 500);

      setAuthWindow({
        window: popup,
        intervalId: interval as unknown as number,
      });
    },
    [cleanup],
  );

  return {
    openPopup,
    error,
    isOpen: !!authWindow.window && !authWindow.window.closed,
  };
}
