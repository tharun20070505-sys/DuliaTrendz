import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiEye,
  FiEyeOff,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiArrowRight,
} from 'react-icons/fi';

// Official Multicolor Google G Icon (Preserving exact brand dimensions & colors)
const GoogleOfficialIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
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

const AuthPage = ({ initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [successUser, setSuccessUser] = useState(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Floating label focus state
  const [focusedField, setFocusedField] = useState(null);

  // Error States
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Developer fallback dialog for testing when GIS prompt is blocked or in offline dev
  const [googleDevModalOpen, setGoogleDevModalOpen] = useState(false);
  const [testCredentialInput, setTestCredentialInput] = useState('');

  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = location.state?.from?.pathname || '/';
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Synchronize activeTab if initialTab changes via route
  useEffect(() => {
    setActiveTab(initialTab);
    setGeneralError('');
    setFieldErrors({});
  }, [initialTab]);

  // Initialize Google Identity Services (GSI)
  useEffect(() => {
    if (!googleClientId) return;

    const setupGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
        } catch (err) {
          console.warn('GSI client setup notice:', err);
        }
      }
    };

    if (window.google?.accounts?.id) {
      setupGsi();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          setupGsi();
          clearInterval(interval);
        }
      }, 250);
      return () => clearInterval(interval);
    }
  }, [googleClientId]);

  // Handle Google credential token returned by Google
  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      setGeneralError('Google sign-in was cancelled. Try again.');
      return;
    }

    setGoogleLoading(true);
    setGeneralError('');

    // Strict rule: sends ONLY { credential } to POST /api/auth/google
    const res = await googleLogin({ credential: response.credential });
    setGoogleLoading(false);

    if (res?.success) {
      handleAuthSuccess(res.user);
    } else {
      setGeneralError(res?.error || 'Google sign-in could not be completed. Try again.');
    }
  };

  // Trigger Google Account Chooser
  const triggerGoogleSignIn = () => {
    setGeneralError('');

    if (window.google?.accounts?.id && googleClientId) {
      setGoogleLoading(true);
      try {
        window.google.accounts.id.prompt((notification) => {
          setGoogleLoading(false);
          if (notification.isNotDisplayed()) {
            console.log('Google prompt not displayed, opening credential helper:', notification.getNotDisplayedReason());
            setGoogleDevModalOpen(true);
          } else if (notification.isSkippedMoment() || notification.isDismissedMoment()) {
            setGeneralError('Google sign-in was cancelled. Try again.');
          }
        });
      } catch (err) {
        setGoogleLoading(false);
        setGoogleDevModalOpen(true);
      }
    } else {
      // If GIS client is offline or loading, open helper dialog
      setGoogleDevModalOpen(true);
    }
  };

  const handleDevModalClose = () => {
    setGoogleDevModalOpen(false);
    setGeneralError('Google sign-in was cancelled. Try again.');
  };

  const handleDevCredentialSubmit = async (e) => {
    e.preventDefault();
    if (!testCredentialInput.trim()) return;

    setGoogleLoading(true);
    setGeneralError('');

    const res = await googleLogin({ credential: testCredentialInput.trim() });
    setGoogleLoading(false);

    if (res?.success) {
      setGoogleDevModalOpen(false);
      handleAuthSuccess(res.user);
    } else {
      setGeneralError(res?.error || 'Google sign-in verification failed.');
    }
  };

  // Calculate password strength for sign-up
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: '#dc2626' };
    if (score === 2) return { score: 2, label: 'Fair', color: '#d97706' };
    if (score === 3) return { score: 3, label: 'Good', color: '#6b1432' };
    return { score: 4, label: 'Strong', color: '#16a34a' };
  };

  const passwordStrength = getPasswordStrength(password);

  // Handle successful authentication with checkmark reveal
  const handleAuthSuccess = (authUser) => {
    setSuccessUser(authUser);
    setSuccessAnimation(true);
    setGeneralError('');

    setTimeout(() => {
      if (authUser?.role === 'admin' && destination === '/') {
        navigate('/admin');
      } else {
        navigate(destination, { replace: true });
      }
    }, 1200);
  };

  // Validate form before submission
  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = 'Enter a valid email';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (activeTab === 'signup') {
      if (!name.trim()) {
        errors.name = 'Please enter your full name';
      }

      if (phone && phone.trim().length > 0 && phone.trim().length < 10) {
        errors.phone = 'Enter a valid 10-digit mobile number';
      }

      if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      if (!agreeTerms) {
        errors.terms = 'Please accept the Terms & Privacy Policy to continue';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle email/password submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) return;

    setLoading(true);

    if (activeTab === 'login') {
      const res = await login(email.trim(), password);
      setLoading(false);
      if (res?.success) {
        handleAuthSuccess(res.user);
      } else {
        setGeneralError('Incorrect email or password');
      }
    } else {
      const res = await register(name.trim(), email.trim(), password, phone.trim());
      setLoading(false);
      if (res?.success) {
        handleAuthSuccess(res.user);
      } else {
        setGeneralError(res?.error || 'Registration failed. This email may already have an account.');
      }
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#f5f0ea] font-dm antialiased text-[#292524]">
      {/* ========================================================
          LEFT PANEL (DESKTOP ONLY): Full-height editorial fashion photo (50/50)
          Warm natural light, model in kurti/silk outfit,
          soft wine gradient overlay, white logo at top left,
          and elegant quote at the bottom with slow zoom.
          ======================================================== */}
      <div className="hidden lg:flex relative overflow-hidden bg-[#292524] flex-col justify-between p-12 xl:p-14 text-white">
        {/* Background Editorial Image with Slow Zoom & Fade */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop"
            alt="Dulia Trendz Indian Fashion Editorial"
            className="w-full h-full object-cover animate-slow-zoom animate-fadeIn will-change-transform brightness-[0.96]"
          />
          {/* Soft wine gradient overlay at the bottom and top vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#6b1432] via-[#6b1432]/45 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Top Left: DULIA TRENDZ Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center space-x-3.5 group focus:outline-none focus:ring-2 focus:ring-white/40 rounded-sm">
            <img
              src="/logo.png"
              alt="Dulia Trendz Logo"
              className="w-14 h-14 object-contain rounded-full shadow-lg group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <div className="font-serif font-bold text-white leading-[1.05] tracking-[0.22em] text-[22px] xl:text-[24px] uppercase group-hover:opacity-95 transition-opacity">
                DULIA TRENDZ
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#f5f0ea]/80 font-medium mt-1">
                Your Style, Our Passion
              </span>
            </div>
          </Link>
        </div>

        {/* Bottom Left: Elegant Quote & Luxury Tagline */}
        <div className="relative z-10 space-y-3 max-w-lg">
          <span className="text-[10px] uppercase tracking-[0.28em] text-[#d4af37] font-semibold block">
            INDIAN & WESTERN HAUTE COUTURE
          </span>
          <blockquote className="font-serif text-3xl xl:text-4xl text-white font-normal italic leading-snug drop-shadow-sm">
            “Discover your style.”
          </blockquote>
          <p className="text-xs text-[#f5f0ea]/90 font-light tracking-wide leading-relaxed">
            Curated mulberry silks, artisanal embroidery, and contemporary silhouettes tailored to your confidence.
          </p>
        </div>
      </div>

      {/* ========================================================
          RIGHT PANEL: Cream background (#f5f0ea) with centered
          white card (max width 440px, 20px radius, soft shadow,
          40px padding).
          ======================================================== */}
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-y-auto">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden text-center mb-6">
          <Link to="/" className="inline-flex items-center space-x-3 group focus:outline-none">
            <img
              src="/logo.png"
              alt="Dulia Trendz Logo"
              className="w-12 h-12 object-contain rounded-full shadow-xs"
            />
            <div className="flex flex-col text-left">
              <div className="font-serif font-bold text-[#6b1432] leading-tight tracking-[0.2em] text-[20px] uppercase">
                DULIA TRENDZ
              </div>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#78716c] font-medium mt-0.5">
                Your Style, Our Passion
              </span>
            </div>
          </Link>
        </div>

        {/* Centered White Card (max-w-[440px], 20px radius, 40px padding) */}
        <div className="bg-white max-w-[440px] w-full rounded-[20px] shadow-[0_15px_45px_-10px_rgba(41,37,36,0.08)] border border-[#e7dfd5] p-6 sm:p-8 md:p-[40px] relative transition-all duration-300">
          {/* ================= SUCCESS STATE ANIMATION ================= */}
          {successAnimation ? (
            <div className="py-10 text-center space-y-4 animate-checkmark">
              <div className="w-16 h-16 rounded-full bg-[#fce7f3] border-2 border-[#6b1432] text-[#6b1432] mx-auto flex items-center justify-center shadow-md">
                <FiCheck className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#6b1432]">
                {activeTab === 'login' ? 'Welcome Back!' : 'Welcome to Dulia Trendz!'}
              </h3>
              <p className="text-xs text-[#78716c] max-w-xs mx-auto">
                {successUser?.name
                  ? `Authenticated as ${successUser.name}. Redirecting to your boutique experience...`
                  : 'Authentication successful. Redirecting you shortly...'}
              </p>
              <div className="pt-2">
                <div className="w-24 h-1 bg-[#f5f0ea] mx-auto rounded-full overflow-hidden">
                  <div className="w-full h-full bg-[#6b1432] animate-pulse" />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Card Header: Heading “Welcome back” in Playfair Display, wine color + subtext */}
              <div className="text-center mb-6">
                <h1 className="font-serif text-[28px] sm:text-[30px] font-bold text-[#6b1432] leading-tight">
                  {activeTab === 'login' ? 'Welcome back' : 'Create an Account'}
                </h1>
                <p className="text-xs text-[#78716c] mt-1.5 leading-relaxed font-normal">
                  {activeTab === 'login'
                    ? 'Sign in to track orders, save favourites and checkout faster'
                    : 'Sign up to track orders, save favourites and checkout faster'}
                </p>
              </div>

              {/* Login / Sign Up Pill Toggle with smooth sliding wine active state */}
              <div
                role="tablist"
                aria-label="Authentication Options"
                className="bg-[#f5f0ea] p-1 rounded-full border border-[#e7dfd5] relative flex mb-6 shadow-2xs"
              >
                {/* Sliding active pill background */}
                <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#6b1432] rounded-full transition-all duration-250 ease-out shadow-xs ${
                    activeTab === 'login' ? 'left-1' : 'left-[calc(50%+2px)]'
                  }`}
                />

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'login'}
                  onClick={() => {
                    setActiveTab('login');
                    setGeneralError('');
                    setFieldErrors({});
                  }}
                  className={`flex-1 py-2 text-xs font-semibold uppercase tracking-[0.12em] z-10 transition-colors duration-200 text-center rounded-full focus:outline-none focus:ring-2 focus:ring-[#6b1432]/30 ${
                    activeTab === 'login' ? 'text-white' : 'text-[#292524] hover:text-[#6b1432]'
                  }`}
                >
                  Login
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'signup'}
                  onClick={() => {
                    setActiveTab('signup');
                    setGeneralError('');
                    setFieldErrors({});
                  }}
                  className={`flex-1 py-2 text-xs font-semibold uppercase tracking-[0.12em] z-10 transition-colors duration-200 text-center rounded-full focus:outline-none focus:ring-2 focus:ring-[#6b1432]/30 ${
                    activeTab === 'signup' ? 'text-white' : 'text-[#292524] hover:text-[#6b1432]'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Clear but Gentle Error Banner for Wrong Credentials or Google cancellation */}
              {generalError && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="mb-5 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] rounded-[12px] p-3 text-xs flex items-start space-x-2.5 animate-fadeIn"
                >
                  <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#dc2626]" />
                  <div className="flex-1 text-[11.5px] leading-relaxed font-medium">
                    {generalError}
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeneralError('')}
                    className="text-[#dc2626] hover:opacity-75 p-0.5 focus:outline-none"
                    aria-label="Dismiss error"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* “Continue with Google” Button:
                  Primary social option: full width, white background, 1px light-grey border,
                  official multicolor Google “G” logo on the left, medium-weight charcoal text,
                  52px tall, 12px radius, lifts slightly on hover with soft shadow.
                  Placed at the top, above the email form. */}
              <button
                type="button"
                onClick={triggerGoogleSignIn}
                disabled={googleLoading}
                className="w-full h-[52px] rounded-[12px] bg-white border border-[#e5e7eb] hover:border-[#6b1432]/40 text-[#292524] font-medium text-[14px] flex items-center justify-center space-x-3 transition-all duration-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 mb-6 group focus:outline-none focus:ring-2 focus:ring-[#6b1432]/30 focus:border-[#6b1432] disabled:opacity-60"
                aria-label="Continue with Google"
              >
                {googleLoading ? (
                  <div className="w-5 h-5 border-2 border-[#6b1432] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleOfficialIcon className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="tracking-wide">
                  {googleLoading ? 'Connecting with Google...' : 'Continue with Google'}
                </span>
              </button>

              {/* Divider: “or continue with email” */}
              <div className="relative flex items-center justify-center mb-6">
                <div className="border-t border-[#e7dfd5] w-full" />
                <span className="bg-white px-3 text-[11px] uppercase tracking-[0.16em] text-[#78716c] font-medium absolute">
                  or continue with email
                </span>
              </div>

              {/* Authentication Form with Floating Labels (52px height, 12px radius) */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Sign Up Only: Full Name Field */}
                {activeTab === 'signup' && (
                  <div>
                    <div className="relative h-[52px] rounded-[12px] bg-white">
                      <input
                        id="fullNameInput"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                        }}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        placeholder=" "
                        autoComplete="name"
                        className={`peer w-full h-full rounded-[12px] border ${
                          fieldErrors.name ? 'border-[#dc2626] focus:ring-[#dc2626]/20' : 'border-[#e7dfd5] focus:border-[#6b1432] focus:ring-2 focus:ring-[#6b1432]/25'
                        } px-4 pt-4 pb-1 text-[13px] text-[#292524] bg-white focus:outline-none transition-all`}
                      />
                      <label
                        htmlFor="fullNameInput"
                        className={`absolute left-4 pointer-events-none transition-all duration-200 ease-out select-none ${
                          focusedField === 'name' || Boolean(name)
                            ? 'top-1.5 text-[10px] ' + (focusedField === 'name' ? 'font-semibold text-[#6b1432]' : 'font-medium text-[#78716c]')
                            : 'top-4 text-[13px] text-[#78716c]'
                        }`}
                      >
                        Full Name *
                      </label>
                    </div>
                    {fieldErrors.name && (
                      <p className="text-[#dc2626] text-[11px] font-medium mt-1 flex items-center gap-1 animate-fadeIn">
                        <span>•</span> {fieldErrors.name}
                      </p>
                    )}
                  </div>
                )}

                {/* Email Address Field */}
                <div>
                  <div className="relative h-[52px] rounded-[12px] bg-white">
                    <input
                      id="emailInput"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                      }}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder=" "
                      autoComplete="email"
                      className={`peer w-full h-full rounded-[12px] border ${
                        fieldErrors.email ? 'border-[#dc2626] focus:ring-[#dc2626]/20' : 'border-[#e7dfd5] focus:border-[#6b1432] focus:ring-2 focus:ring-[#6b1432]/25'
                      } px-4 pt-4 pb-1 text-[13px] text-[#292524] bg-white focus:outline-none transition-all`}
                    />
                    <label
                      htmlFor="emailInput"
                      className={`absolute left-4 pointer-events-none transition-all duration-200 ease-out select-none ${
                        focusedField === 'email' || Boolean(email)
                          ? 'top-1.5 text-[10px] ' + (focusedField === 'email' ? 'font-semibold text-[#6b1432]' : 'font-medium text-[#78716c]')
                          : 'top-4 text-[13px] text-[#78716c]'
                      }`}
                    >
                      Email address *
                    </label>
                  </div>
                  {fieldErrors.email && (
                    <p className="text-[#dc2626] text-[11px] font-medium mt-1 flex items-center gap-1 animate-fadeIn">
                      <span>•</span> {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Sign Up Only: Mobile Number Field */}
                {activeTab === 'signup' && (
                  <div>
                    <div className="relative h-[52px] rounded-[12px] bg-white">
                      <input
                        id="phoneInput"
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
                        }}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                        placeholder=" "
                        autoComplete="tel"
                        className={`peer w-full h-full rounded-[12px] border ${
                          fieldErrors.phone ? 'border-[#dc2626] focus:ring-[#dc2626]/20' : 'border-[#e7dfd5] focus:border-[#6b1432] focus:ring-2 focus:ring-[#6b1432]/25'
                        } px-4 pt-4 pb-1 text-[13px] text-[#292524] bg-white focus:outline-none transition-all`}
                      />
                      <label
                        htmlFor="phoneInput"
                        className={`absolute left-4 pointer-events-none transition-all duration-200 ease-out select-none ${
                          focusedField === 'phone' || Boolean(phone)
                            ? 'top-1.5 text-[10px] ' + (focusedField === 'phone' ? 'font-semibold text-[#6b1432]' : 'font-medium text-[#78716c]')
                            : 'top-4 text-[13px] text-[#78716c]'
                        }`}
                      >
                        Mobile number (optional)
                      </label>
                    </div>
                    {fieldErrors.phone && (
                      <p className="text-[#dc2626] text-[11px] font-medium mt-1 flex items-center gap-1 animate-fadeIn">
                        <span>•</span> {fieldErrors.phone}
                      </p>
                    )}
                  </div>
                )}

                {/* Password Field with Show/Hide Eye Icon */}
                <div>
                  <div className="relative h-[52px] rounded-[12px] bg-white">
                    <input
                      id="passwordInput"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                      }}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder=" "
                      autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                      className={`peer w-full h-full rounded-[12px] border ${
                        fieldErrors.password ? 'border-[#dc2626] focus:ring-[#dc2626]/20' : 'border-[#e7dfd5] focus:border-[#6b1432] focus:ring-2 focus:ring-[#6b1432]/25'
                      } pl-4 pr-11 pt-4 pb-1 text-[13px] text-[#292524] bg-white focus:outline-none transition-all`}
                    />
                    <label
                      htmlFor="passwordInput"
                      className={`absolute left-4 pointer-events-none transition-all duration-200 ease-out select-none ${
                        focusedField === 'password' || Boolean(password)
                          ? 'top-1.5 text-[10px] ' + (focusedField === 'password' ? 'font-semibold text-[#6b1432]' : 'font-medium text-[#78716c]')
                          : 'top-4 text-[13px] text-[#78716c]'
                      }`}
                    >
                      Password *
                    </label>

                    {/* Show/Hide Eye toggle button */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#6b1432] p-1 focus:outline-none focus:ring-1 focus:ring-[#6b1432] rounded-md transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-[#dc2626] text-[11px] font-medium mt-1 flex items-center gap-1 animate-fadeIn">
                      <span>•</span> {fieldErrors.password}
                    </p>
                  )}

                  {/* Password Strength Meter (Sign Up tab only) */}
                  {activeTab === 'signup' && password.length > 0 && (
                    <div className="mt-2.5 space-y-1.5 animate-fadeIn">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#78716c]">Password strength:</span>
                        <span
                          className="font-semibold uppercase tracking-wider text-[10px]"
                          style={{ color: passwordStrength.color }}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 h-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              backgroundColor:
                                passwordStrength.score >= step
                                  ? passwordStrength.color
                                  : '#e7dfd5',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sign Up Only: Confirm Password Field */}
                {activeTab === 'signup' && (
                  <div>
                    <div className="relative h-[52px] rounded-[12px] bg-white">
                      <input
                        id="confirmPasswordInput"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (fieldErrors.confirmPassword)
                            setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                        }}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        placeholder=" "
                        autoComplete="new-password"
                        className={`peer w-full h-full rounded-[12px] border ${
                          fieldErrors.confirmPassword ? 'border-[#dc2626] focus:ring-[#dc2626]/20' : 'border-[#e7dfd5] focus:border-[#6b1432] focus:ring-2 focus:ring-[#6b1432]/25'
                        } pl-4 pr-11 pt-4 pb-1 text-[13px] text-[#292524] bg-white focus:outline-none transition-all`}
                      />
                      <label
                        htmlFor="confirmPasswordInput"
                        className={`absolute left-4 pointer-events-none transition-all duration-200 ease-out select-none ${
                          focusedField === 'confirmPassword' || Boolean(confirmPassword)
                            ? 'top-1.5 text-[10px] ' + (focusedField === 'confirmPassword' ? 'font-semibold text-[#6b1432]' : 'font-medium text-[#78716c]')
                            : 'top-4 text-[13px] text-[#78716c]'
                        }`}
                      >
                        Confirm Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#6b1432] p-1 focus:outline-none focus:ring-1 focus:ring-[#6b1432] rounded-md transition-colors"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff className="w-4 h-4" />
                        ) : (
                          <FiEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-[#dc2626] text-[11px] font-medium mt-1 flex items-center gap-1 animate-fadeIn">
                        <span>•</span> {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                )}

                {/* Sub-actions: Checkboxes & Forgot Password link */}
                <div className="flex items-center justify-between text-xs pt-1">
                  {activeTab === 'login' ? (
                    <>
                      {/* Small checkbox: “Keep me signed in” */}
                      <label className="flex items-center space-x-2 cursor-pointer text-[#292524] select-none">
                        <input
                          type="checkbox"
                          checked={keepSignedIn}
                          onChange={(e) => setKeepSignedIn(e.target.checked)}
                          className="rounded border-[#e7dfd5] text-[#6b1432] focus:ring-[#6b1432] w-3.5 h-3.5 accent-[#6b1432]"
                        />
                        <span className="text-[12px] text-[#78716c]">Keep me signed in</span>
                      </label>

                      {/* “Forgot password?” link on the right in wine */}
                      <Link
                        to="/forgot-password"
                        className="text-[#6b1432] hover:underline text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-[#6b1432] rounded-xs"
                      >
                        Forgot password?
                      </Link>
                    </>
                  ) : (
                    <>
                      {/* Sign Up Terms Checkbox */}
                      <label className="flex items-start space-x-2 cursor-pointer text-[#292524] select-none text-[11.5px] leading-tight">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => {
                            setAgreeTerms(e.target.checked);
                            if (fieldErrors.terms) setFieldErrors({ ...fieldErrors, terms: '' });
                          }}
                          className="rounded border-[#e7dfd5] text-[#6b1432] focus:ring-[#6b1432] w-3.5 h-3.5 mt-0.5 accent-[#6b1432]"
                        />
                        <span className="text-[#78716c]">
                          I agree to the{' '}
                          <Link to="/terms" className="text-[#6b1432] underline hover:text-[#540d24]">
                            Terms & Conditions
                          </Link>{' '}
                          and{' '}
                          <Link to="/privacy" className="text-[#6b1432] underline hover:text-[#540d24]">
                            Privacy Policy
                          </Link>
                        </span>
                      </label>
                    </>
                  )}
                </div>
                {activeTab === 'signup' && fieldErrors.terms && (
                  <p className="text-[#dc2626] text-[11px] font-medium -mt-1 flex items-center gap-1 animate-fadeIn">
                    <span>•</span> {fieldErrors.terms}
                  </p>
                )}

                {/* Primary Wine Button with subtle gold shine on hover */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[52px] rounded-[12px] bg-[#6b1432] hover:bg-[#540d24] text-white uppercase tracking-[0.18em] font-semibold text-[13px] sm:text-[14px] shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2 relative overflow-hidden group disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#6b1432]/40 mt-2"
                >
                  {/* Subtle Gold Shimmer Sweep across the button on hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-[#d4af37]/35 to-transparent transition-transform duration-700 ease-in-out pointer-events-none" />

                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{activeTab === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
                    </div>
                  ) : (
                    <span>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                  )}
                </button>
              </form>

              {/* Optional Guest Checkout Link: “Continue as guest” */}
              <div className="text-center mt-3.5">
                <Link
                  to="/checkout"
                  className="text-[12px] text-[#78716c] hover:text-[#6b1432] transition-colors underline-offset-4 hover:underline focus:outline-none focus:ring-1 focus:ring-[#6b1432] rounded-xs"
                >
                  Continue as guest →
                </Link>
              </div>

              {/* Footer Switch Line */}
              <div className="text-center border-t border-[#f5f0ea] pt-4 mt-4 text-xs text-[#78716c]">
                {activeTab === 'login' ? (
                  <p>
                    New to Dulia Trendz?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('signup');
                        setGeneralError('');
                        setFieldErrors({});
                      }}
                      className="font-semibold text-[#6b1432] hover:underline focus:outline-none focus:ring-1 focus:ring-[#6b1432] rounded-xs"
                    >
                      Create an account
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('login');
                        setGeneralError('');
                        setFieldErrors({});
                      }}
                      className="font-semibold text-[#6b1432] hover:underline focus:outline-none focus:ring-1 focus:ring-[#6b1432] rounded-xs"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Trust Strip below the card, in small grey text with icons:
            🔒 Secure checkout · 🚚 Free shipping above ₹999 · ↩ Easy returns */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-[#78716c] tracking-wide select-none">
          <div className="flex items-center space-x-1.5">
            <span>🔒</span>
            <span>Secure checkout</span>
          </div>
          <span className="text-[#d5ccc0]">·</span>
          <div className="flex items-center space-x-1.5">
            <span>🚚</span>
            <span>Free shipping above ₹999</span>
          </div>
          <span className="text-[#d5ccc0]">·</span>
          <div className="flex items-center space-x-1.5">
            <span>↩</span>
            <span>Easy returns</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          DEVELOPER CREDENTIAL HELPER DIALOG
          Opens only when GIS one-tap is blocked by browser policies
          or for testing Google ID token validation end-to-end.
          Sends ONLY { credential } to POST /api/auth/google.
          ======================================================== */}
      {googleDevModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292524]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-[16px] shadow-2xl max-w-md w-full p-6 sm:p-7 border border-[#e7dfd5] relative animate-scaleUp text-[#292524]">
            {/* Close Modal Button */}
            <button
              type="button"
              onClick={handleDevModalClose}
              className="absolute top-4 right-4 text-[#78716c] hover:text-[#292524] p-1.5 rounded-full hover:bg-[#f5f0ea] transition-colors focus:outline-none"
              aria-label="Close Google Sign In"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Official Google Brand Header */}
            <div className="text-center pb-4 border-b border-[#f5f0ea]">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#f5f0ea] mb-2 shadow-2xs border border-[#e7dfd5]">
                <GoogleOfficialIcon className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#292524]">Sign in with Google</h3>
              <p className="text-xs text-[#78716c] mt-0.5">
                Google Identity Services Token Verification for{' '}
                <span className="font-semibold text-[#6b1432]">Dulia Trendz</span>
              </p>
            </div>

            <form onSubmit={handleDevCredentialSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#292524] mb-1">
                  Google ID Token Credential <span className="text-[#6b1432]">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={testCredentialInput}
                  onChange={(e) => setTestCredentialInput(e.target.value)}
                  placeholder="Paste signed Google ID token (eyJhbGciOiJSUzI1NiIs...) returned from Google"
                  className="w-full text-xs p-3 bg-[#f5f0ea]/50 border border-[#e7dfd5] rounded-[10px] focus:outline-none focus:border-[#6b1432] focus:ring-1 focus:ring-[#6b1432] font-mono"
                  autoFocus
                />
                <span className="text-[10px] text-[#78716c] block mt-1">
                  The client sends ONLY this credential token to the server. The backend verifies signature, expiration, audience, and email verification.
                </span>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={handleDevModalClose}
                  className="w-1/2 py-2.5 px-3 border border-[#e7dfd5] text-[#78716c] hover:bg-[#f5f0ea] text-xs font-semibold rounded-[10px] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={googleLoading || !testCredentialInput.trim()}
                  className="w-1/2 py-2.5 px-3 bg-[#6b1432] hover:bg-[#540d24] text-white text-xs font-semibold uppercase tracking-wider rounded-[10px] shadow-sm transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <span>{googleLoading ? 'Verifying...' : 'Verify Token'}</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-[#f5f0ea] text-center">
              <p className="text-[10px] text-[#78716c] leading-relaxed">
                Tokens are verified against Google's public certificates via <code className="font-mono text-[#6b1432]">google-auth-library</code>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
