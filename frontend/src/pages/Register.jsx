import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Anchor, LayoutDashboard, Zap, Globe, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const { register: registerField, handleSubmit, formState: { errors } } = useForm();
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const success = await register(data.name, data.email, data.password);
    setIsSubmitting(false);
    if (success) {
      const returnTo = location.state?.returnTo || '/dashboard';
      navigate(returnTo);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#090b14] text-gray-900 dark:text-white transition-colors duration-300 font-sans">
      
      {/* LEFT SIDE - VISUALS & BRANDING (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 items-center justify-center p-12">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[100px]"></div>
          <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] bg-purple-500/20 rounded-full blur-[90px]"></div>
        </div>

        {/* Brand Content */}
        <div className="relative z-10 max-w-xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[1.2rem] flex items-center justify-center shadow-xl shadow-blue-500/30 text-white border border-white/10">
              <Anchor className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Project<span className="text-blue-400">Dock</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-5xl font-bold leading-[1.15] mb-6 text-white tracking-tight">
              Start building <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                your best work.
              </span>
            </h2>
            <p className="text-lg text-blue-100/70 mb-12 max-w-lg leading-relaxed">
              Join thousands of high-performance teams using ProjectDock to manage projects with unparalleled speed and clarity.
            </p>
          </motion.div>

          {/* Feature Pills */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl">
              <LayoutDashboard className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-semibold text-white">Smart Dashboards</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-semibold text-white">Real-time Sync</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl">
              <Globe className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-semibold text-white">Global Teams</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE - REGISTER FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        
        {/* Subtle background glow for dark mode on right side */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none lg:hidden"></div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white/80 dark:bg-[#111624]/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] shadow-2xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-800/60 relative z-10"
        >
          <div className="text-center mb-8 lg:hidden">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25 text-white">
              <Anchor className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Project<span className="text-primary">Dock</span></h2>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Create an account</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Start your free journey with us today.</p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <div className="relative group">
                <input
                  type="text"
                  {...registerField('name', { required: 'Name is required' })}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm text-gray-900 dark:text-white transition-all group-hover:border-gray-300 dark:group-hover:border-gray-600"
                  placeholder="John Doe"
                />
                <User className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors absolute left-3.5 top-3.5" />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  {...registerField('email', { required: 'Email is required' })}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm text-gray-900 dark:text-white transition-all group-hover:border-gray-300 dark:group-hover:border-gray-600"
                  placeholder="name@company.com"
                />
                <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors absolute left-3.5 top-3.5" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative group">
                <input
                  type="password"
                  {...registerField('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none text-sm text-gray-900 dark:text-white transition-all group-hover:border-gray-300 dark:group-hover:border-gray-600"
                  placeholder="••••••••"
                />
                <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors absolute left-3.5 top-3.5" />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-gray-900/10 dark:shadow-white/10 cursor-pointer mt-4 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:text-primary-dark transition-colors">
              Sign in here
            </Link>
          </p>

          {/* Security Footer Note */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800/60 flex items-center justify-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure 256-bit Encrypted Session</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
