import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/common/Button';
import { Loader2, AlertCircle, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); // 'processing' | 'error' | 'success'
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState('general'); // 'expired' | 'used' | 'invalid' | 'general'

  useEffect(() => {
    let isMounted = true;

    const processAuthCallback = async () => {
      // 1. Check for URL error parameters from Supabase (e.g. expired link)
      const urlError = searchParams.get('error');
      const errorCode = searchParams.get('error_code');
      const errorDesc = searchParams.get('error_description') || '';

      if (urlError || errorCode) {
        const descLower = errorDesc.toLowerCase();
        let displayMsg = 'Invalid password reset link.';
        let type = 'invalid';

        if (errorCode === 'otp_expired' || descLower.includes('expired') || descLower.includes('has expired')) {
          displayMsg = 'Password reset link has expired.';
          type = 'expired';
        } else if (descLower.includes('already used') || descLower.includes('already been used') || descLower.includes('consumed')) {
          displayMsg = 'Password reset link has already been used.';
          type = 'used';
        }

        if (isMounted) {
          setErrorType(type);
          setErrorMessage(displayMsg);
          setStatus('error');
        }
        return;
      }

      // 2. Determine auth flow type
      const code = searchParams.get('code');
      const typeParam = searchParams.get('type');
      const nextPath = searchParams.get('next');
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      const isRecovery = typeParam === 'recovery' || hash.includes('type=recovery') || nextPath === '/reset-password';

      // 3. Handle PKCE code exchange if present
      if (code) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            const msgLower = (error.message || '').toLowerCase();
            let displayMsg = 'Invalid password reset link.';
            let type = 'invalid';

            if (msgLower.includes('expired') || error.status === 400) {
              if (msgLower.includes('already') || msgLower.includes('used')) {
                displayMsg = 'Password reset link has already been used.';
                type = 'used';
              } else {
                displayMsg = 'Password reset link has expired.';
                type = 'expired';
              }
            }

            if (isMounted) {
              setErrorType(type);
              setErrorMessage(displayMsg);
              setStatus('error');
            }
            return;
          }

          if (data?.session) {
            if (isRecovery) {
              sessionStorage.setItem('ck_recovery_active', 'true');
              // Clear URL search and navigate to /reset-password
              window.history.replaceState(null, '', '/reset-password');
              navigate('/reset-password', { replace: true });
              return;
            } else {
              // Normal email confirmation / signin
              navigate('/', { replace: true });
              return;
            }
          }
        } catch (err) {
          if (isMounted) {
            setErrorType('invalid');
            setErrorMessage('Unable to process authentication callback.');
            setStatus('error');
          }
          return;
        }
      }

      // 4. Handle implicit hash-based recovery
      if (hash && hash.includes('type=recovery')) {
        sessionStorage.setItem('ck_recovery_active', 'true');
        window.history.replaceState(null, '', '/reset-password');
        navigate('/reset-password', { replace: true });
        return;
      }

      // 5. Fallback: check active session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (isRecovery) {
          sessionStorage.setItem('ck_recovery_active', 'true');
          navigate('/reset-password', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        if (isMounted) {
          setErrorType('invalid');
          setErrorMessage('Invalid or expired authentication link.');
          setStatus('error');
        }
      }
    };

    processAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [searchParams, navigate]);

  if (status === 'error') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full glass-card rounded-3xl p-8 sm:p-10 border border-red-500/30 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">
              {errorType === 'expired'
                ? 'Password Reset Link Expired'
                : errorType === 'used'
                ? 'Link Already Used'
                : 'Invalid Reset Link'}
            </h1>
            <p className="text-sm text-brand-muted">
              {errorMessage}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link to="/forgot-password">
              <Button variant="primary" size="lg" className="w-full gap-2 shadow-xl">
                Request a New Reset Link
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link to="/login">
              <Button variant="ghost" size="sm" className="w-full text-xs text-brand-muted">
                Return to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center text-brand-accent">
        <Loader2 className="w-7 h-7 animate-spin" />
      </div>
      <h2 className="text-xl font-bold text-white">Securing Session...</h2>
      <p className="text-xs text-brand-muted max-w-sm">
        Verifying your authentication credentials. You will be redirected momentarily.
      </p>
    </div>
  );
};

export default AuthCallbackPage;
