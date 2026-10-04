'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  Sprout, 
  ArrowRight, 
  Check, 
  Plus, 
  Trash2, 
  Edit2, 
  ArrowLeft,
  Milk,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Phone,
  KeyRound,
  RotateCcw,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon
} from 'lucide-react';
import { useFarmer, FieldInput, LivestockInput } from '@/context/FarmerContext';
import { FarmType, LanguageCode } from '@/types';
import { 
  setupRecaptcha, 
  sendPhoneOtp, 
  verifyOtpCode, 
  isFirebaseConfigured,
} from '@/lib/firebase';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import {
  backendRegister,
  backendLogin,
  backendForgotPassword,
} from '@/lib/authApi';

export const OnboardingWizard: React.FC = () => {
  const { setLanguage, completeOnboarding, setAuthSession, showToast, profile } = useFarmer();
  
  // EXACT 9-STEP STATE MACHINE
  // 1: Splash Screen
  // 2: Language Selection
  // 3: Login / Registration
  // 4: OTP Verification
  // 5: Farmer Profile
  // 6: Farm Type (Crop, Dairy, Both)
  // 7: Land & Crops Setup (Conditional on Crop/Both)
  // 8: Livestock Setup (Conditional on Dairy/Both)
  // 9: Setup Complete
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Profile Form States
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('en');
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [farmerName, setFarmerName] = useState('Ramesh');
  const [stateName, setStateName] = useState('Karnataka');
  const [district, setDistrict] = useState('Ballari');
  const [village, setVillage] = useState('Hosapete');
  const [farmType, setFarmType] = useState<FarmType>('mixed');

  // Firebase Phone & Email Auth States
  const [authMode, setAuthMode] = useState<'phone' | 'email-login' | 'email-register' | 'forgot-password'>('phone');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Email/Password States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Screen 7: Dynamic Multiple Land & Crops Setup
  const [fields, setFields] = useState<FieldInput[]>([
    { name: 'Field 1', acres: 2, cropName: 'Maize', variety: 'Kaveri 50' },
    { name: 'Field 2', acres: 3, cropName: 'Tomato', variety: 'Abhinav Hybrid' },
  ]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldAcres, setNewFieldAcres] = useState('');
  const [newFieldCrop, setNewFieldCrop] = useState('Chilli');
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);

  // Screen 8: Dynamic Livestock Setup
  const [livestock, setLivestock] = useState<LivestockInput[]>([
    { type: 'Cow (HF)', breed: 'Holstein Friesian', count: 2 },
    { type: 'Buffalo', breed: 'Murrah', count: 1 },
  ]);
  const [newAnimalType, setNewAnimalType] = useState<'Cow (HF)' | 'Cow (Jersey)' | 'Buffalo' | 'Goat'>('Cow (Jersey)');
  const [newAnimalCount, setNewAnimalCount] = useState('1');
  const [showAddAnimalForm, setShowAddAnimalForm] = useState(false);

  const languages = [
    { code: 'en' as LanguageCode, label: 'English', flag: '🇬🇧' },
    { code: 'hi' as LanguageCode, label: 'हिंदी', sub: 'Hindi', flag: '🇮🇳' },
    { code: 'kn' as LanguageCode, label: 'ಕನ್ನಡ', sub: 'Kannada', flag: '🇮🇳' },
    { code: 'te' as LanguageCode, label: 'తెలుగు', sub: 'Telugu', flag: '🇮🇳' },
    { code: 'ta' as LanguageCode, label: 'தமிழ்', sub: 'Tamil', flag: '🇮🇳' },
    { code: 'mr' as any, label: 'मराठी', sub: 'Marathi', flag: '🇮🇳' },
  ];

  // Logic to handle next step based on farm type
  const handleProceedFromFarmType = () => {
    if (farmType === 'dairy') {
      // Dairy only skips crop fields setup
      setCurrentStep(8);
    } else {
      // Crop or Mixed goes to Land & Crops setup
      setCurrentStep(7);
    }
  };

  const handleProceedFromCrops = () => {
    if (farmType === 'crop') {
      // Crop only skips livestock setup directly to complete
      setCurrentStep(9);
    } else {
      // Mixed goes to livestock setup
      setCurrentStep(8);
    }
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim() || !newFieldAcres) return;
    setFields([
      ...fields,
      {
        name: newFieldName.trim(),
        acres: parseFloat(newFieldAcres) || 1,
        cropName: newFieldCrop,
      }
    ]);
    setNewFieldName('');
    setNewFieldAcres('');
    setShowAddFieldForm(false);
  };

  const handleAddAnimal = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(newAnimalCount, 10) || 1;
    setLivestock([
      ...livestock,
      {
        type: newAnimalType,
        breed: newAnimalType.includes('Buffalo') ? 'Murrah' : 'Crossbreed',
        count,
      }
    ]);
    setShowAddAnimalForm(false);
  };

  // ---------------- FIREBASE PHONE AUTH HANDLERS ----------------
  const handleSendOtp = async () => {
    setAuthError(null);
    const cleanPhone = phone.trim();
    if (cleanPhone.length !== 10 || !/^\d{10}$/.test(cleanPhone)) {
      setAuthError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    setIsSendingOtp(true);
    try {
      let verifier = recaptchaVerifierRef.current;
      if (!verifier && typeof window !== 'undefined' && isFirebaseConfigured()) {
        verifier = setupRecaptcha('recaptcha-container');
        recaptchaVerifierRef.current = verifier;
      }

      const fullPhone = `+91${cleanPhone}`;
      const result = await sendPhoneOtp(fullPhone, verifier);

      if (result.success && result.confirmationResult) {
        setConfirmationResult(result.confirmationResult);
        setResendCooldown(60);
        setOtp(['', '', '', '', '', '']);
        setCurrentStep(4);
        showToast(`Verification code sent to +91 ${cleanPhone}`);
      } else {
        setAuthError(result.error || 'Failed to send OTP. Please check the mobile number and retry.');
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setAuthError(e?.message || 'Error initiating phone verification.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSendingOtp) return;
    await handleSendOtp();
  };

  const handleVerifyOtp = async () => {
    setAuthError(null);
    const code = otp.join('');
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setAuthError('Please enter all 6 digits of your verification code.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await verifyOtpCode(confirmationResult, code);
      if (res.success && res.user) {
        setAuthSession({
          uid: res.user.uid,
          phoneNumber: res.user.phoneNumber || `+91${phone}`,
          isAuthenticated: true,
        });
        showToast('Phone number verified successfully with Firebase!');
        setCurrentStep(5);
      } else {
        setAuthError(res.error || 'Invalid OTP code. Please check and try again.');
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setAuthError(e?.message || 'Verification failed. Please check the code.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // ---------------- NATIVE FASTAPI EMAIL AUTH HANDLERS ----------------
  const handleEmailLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    setForgotSuccessMessage(null);
    const cleanEmail = email.trim();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setAuthError('Please enter your password.');
      return;
    }

    setIsSubmittingEmail(true);
    try {
      const res = await backendLogin(cleanEmail, password);
      if (res.success && res.user) {
        const newSession = {
          uid: res.user.id,
          phoneNumber: res.profile?.phone_number || null,
          email: res.user.email,
          displayName: res.user.full_name || profile?.name || null,
          isAuthenticated: true,
        };
        setAuthSession(newSession);

        if (res.profile && res.profile.onboarded) {
          // Returning farmer with existing farm data
          completeOnboarding({
            ...profile,
            name: res.profile.name || res.user.full_name,
            email: res.user.email,
            phoneNumber: res.profile.phone_number || profile?.phoneNumber || '',
            location: {
              state: res.profile.state || profile?.location?.state || 'Karnataka',
              district: res.profile.district || profile?.location?.district || 'Ballari',
              village: res.profile.village || profile?.location?.village || 'Hosapete',
            },
            farmType: (res.profile.farm_type as any) || profile?.farmType || 'mixed',
            landAreaAcres: res.profile.land_area_acres ?? profile?.landAreaAcres ?? 5,
            cattleCount: res.profile.cattle_count ?? profile?.cattleCount ?? 3,
            language: (res.profile.language as any) || profile?.language || 'en',
            onboarded: true,
          });
          showToast(`Welcome back, ${res.user.full_name}!`);
        } else {
          // New user continues onboarding wizard
          if (res.user.full_name) {
            setFarmerName(res.user.full_name);
          }
          showToast('Signed in successfully! Continue profile setup.');
          setCurrentStep(5);
        }
      } else {
        setAuthError(res.error || 'Failed to sign in. Please verify your email and password.');
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setAuthError(e?.message || 'Authentication error.');
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handleEmailRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    setForgotSuccessMessage(null);
    const cleanName = regFullName.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setAuthError('Please enter your full name.');
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmittingEmail(true);
    try {
      const res = await backendRegister(cleanName, cleanEmail, password);
      if (res.success && res.user) {
        setAuthSession({
          uid: res.user.id,
          phoneNumber: null,
          email: res.user.email,
          displayName: cleanName,
          isAuthenticated: true,
        });
        setFarmerName(cleanName);
        showToast(`Account created for ${cleanName}! Continue to profile setup.`);
        setCurrentStep(5);
      } else {
        setAuthError(res.error || 'Failed to create account.');
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setAuthError(e?.message || 'Registration error.');
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handleForgotPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    setForgotSuccessMessage(null);
    const cleanEmail = email.trim();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    setIsSubmittingEmail(true);
    try {
      const res = await backendForgotPassword(cleanEmail);
      if (res.success) {
        setForgotSuccessMessage(res.message);
      } else {
        setAuthError('Unable to process password reset request.');
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setAuthError(e?.message || 'Error requesting password reset.');
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const digitsOnly = val.replace(/\D/g, '');
    if (digitsOnly.length > 1) {
      const nextOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        if (digitsOnly[i]) {
          nextOtp[i] = digitsOnly[i];
        }
      }
      setOtp(nextOtp);
      const targetIdx = Math.min(5, digitsOnly.length - 1);
      const el = document.getElementById(`otp-input-${targetIdx}`);
      if (el) (el as HTMLInputElement).focus();
      return;
    }

    const next = [...otp];
    next[index] = digitsOnly.slice(-1);
    setOtp(next);

    if (digitsOnly && index < 5) {
      const nextEl = document.getElementById(`otp-input-${index + 1}`);
      if (nextEl) (nextEl as HTMLInputElement).focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevEl = document.getElementById(`otp-input-${index - 1}`);
      if (prevEl) (prevEl as HTMLInputElement).focus();
    }
  };

  const handleFinish = () => {
    completeOnboarding(
      {
        name: farmerName,
        phoneNumber: phone,
        location: {
          state: stateName,
          district: district,
          village: village,
        },
        farmType,
        language: selectedLang,
      },
      farmType === 'dairy' ? [] : fields,
      farmType === 'crop' ? [] : livestock
    );
  };

  return (
    <div className="flex-1 w-full flex flex-col justify-between bg-white text-stone-900 min-h-screen sm:min-h-[720px] max-w-[430px] mx-auto">
      
      {/* ================= SCREEN 1: SPLASH SCREEN ================= */}
      {currentStep === 1 && (
        <div className="relative flex-1 w-full flex flex-col justify-between p-4 sm:p-6 text-center animate-in fade-in overflow-hidden min-h-[100dvh] sm:min-h-[720px] max-w-[430px] mx-auto select-none">
          {/* LAYER 1: Full-Screen Illustrated Farmland Background */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <Image
              src="/images/kshetraone-splash-illustration.png"
              alt="KshetraOne Illustrated Farmland Background"
              fill
              priority
              sizes="(max-width: 430px) 100vw, 430px"
              className="object-cover object-bottom select-none"
            />
          </div>

          {/* LAYER 2: Branding Section */}
          <div className="relative z-10 pt-6 sm:pt-10 shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-700 text-white rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-700/20 mb-3 sm:mb-4 ring-4 ring-emerald-100">
              <Sprout className="w-9 h-9 sm:w-11 sm:h-11 text-emerald-200" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight drop-shadow-sm">
              KshetraOne
            </h1>
            <p className="text-[11px] sm:text-xs font-semibold text-emerald-800 mt-1 uppercase tracking-wider">
              One Ecosystem. Every Farm. Every Day.
            </p>
          </div>

          {/* LAYER 3: Farmer Information Card with Smartphone Photo */}
          <div className="relative z-10 my-auto py-2 w-full shrink-0 flex items-center justify-center">
            <div
              className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-white/80 flex flex-col justify-end p-4 text-left transition-all"
              style={{ height: 'clamp(155px, 23vh, 215px)' }}
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src="/images/kshetraone-farmer-card.jpg"
                  alt="Indian farmer in farmland using smartphone"
                  fill
                  priority
                  sizes="(max-width: 430px) 100vw, 430px"
                  className="object-cover object-[78%_center] select-none"
                />
                {/* Dark green gradient overlay at the bottom so white text remains readable */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/65 to-emerald-950/20" />
              </div>

              <div className="relative z-10 text-white">
                <span className="text-[10px] font-bold bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full uppercase tracking-wider text-emerald-100 border border-white/20 inline-block shadow-sm">
                  Agri + Dairy + Market
                </span>
                <p className="font-bold text-base sm:text-lg mt-1.5 drop-shadow-md text-white tracking-tight">
                  Smart rural operating platform
                </p>
                <p className="text-xs text-emerald-100/90 mt-0.5 drop-shadow font-medium">
                  Built for Indian Farmers
                </p>
              </div>
            </div>
          </div>

          {/* LAYER 4: Action Button Section */}
          <div className="relative z-10 pb-4 sm:pb-6 shrink-0">
            <button
              onClick={() => setCurrentStep(2)}
              className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-lg shadow-emerald-900/30 active:scale-98 transition-all flex items-center justify-center gap-2 border border-emerald-600/30"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= SCREEN 2: LANGUAGE SELECTION ================= */}
      {currentStep === 2 && (
        <div className="flex-1 flex flex-col justify-between p-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-stone-900 mb-1">Choose Your Language</h2>
            <p className="text-xs text-stone-500 mb-4">Select the language you are most comfortable with</p>

            <div className="space-y-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setSelectedLang(l.code);
                    setLanguage(l.code);
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    selectedLang === l.code
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{l.flag}</span>
                    <div>
                      <p className="text-sm font-bold">{l.label}</p>
                      {l.sub && <p className="text-[11px] text-stone-500">{l.sub}</p>}
                    </div>
                  </div>
                  {selectedLang === l.code && <Check className="w-5 h-5 text-emerald-700" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={() => setCurrentStep(1)}
              className="w-1/3 h-12 border border-stone-300 font-bold text-xs rounded-2xl text-stone-700"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex-1 h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-md active:scale-98 transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ================= SCREEN 3: LOGIN / REGISTRATION ================= */}
      {currentStep === 3 && (
        <div className="flex-1 flex flex-col justify-between p-6 animate-in fade-in">
          <div>
            {/* Header dynamically reflects authMode */}
            {authMode === 'phone' && (
              <>
                <h2 className="text-xl font-black text-stone-900 mb-1">Welcome to KshetraOne</h2>
                <p className="text-xs text-stone-500 mb-4">Login or create your account using your mobile number</p>
              </>
            )}

            {authMode === 'email-login' && (
              <>
                <h2 className="text-xl font-black text-stone-900 mb-1">Email Sign In</h2>
                <p className="text-xs text-stone-500 mb-4">Login with your registered email and password</p>
              </>
            )}

            {authMode === 'email-register' && (
              <>
                <h2 className="text-xl font-black text-stone-900 mb-1">Create Farmer Account</h2>
                <p className="text-xs text-stone-500 mb-4">Register with email to manage your farm and crops</p>
              </>
            )}

            {authMode === 'forgot-password' && (
              <>
                <h2 className="text-xl font-black text-stone-900 mb-1">Reset Password</h2>
                <p className="text-xs text-stone-500 mb-4">Enter your registered email to receive a password reset link</p>
              </>
            )}

            {/* Zero-Cost Development Mode Info Banner */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl mb-4 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Connected: firstproject-3c5ca3b6 (₹0 Budget)</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                {authMode === 'phone' ? (
                  <>Carrier SMS billing is strictly avoided. Uses Firebase Console test phone numbers (e.g. <span className="font-semibold text-stone-900">+91 9876543210</span>) with fixed test verification codes at <span className="font-bold text-emerald-950">₹0 cost</span>.</>
                ) : (
                  <>Email/Password authentication runs on the Firebase Spark Free Tier with unlimited free users at <span className="font-bold text-emerald-950">₹0 cost</span>.</>
                )}
              </p>
            </div>

            {/* Success Message Alert (e.g. Forgot Password confirmation) */}
            {forgotSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl mb-4 text-xs flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span className="leading-snug">{forgotSuccessMessage}</span>
              </div>
            )}

            {/* Error Message Alert */}
            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl mb-4 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{authError}</span>
              </div>
            )}

            {/* ---------------- MODE 1: PHONE NUMBER OTP ---------------- */}
            {authMode === 'phone' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Indian Mobile Number</label>
                  <div className="flex items-center gap-2">
                    <div className="h-12 px-3 bg-stone-100 rounded-xl border border-stone-200 text-stone-700 text-sm font-bold flex items-center shrink-0">
                      +91
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setAuthError(null);
                        setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendOtp();
                      }}
                      maxLength={10}
                      className="flex-1 h-12 px-3 bg-white rounded-xl border border-stone-200 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 tracking-wide"
                      placeholder="98765 43210"
                      disabled={isSendingOtp}
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1 pl-1">
                    10-digit mobile number linked to Aadhaar or Kisan Credit Card
                  </p>
                </div>

                {/* Invisible/Attached reCAPTCHA container for Firebase */}
                <div id="recaptcha-container" className="my-1"></div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || phone.trim().length !== 10}
                  className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4" />
                      <span>Send OTP</span>
                    </>
                  )}
                </button>

                {/* Clean Separator between Phone OTP and Email */}
                <div className="relative my-3 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200"></div>
                  </div>
                  <span className="relative bg-white px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Or continue with
                  </span>
                </div>

                {/* Continue with Email Button */}
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setForgotSuccessMessage(null);
                    setAuthMode('email-login');
                  }}
                  className="w-full h-12 bg-white hover:bg-stone-50 text-stone-800 font-bold rounded-2xl border border-stone-300 shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Mail className="w-4 h-4 text-emerald-700" />
                  <span>Continue with Email</span>
                </button>
              </div>
            )}

            {/* ---------------- MODE 2: EMAIL LOGIN ---------------- */}
            {authMode === 'email-login' && (
              <form onSubmit={handleEmailLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setAuthError(null);
                        setEmail(e.target.value);
                      }}
                      placeholder="farmer@kshetraone.com"
                      disabled={isSubmittingEmail}
                      className="w-full h-12 pl-10 pr-3 bg-white rounded-xl border border-stone-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-stone-700">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthError(null);
                        setForgotSuccessMessage(null);
                        setAuthMode('forgot-password');
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setAuthError(null);
                        setPassword(e.target.value);
                      }}
                      placeholder="Enter your password"
                      disabled={isSubmittingEmail}
                      className="w-full h-12 pl-10 pr-10 bg-white rounded-xl border border-stone-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingEmail || !email.trim() || !password}
                  className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 mt-1"
                >
                  {isSubmittingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <span>Login</span>
                  )}
                </button>

                <div className="text-center pt-1">
                  <p className="text-xs text-stone-500">
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthError(null);
                        setForgotSuccessMessage(null);
                        setAuthMode('email-register');
                      }}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Create Account
                    </button>
                  </p>
                </div>

                <div className="relative my-2 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200"></div>
                  </div>
                  <span className="relative bg-white px-2.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                    or
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setForgotSuccessMessage(null);
                    setAuthMode('phone');
                  }}
                  className="w-full h-11 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold rounded-xl border border-stone-200 text-xs flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Use Phone Number OTP</span>
                </button>
              </form>
            )}

            {/* ---------------- MODE 3: EMAIL REGISTER ---------------- */}
            {authMode === 'email-register' && (
              <form onSubmit={handleEmailRegister} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => {
                        setAuthError(null);
                        setRegFullName(e.target.value);
                      }}
                      placeholder="e.g. Ramesh Patil"
                      disabled={isSubmittingEmail}
                      className="w-full h-11 pl-10 pr-3 bg-white rounded-xl border border-stone-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setAuthError(null);
                        setEmail(e.target.value);
                      }}
                      placeholder="farmer@kshetraone.com"
                      disabled={isSubmittingEmail}
                      className="w-full h-11 pl-10 pr-3 bg-white rounded-xl border border-stone-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setAuthError(null);
                        setPassword(e.target.value);
                      }}
                      placeholder="At least 6 characters"
                      disabled={isSubmittingEmail}
                      className="w-full h-11 pl-10 pr-10 bg-white rounded-xl border border-stone-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setAuthError(null);
                        setConfirmPassword(e.target.value);
                      }}
                      placeholder="Re-enter password"
                      disabled={isSubmittingEmail}
                      className="w-full h-11 pl-10 pr-10 bg-white rounded-xl border border-stone-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingEmail || !regFullName.trim() || !email.trim() || !password || !confirmPassword}
                  className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 mt-1"
                >
                  {isSubmittingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>

                <div className="text-center pt-0.5">
                  <p className="text-xs text-stone-500">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthError(null);
                        setForgotSuccessMessage(null);
                        setAuthMode('email-login');
                      }}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                </div>

                <div className="relative my-1.5 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200"></div>
                  </div>
                  <span className="relative bg-white px-2.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                    or
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setForgotSuccessMessage(null);
                    setAuthMode('phone');
                  }}
                  className="w-full h-10 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold rounded-xl border border-stone-200 text-xs flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Use Phone Number OTP</span>
                </button>
              </form>
            )}

            {/* ---------------- MODE 4: FORGOT PASSWORD ---------------- */}
            {authMode === 'forgot-password' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Registered Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setAuthError(null);
                        setEmail(e.target.value);
                      }}
                      placeholder="farmer@kshetraone.com"
                      disabled={isSubmittingEmail}
                      className="w-full h-12 pl-10 pr-3 bg-white rounded-xl border border-stone-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingEmail || !email.trim()}
                  className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmittingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <span>Send Password Reset Link</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setForgotSuccessMessage(null);
                      setAuthMode('email-login');
                    }}
                    className="text-xs text-emerald-700 font-bold hover:underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2 text-stone-400 text-[10px] justify-center text-center">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span>Secured &amp; Encrypted (Strictly ₹0 Budget)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setAuthError(null);
                setForgotSuccessMessage(null);
                setCurrentStep(2);
              }}
              className="w-full h-10 border border-stone-200 font-bold text-xs rounded-xl text-stone-600 hover:bg-stone-50"
            >
              Back to Language Selection
            </button>
          </div>
        </div>
      )}

      {/* ================= SCREEN 4: OTP VERIFICATION ================= */}
      {currentStep === 4 && (
        <div className="flex-1 flex flex-col justify-between p-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-stone-900 mb-1">Verify Mobile Number</h2>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-4">
              <span>Code sent to <strong className="text-stone-800">+91 {phone}</strong></span>
              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setCurrentStep(3);
                }}
                className="text-emerald-700 font-bold hover:underline"
              >
                Change
              </button>
            </div>

            {/* Zero-Cost Testing Guidance Notice */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl mb-4 text-[11px] text-amber-900 leading-relaxed">
              <p className="font-semibold mb-0.5">Firebase Project firstproject-3c5ca3b6:</p>
              <p className="text-stone-600">
                To maintain a strictly ₹0 budget, enter the test verification code registered in the Firebase Console (Authentication &gt; Phone &gt; Phone numbers for testing).
              </p>
            </div>

            {/* Error Alert */}
            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl mb-4 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{authError}</span>
              </div>
            )}

            {/* 6-Digit OTP Inputs */}
            <div className="flex justify-between gap-1.5 sm:gap-2 mb-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  id={`otp-input-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[i] || ''}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  disabled={isVerifyingOtp}
                  className="w-11 h-13 sm:w-12 sm:h-14 bg-stone-50 border border-stone-300 focus:border-emerald-600 rounded-xl text-center text-xl font-black focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                />
              ))}
            </div>

            {/* Resend Cooldown Counter */}
            <div className="text-center my-3">
              {resendCooldown > 0 ? (
                <p className="text-xs text-stone-500 font-medium">
                  Resend OTP in <span className="font-bold text-stone-700">{resendCooldown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSendingOtp}
                  className="text-xs text-emerald-700 font-bold hover:underline inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Resend OTP</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2.5 pt-4">
            <button
              type="button"
              onClick={() => {
                setAuthError(null);
                setCurrentStep(3);
              }}
              className="w-1/3 h-12 border border-stone-300 font-bold text-xs rounded-2xl text-stone-700 hover:bg-stone-50"
              disabled={isVerifyingOtp}
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifyingOtp || otp.join('').length !== 6}
              className="flex-1 h-12 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {isVerifyingOtp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Verify &amp; Continue</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ================= SCREEN 5: FARMER PROFILE ================= */}
      {currentStep === 5 && (
        <div className="flex-1 flex flex-col justify-between p-6 animate-in fade-in">
          <div>
            <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-300 mx-auto flex items-center justify-center mb-3 text-amber-800 text-2xl font-bold">
              👨‍🌾
            </div>
            <h2 className="text-xl font-black text-center text-stone-900 mb-1">Tell us about you</h2>
            <p className="text-xs text-center text-stone-500 mb-6">This helps us give better suggestions</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Name</label>
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full h-11 px-3 bg-white rounded-xl border border-stone-200 text-sm font-medium focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">State</label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full h-11 px-3 bg-white rounded-xl border border-stone-200 text-sm font-medium focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-11 px-3 bg-white rounded-xl border border-stone-200 text-sm font-medium focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Village</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full h-11 px-3 bg-white rounded-xl border border-stone-200 text-sm font-medium focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 mt-4">
            <button
              onClick={() => setCurrentStep(4)}
              className="w-1/3 h-12 border border-stone-300 font-bold text-xs rounded-2xl text-stone-700"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(6)}
              className="flex-1 h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-md active:scale-98 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ================= SCREEN 6: FARM TYPE ================= */}
      {currentStep === 6 && (
        <div className="flex-1 flex flex-col justify-between p-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-stone-900 mb-1">Your Farm</h2>
            <p className="text-xs text-stone-500 mb-6">Select what you have</p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                onClick={() => setFarmType('crop')}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                  farmType === 'crop'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600/20'
                    : 'border-stone-200 bg-white text-stone-700'
                }`}
              >
                <span className="text-3xl mb-2">🌱</span>
                <p className="font-bold text-xs">Crop Farming</p>
              </button>

              <button
                type="button"
                onClick={() => setFarmType('dairy')}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                  farmType === 'dairy'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600/20'
                    : 'border-stone-200 bg-white text-stone-700'
                }`}
              >
                <span className="text-3xl mb-2">🐄</span>
                <p className="font-bold text-xs">Dairy / Livestock</p>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setFarmType('mixed')}
              className={`w-full p-4 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                farmType === 'mixed'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600/20'
                  : 'border-stone-200 bg-white text-stone-700'
              }`}
            >
              <div className="flex items-center gap-2 text-2xl mb-1">
                <span>🌱</span>
                <span>+</span>
                <span>🐄</span>
              </div>
              <p className="font-bold text-xs">Both (Mixed Farming)</p>
            </button>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={() => setCurrentStep(5)}
              className="w-1/3 h-12 border border-stone-300 font-bold text-xs rounded-2xl text-stone-700"
            >
              Back
            </button>
            <button
              onClick={handleProceedFromFarmType}
              className="flex-1 h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-md active:scale-98 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ================= SCREEN 7: LAND & CROPS SETUP ================= */}
      {currentStep === 7 && (
        <div className="flex-1 flex flex-col justify-between p-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-stone-900 mb-1">Your Land &amp; Crops</h2>
            <p className="text-xs text-stone-500 mb-4">Add your fields and crops</p>

            <div className="space-y-2.5 mb-4">
              {fields.map((f, idx) => (
                <div key={idx} className="bg-stone-50 p-3 rounded-2xl border border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg">
                      {f.cropName === 'Tomato' ? '🍅' : f.cropName === 'Chilli' ? '🌶️' : '🌽'}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-stone-900">{f.name}</h3>
                      <p className="text-[11px] text-stone-500">{f.acres} Acres • {f.cropName}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setFields(fields.filter((_, i) => i !== idx))}
                    className="p-1.5 text-stone-400 hover:text-red-600"
                    title="Remove Field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {showAddFieldForm ? (
              <form onSubmit={handleAddField} className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200 space-y-2.5 mb-3">
                <p className="text-xs font-bold text-emerald-950">Add Field Details</p>
                <input
                  type="text"
                  placeholder="Field Name (e.g. Field 3 - Canal)"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="w-full h-10 px-3 bg-white rounded-xl border border-stone-200 text-xs font-medium"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Acres (e.g. 1.5)"
                    value={newFieldAcres}
                    onChange={(e) => setNewFieldAcres(e.target.value)}
                    className="w-full h-10 px-3 bg-white rounded-xl border border-stone-200 text-xs font-medium"
                    required
                  />
                  <select
                    value={newFieldCrop}
                    onChange={(e) => setNewFieldCrop(e.target.value)}
                    className="w-full h-10 px-2 bg-white rounded-xl border border-stone-200 text-xs font-medium"
                  >
                    <option value="Maize">Maize (🌽)</option>
                    <option value="Tomato">Tomato (🍅)</option>
                    <option value="Chilli">Chilli (🌶️)</option>
                    <option value="Paddy">Paddy / Rice (🌾)</option>
                    <option value="Cotton">Cotton (☁️)</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddFieldForm(false)}
                    className="flex-1 h-9 rounded-xl border border-stone-300 text-xs font-bold text-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-9 rounded-xl bg-emerald-700 text-white text-xs font-bold"
                  >
                    Save Field
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddFieldForm(true)}
                className="w-full py-3 bg-white border border-dashed border-emerald-600 rounded-2xl text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5 hover:bg-emerald-50/50"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Another Field</span>
              </button>
            )}
          </div>

          <div className="flex gap-2.5 mt-4">
            <button
              onClick={() => setCurrentStep(6)}
              className="w-1/3 h-12 border border-stone-300 font-bold text-xs rounded-2xl text-stone-700"
            >
              Back
            </button>
            <button
              onClick={handleProceedFromCrops}
              className="flex-1 h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-md active:scale-98 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ================= SCREEN 8: LIVESTOCK SETUP ================= */}
      {currentStep === 8 && (
        <div className="flex-1 flex flex-col justify-between p-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-stone-900 mb-1">Your Livestock</h2>
            <p className="text-xs text-stone-500 mb-4">Add your animals</p>

            <div className="space-y-2.5 mb-4">
              {livestock.map((l, idx) => (
                <div key={idx} className="bg-stone-50 p-3 rounded-2xl border border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-xl">
                      🐄
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-stone-900">{l.type}</h3>
                      <p className="text-[11px] text-stone-500">{l.count} {l.count === 1 ? 'animal' : 'animals'} • {l.breed}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setLivestock(livestock.filter((_, i) => i !== idx))}
                    className="p-1.5 text-stone-400 hover:text-red-600"
                    title="Remove Animal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {showAddAnimalForm ? (
              <form onSubmit={handleAddAnimal} className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200 space-y-2.5 mb-3">
                <p className="text-xs font-bold text-amber-950">Add Animal Details</p>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newAnimalType}
                    onChange={(e) => setNewAnimalType(e.target.value as any)}
                    className="w-full h-10 px-2 bg-white rounded-xl border border-stone-200 text-xs font-medium"
                  >
                    <option value="Cow (HF)">Cow (HF)</option>
                    <option value="Cow (Jersey)">Cow (Jersey)</option>
                    <option value="Buffalo">Buffalo (Murrah)</option>
                    <option value="Goat">Goat / Sheep</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    placeholder="Quantity"
                    value={newAnimalCount}
                    onChange={(e) => setNewAnimalCount(e.target.value)}
                    className="w-full h-10 px-3 bg-white rounded-xl border border-stone-200 text-xs font-medium"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAnimalForm(false)}
                    className="flex-1 h-9 rounded-xl border border-stone-300 text-xs font-bold text-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-9 rounded-xl bg-amber-700 text-white text-xs font-bold"
                  >
                    Save Animals
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddAnimalForm(true)}
                className="w-full py-3 bg-white border border-dashed border-amber-600 rounded-2xl text-xs font-bold text-amber-800 flex items-center justify-center gap-1.5 hover:bg-amber-50/50"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Animal</span>
              </button>
            )}
          </div>

          <div className="flex gap-2.5 mt-4">
            <button
              onClick={() => setCurrentStep(farmType === 'dairy' ? 6 : 7)}
              className="w-1/3 h-12 border border-stone-300 font-bold text-xs rounded-2xl text-stone-700"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(9)}
              className="flex-1 h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-md active:scale-98 transition-all"
            >
              Complete Setup
            </button>
          </div>
        </div>
      )}

      {/* ================= SCREEN 9: SETUP COMPLETE ================= */}
      {currentStep === 9 && (
        <div className="flex-1 flex flex-col justify-between p-6 text-center animate-in fade-in">
          <div className="pt-8">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-800 rounded-full mx-auto flex items-center justify-center mb-4 text-4xl shadow-inner border-2 border-emerald-300">
              👨‍🌾
            </div>
            <h2 className="text-2xl font-black text-stone-900 mb-1">Setup Complete!</h2>
            <p className="text-xs text-stone-500 max-w-xs mx-auto mb-6">
              KshetraOne is ready to help you manage your farm every day.
            </p>

            {/* Personalized Summary Card */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Farmer:</span>
                <span className="font-bold text-stone-900">{farmerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Location:</span>
                <span className="font-bold text-stone-900">{village}, {district}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-medium">Farm Type:</span>
                <span className="font-bold text-emerald-800 uppercase">{farmType}</span>
              </div>
              {farmType !== 'dairy' && (
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Fields Registered:</span>
                  <span className="font-bold text-stone-900">{fields.length} Fields ({fields.reduce((s, f) => s + f.acres, 0)} Acres)</span>
                </div>
              )}
              {farmType !== 'crop' && (
                <div className="flex justify-between">
                  <span className="text-stone-500 font-medium">Cattle Registered:</span>
                  <span className="font-bold text-stone-900">{livestock.reduce((s, l) => s + l.count, 0)} Animals</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
