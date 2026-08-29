import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';

import { supabase } from '@/integrations/supabase/client';
import './auth.css';

const emailSchema = z.string().trim().email('Enter a valid email address').max(255);
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be under 72 characters')
  .regex(/[a-zA-Z]/, 'Password needs at least one letter')
  .regex(/[0-9]/, 'Password needs at least one number');
const nameSchema = z
  .string()
  .trim()
  .min(2, 'Please enter your full name')
  .max(100, 'Name must be under 100 characters');

const safeRedirect = (value) =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/features';

const AuthPage = ({ redirectTo }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ text: '', type: '' });
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });
  const [touched, setTouched] = useState({ name: false, email: false, password: false });

  const target = safeRedirect(redirectTo);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate({ to: target, replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate({ to: target, replace: true });
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate, target]);

  const validateField = (key, value) => {
    if (key === 'email') {
      const r = emailSchema.safeParse(value);
      return r.success ? '' : r.error.issues[0].message;
    }
    if (key === 'password') {
      const r = passwordSchema.safeParse(value);
      return r.success ? '' : r.error.issues[0].message;
    }
    if (key === 'name') {
      if (mode !== 'signup') return '';
      const r = nameSchema.safeParse(value);
      return r.success ? '' : r.error.issues[0].message;
    }
    return '';
  };

  const update = (key) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    if (touched[key]) {
      setErrors((prev) => ({ ...prev, [key]: validateField(key, value) }));
    }
  };

  const blur = (key) => () => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: validateField(key, form[key]) }));
  };

  const switchMode = (next) => {
    if (busy) return;
    setMode(next);
    setStatus({ text: '', type: '' });
    setErrors({ name: '', email: '', password: '' });
    setTouched({ name: false, email: false, password: false });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setStatus({ text: '', type: '' });

    const nextErrors = {
      name: validateField('name', form.name),
      email: validateField('email', form.email),
      password: validateField('password', form.password),
    };
    setErrors(nextErrors);
    setTouched({ name: true, email: true, password: true });
    if (nextErrors.name || nextErrors.email || nextErrors.password) return;

    setBusy(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
        setStatus({ text: 'Welcome back! Taking you in…', type: 'is-success' });
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: form.name.trim() },
          },
        });
        if (error) throw error;
        setStatus({ text: 'Account created. Vanakkam!', type: 'is-success' });
      }
    } catch (error) {
      const message = /invalid login credentials/i.test(error?.message || '')
        ? 'Incorrect email or password.'
        : /already registered|already exists/i.test(error?.message || '')
          ? 'That email already has an account — try signing in.'
          : error?.message || 'Something went wrong. Please try again.';
      setStatus({ text: message, type: 'is-error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-media" aria-label="Sancharam highlights">
        <p className="auth-eyebrow">நம்ம சென்னை · Sancharam AI</p>
        <h1>
          Travel smart. Travel local. Travel <span>Sancharam</span>.
        </h1>
        <p className="auth-tamil">வந்தாரை வாழ வைக்கும் ஊர்</p>
        <p className="auth-lead">
          Sign in to unlock Neram itineraries, Kaaval safety intelligence, uncharted coastal gems and
          your Payana Nidhi travel budget.
        </p>

        <div className="auth-grid">
          <article className="auth-card">
            <img src="/assets/images/index/temples.jpg" alt="Chennai temple gopuram" />
            <p>Temples</p>
          </article>
          <article className="auth-card">
            <img src="/assets/images/index/beaches.jpg" alt="Chennai shoreline" />
            <p>Beaches</p>
          </article>
          <article className="auth-card">
            <img src="/assets/images/index/tranquebar_fort.jpg" alt="Tranquebar fort" />
            <p>Heritage</p>
          </article>
        </div>
      </section>

      <section className="auth-panel" aria-label="Sign in or create an account">
        <div className="auth-switch">
          <button
            type="button"
            disabled={busy}
            className={mode === 'login' ? 'is-active' : ''}
            onClick={() => switchMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            disabled={busy}
            className={mode === 'signup' ? 'is-active' : ''}
            onClick={() => switchMode('signup')}
          >
            Create account
          </button>
        </div>

        <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="auth-sub">
          {mode === 'login'
            ? 'Continue your Chennai journey.'
            : 'Just a name, email and password — that’s it.'}
        </p>

        {mode === 'login' && (
          <div className="auth-demo" role="note">
            <p className="auth-demo-title">Demo account</p>
            <p className="auth-demo-creds">
              <span>demo@sancharam.ai</span>
              <span>Demo@1234</span>
            </p>
            <button
              type="button"
              className="auth-demo-fill"
              disabled={busy}
              onClick={() => {
                setForm((f) => ({ ...f, email: 'demo@sancharam.ai', password: 'Demo@1234' }));
                setErrors((e) => ({ ...e, email: '', password: '' }));
                setStatus({ type: '', text: '' });
              }}
            >
              Use demo login
            </button>
          </div>
        )}

        <p className={`auth-status ${status.type}`} aria-live="polite">
          {status.text}
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <>
              <label htmlFor="auth-name">Full name</label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                value={form.name}
                onChange={update('name')}
                onBlur={blur('name')}
                disabled={busy}
                className={errors.name ? 'is-invalid' : ''}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && <p className="auth-field-error">{errors.name}</p>}
            </>
          )}

          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={update('email')}
            onBlur={blur('email')}
            disabled={busy}
            className={errors.email ? 'is-invalid' : ''}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <p className="auth-field-error">{errors.email}</p>}

          <label htmlFor="auth-password">Password</label>
          <div className="auth-pass">
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'}
              value={form.password}
              onChange={update('password')}
              onBlur={blur('password')}
              disabled={busy}
              className={errors.password ? 'is-invalid' : ''}
              aria-invalid={Boolean(errors.password)}
            />
            <button type="button" onClick={() => setShowPassword((prev) => !prev)} disabled={busy}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && <p className="auth-field-error">{errors.password}</p>}
          {mode === 'signup' && !errors.password && (
            <p className="auth-hint">At least 8 characters with one letter and one number.</p>
          )}

          <button type="submit" className="auth-primary" disabled={busy}>
            {busy && <span className="auth-spinner" aria-hidden="true" />}
            {busy
              ? mode === 'login'
                ? 'Signing in…'
                : 'Creating account…'
              : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>

        <p className="auth-helper">By continuing, you agree to use Sancharam responsibly.</p>
        <p className="auth-back">
          <Link to="/">← Back to home</Link>
        </p>
      </section>
    </main>
  );
};

export default AuthPage;
