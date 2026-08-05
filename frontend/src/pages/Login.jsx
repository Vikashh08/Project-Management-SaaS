import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useSignIn } from '@clerk/clerk-react';
import { Sparkles, ArrowRight, UserCheck, Lock, Mail, ShieldCheck, Anchor } from 'lucide-react';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, guestLogin } = useAuth();
  const { signIn, isLoaded: isClerkLoaded } = useSignIn();
  const navigate = useNavigate();
  const location = useLocation();
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOAuthSignIn = (provider) => {
    if (!isClerkLoaded) return;
    signIn.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/dashboard',
    });
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const success = await login(data.email, data.password);
    setIsSubmitting(false);
    if (success) {
      const returnTo = location.state?.returnTo || '/dashboard';
      navigate(returnTo);
    }
  };

  const handleGuestAccess = async () => {
    setIsGuestLoading(true);
    const success = await guestLogin();
    setIsGuestLoading(false);
    if (success) {
      const returnTo = location.state?.returnTo || '/dashboard';
      navigate(returnTo);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0b0f17] px-4 py-8 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-[#131b2e] p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-white/10 relative overflow-hidden">
        
        {/* Header Badge */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-lg shadow-blue-500/25 text-white">
            <Anchor className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Welcome to Project<span className="text-primary">Dock</span></h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sign in to access your workspace or try Instant Guest Demo</p>
        </div>


        {/* 1-CLICK INSTANT GUEST DEMO ACCESS */}
        <div className="mb-5 bg-gradient-to-r from-primary/10 via-emerald-500/10 to-teal-500/10 border border-primary/20 dark:border-primary/30 p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-bold text-primary tracking-wide uppercase">Instant Access</span>
            <span className="ml-auto text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold">No Password</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
            Want to test drive ProjectDock immediately? Explore full workspace features as a Guest Demo User in 1 click.
          </p>
          <button
            type="button"
            onClick={handleGuestAccess}
            disabled={isGuestLoading}
            className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-md shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGuestLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Explore as Demo Guest</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* CLERK OAUTH BUTTONS */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => handleOAuthSignIn('oauth_google')}
            className="py-2.5 px-3 bg-white dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.99 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            Google OAuth
          </button>
          <button
            type="button"
            onClick={() => handleOAuthSignIn('oauth_github')}
            className="py-2.5 px-3 bg-gray-900 text-white dark:bg-gray-800 dark:border dark:border-white/10 rounded-xl text-xs font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            GitHub OAuth
          </button>
        </div>

        {/* OR Divider */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
          </div>
          <span className="relative bg-white dark:bg-[#131b2e] px-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Or sign in with account
          </span>
        </div>


        {/* Regular Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-xs text-gray-900 dark:text-white transition-all"
                placeholder="you@example.com"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
            {errors.email && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Password</label>
              <a href="#" className="text-[10px] text-primary font-bold hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-xs text-gray-900 dark:text-white transition-all"
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
            {errors.password && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer mt-1 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign In with Account'
            )}
          </button>

        </form>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Sign up free
          </Link>
        </p>


        {/* Security Footer Note */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Encrypted Session & Instant Guest Preview Enabled</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

