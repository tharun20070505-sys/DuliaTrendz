import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

// Official Multicolor Google G icon SVG
export const GoogleIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

const GoogleAuthButton = ({
  text = 'Continue with Google',
  onSuccess,
  onError,
  className = '',
}) => {
  const { googleLogin } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Initialize Google Identity Services (GSI)
  useEffect(() => {
    if (!googleClientId) return;

    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response) => {
              if (response.credential) {
                setSubmitting(true);
                // Send ONLY the signed Google ID token credential to backend
                const res = await googleLogin({ credential: response.credential });
                setSubmitting(false);

                if (res?.success) {
                  if (onSuccess) onSuccess(res.user);
                } else {
                  if (onError) onError(res?.error || 'Google sign-in failed');
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });
        } catch (err) {
          console.warn('GSI client initialization notice:', err);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGsi();
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [googleClientId, onSuccess, onError]);

  const handleClick = () => {
    if (window.google?.accounts?.id && googleClientId) {
      setSubmitting(true);
      window.google.accounts.id.prompt((notification) => {
        setSubmitting(false);
        if (notification.isSkippedMoment() || notification.isDismissedMoment()) {
          if (onError) onError('Google sign-in was cancelled. Try again.');
        }
      });
    } else {
      console.warn('Google Identity Services client is not initialized');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={submitting}
      className={`w-full h-[52px] rounded-[12px] bg-white border border-[#e5e7eb] hover:border-[#6b1432]/40 text-[#292524] font-medium text-[14px] flex items-center justify-center space-x-3 transition-all duration-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 group focus:outline-none focus:ring-2 focus:ring-[#6b1432]/30 disabled:opacity-50 ${className}`}
      aria-label="Continue with Google"
    >
      {submitting ? (
        <div className="w-5 h-5 border-2 border-[#6b1432] border-t-transparent rounded-full animate-spin" />
      ) : (
        <GoogleIcon className="w-5 h-5 flex-shrink-0" />
      )}
      <span className="tracking-wide">
        {submitting ? 'Connecting with Google...' : text}
      </span>
    </button>
  );
};

export default GoogleAuthButton;
