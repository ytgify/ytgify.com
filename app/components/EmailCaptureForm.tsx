'use client';

import { useState, useRef, useEffect } from 'react';
import { submitEmail } from '@/lib/formspree';
import { trackExtensionEvent, trackExtensionException } from '@/lib/extensionAnalytics';

interface EmailCaptureFormProps {
  source?: string;
  buttonText?: string;
  successMessage?: string;
  placeholder?: string;
  className?: string;
}

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function EmailCaptureForm({
  source = 'website',
  buttonText = 'Get Updates',
  successMessage = "You're subscribed!",
  placeholder = 'you@example.com',
  className = '',
}: EmailCaptureFormProps) {
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount (with slight delay for better UX)
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    setFormState('loading');
    setErrorMessage('');
    trackExtensionEvent('email_subscription_started', { source });

    try {
      await submitEmail(email, { source });
      setFormState('success');
      setEmail('');
      trackExtensionEvent('email_subscription_succeeded', { source });
    } catch (error) {
      setFormState('error');
      setErrorMessage('Failed to subscribe. Please try again.');
      trackExtensionEvent('email_subscription_failed', { source });
      trackExtensionException(error, { source, workflow: 'email_subscription' });
    }
  };

  if (formState === 'success') {
    return (
      <div className={`text-center ${className}`}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#E91E8C]/20 to-[#7B2FBE]/20 border-2 border-[#E91E8C]/50 mb-4">
          <svg
            className="w-8 h-8 text-[#E91E8C]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-xl font-semibold text-white mb-2">{successMessage}</p>
        <p className="text-gray-400">We&apos;ll email you when there&apos;s something new.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          ref={inputRef}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          required
          disabled={formState === 'loading'}
          autoComplete="email"
          className="flex-1 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#E91E8C] focus:ring-1 focus:ring-[#E91E8C] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={formState === 'loading'}
          className="px-6 py-3 bg-gradient-to-r from-[#E91E8C] to-[#7B2FBE] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
        >
          {formState === 'loading' ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Subscribing...</span>
            </>
          ) : (
            buttonText
          )}
        </button>
      </div>
      {formState === 'error' && <p className="text-red-400 text-sm mt-2">{errorMessage}</p>}
    </form>
  );
}
