import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, UserCheck, Lock, Mail, ShieldCheck, Anchor } from 'lucide-react';


const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, guestLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

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


        {/* 1-CLICK INSTANT GUEST DEMO ACCESS (PROMINENT TOP CARD) */}
        <div className="mb-6 bg-gradient-to-r from-primary/10 via-indigo-500/10 to-purple-500/10 border border-primary/20 dark:border-primary/30 p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-bold text-primary tracking-wide uppercase">Instant Access</span>
            <span className="ml-auto text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold">No Password</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
            Want to test drive Project Dock immediately? Explore full workspace features as a Guest Demo User in 1 click.
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

        {/* OR Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
          </div>
          <span className="relative bg-white dark:bg-[#121216] px-3 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
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

