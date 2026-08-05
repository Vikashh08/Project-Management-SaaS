import React from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  ArrowRight, CheckCircle2, Play, Users, BarChart3, 
  CheckSquare, Globe, ArrowUpRight, MessageSquare, Shield, Zap, LayoutDashboard, Search, X, Moon, Sun, Sparkles, UserCheck, Anchor
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user, login, register, guestLogin } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = React.useState(null);
  const [isGuestLoading, setIsGuestLoading] = React.useState(false);

  const handleGuestAccess = async () => {
    setIsGuestLoading(true);
    const success = await guestLogin();
    setIsGuestLoading(false);
    if (success) {
      setShowAuthModal(null);
      navigate('/dashboard');
    }
  };

  const { register: loginRegister, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors }, reset: resetLoginForm } = useForm();
  const { register: registerRegister, handleSubmit: handleRegisterSubmit, formState: { errors: registerErrors }, watch: watchRegister, reset: resetRegisterForm } = useForm();

  const onLoginSubmit = async (data) => {
    const success = await login(data.email, data.password);
    if (success) {
      setShowAuthModal(null);
      resetLoginForm();
      navigate('/dashboard');
    }
  };

  const onRegisterSubmit = async (data) => {
    const success = await register(data.name, data.email, data.password);
    if (success) {
      setShowAuthModal(null);
      resetRegisterForm();
      navigate('/dashboard');
    }
  };

  const [isDark, setIsDark] = React.useState(
    document.documentElement.classList.contains('dark')
  );

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f17] text-[#0f172a] dark:text-[#f8fafc] font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-300">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-55 bg-white/80 dark:bg-[#0b0f17]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
              <Anchor className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white font-sans">
              Project<span className="text-primary">Dock</span>
            </span>
          </div>



          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 dark:text-gray-450 hover:text-primary dark:hover:text-primary transition-colors">Features</a>
            <a href="#benefits" className="text-sm font-medium text-gray-600 dark:text-gray-450 hover:text-primary dark:hover:text-primary transition-colors">Benefits</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 dark:text-gray-450 hover:text-primary dark:hover:text-primary transition-colors">Testimonials</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 dark:text-gray-450 hover:text-primary dark:hover:text-primary transition-colors">Pricing</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer mr-1"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {user ? (
              <button 
                onClick={() => navigate('/dashboard')} 
                className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all shadow-md shadow-primary/25 hover:shadow-primary/45 active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button 
                  onClick={handleGuestAccess} 
                  disabled={isGuestLoading}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-xl font-bold text-xs hover:bg-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>Try Guest Demo</span>
                </button>
                <button 
                  onClick={() => navigate('/login')} 
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors cursor-pointer"
                >
                  Login
                </button>

                <button 
                  onClick={() => navigate('/register')} 
                  className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all shadow-md shadow-primary/25 hover:shadow-primary/45 active:scale-[0.98] cursor-pointer"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Version 2.0 Redesign is Live
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.15] mb-6 max-w-4xl mx-auto"
          >
            Effortless task management, <span className="text-[#f59e0b]">anytime</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Manage tasks and projects easily with an all-in-one platform designed for seamless collaboration and smart workflows.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-20"
          >
            {user ? (
              <Link 
                to="/dashboard"
                className="px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 flex items-center gap-2 hover:-translate-y-0.5"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <button 
                  onClick={handleGuestAccess}
                  disabled={isGuestLoading}
                  className="px-8 py-4 bg-gradient-to-r from-primary to-indigo-600 text-white font-bold rounded-2xl hover:opacity-95 transition-all shadow-lg shadow-primary/30 flex items-center gap-2.5 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  Instant Guest Demo
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-white/10 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  Create Account
                </button>
              </>
            )}
          </motion.div>


          {/* Interactive HTML/CSS Mockups (Browser + Phone Overlay) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative max-w-5xl mx-auto"
          >
            {/* Browser Mockup */}
            <div className="bg-white dark:bg-[#121216] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 dark:border-white/5 overflow-hidden text-left aspect-[16/10] w-full transition-colors duration-300">
              {/* Browser Window Header */}
              <div className="bg-gray-50/80 dark:bg-gray-900/50 px-4 py-3 border-b border-gray-100 dark:border-white/5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="bg-white/80 dark:bg-[#1e1e24] border border-gray-100/50 dark:border-white/5 rounded-lg text-[10px] text-gray-400 dark:text-gray-500 px-3 py-1 w-64 mx-auto text-center truncate">
                  app.taskflowai.com/dashboard
                </div>
              </div>

              {/* Browser App Layout */}
              <div className="flex h-full text-xs text-gray-800 dark:text-gray-350">
                {/* Mock Sidebar */}
                <div className="w-1/5 bg-gray-50/50 dark:bg-[#121216]/50 border-r border-gray-100 dark:border-white/5 p-3 hidden sm:flex flex-col gap-4">
                  <div className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center text-white text-[10px]">T</div>
                    TaskFlowAI
                  </div>
                  <div className="space-y-1">
                    <div className="p-1.5 bg-primary/10 text-primary rounded-lg font-semibold">Home</div>
                    <div className="p-1.5 text-gray-500 dark:text-gray-400">Projects</div>
                    <div className="p-1.5 text-gray-500 dark:text-gray-400">Tasks</div>
                    <div className="p-1.5 text-gray-500 dark:text-gray-400">Teams</div>
                  </div>
                </div>

                {/* Mock Content */}
                <div className="flex-1 p-4 sm:p-6 bg-white dark:bg-gray-950 overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">Hello, Cecilia</h4>
                      <p className="text-gray-400 dark:text-gray-500 text-[10px]">Let's get things done!</p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold">C</div>
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {[
                      { label: 'Completed', val: '12' },
                      { label: 'Time Tracked', val: '20h 30m' },
                      { label: 'Revenue', val: '$2,190' },
                      { label: 'Members', val: '21' }
                    ].map((s, idx) => (
                      <div key={idx} className="p-2.5 border border-gray-100 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-[#18181f]/50">
                        <span className="text-gray-400 dark:text-gray-550 text-[9px] block mb-0.5">{s.label}</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">{s.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tasks List */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-gray-900 dark:text-white">Ongoing Tasks</span>
                      <span className="text-[10px] text-primary font-semibold">View All</span>
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { title: 'UI Kit Development', label: 'Important', col: 'bg-orange-100 text-orange-700' },
                        { title: 'Client Feedback Review', label: 'OK', col: 'bg-green-100 text-green-700' },
                        { title: 'Sprint Planning', label: 'Meh', col: 'bg-yellow-100 text-yellow-700' }
                      ].map((t, idx) => (
                        <div key={idx} className="p-3 border border-gray-100 dark:border-white/5 rounded-xl flex items-center justify-between hover:shadow-sm transition-shadow bg-white dark:bg-[#18181f]">
                          <div className="flex items-center gap-3">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${t.col}`}>{t.label}</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{t.title}</span>
                          </div>
                          <div className="flex -space-x-1.5">
                            <div className="w-5 h-5 rounded-full bg-indigo-200 border border-white dark:border-gray-900"></div>
                            <div className="w-5 h-5 rounded-full bg-purple-200 border border-white dark:border-gray-900"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Phone Mockup Overlay */}
            <div className="absolute right-[5%] bottom-[-10%] w-[220px] bg-gray-900 dark:bg-black p-2.5 rounded-[36px] shadow-2xl hidden md:block border-4 border-gray-800 dark:border-gray-900">
              <div className="bg-white dark:bg-[#121216] rounded-[28px] overflow-hidden aspect-[9/19] w-full text-left p-4 relative border dark:border-white/5">
                {/* Speaker/Camera notch */}
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-3 bg-gray-900 rounded-full"></div>

                <div className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-xs dark:text-white">TaskFlowAI</span>
                    <span className="text-[9px] text-gray-400 dark:text-gray-550">English</span>
                  </div>

                  {/* Hello */}
                  <div className="mb-4">
                    <h5 className="text-sm font-bold dark:text-white">Welcome Back</h5>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Your workspace is ready.</p>
                  </div>

                  {/* Active Card */}
                  <div className="p-3 bg-primary text-white rounded-2xl mb-4 shadow-md shadow-primary/20">
                    <span className="text-[9px] opacity-80 block mb-0.5">Tasks Completed</span>
                    <span className="text-xl font-bold">12 / 15</span>
                    <div className="w-full bg-white/20 h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-white h-full w-[80%] rounded-full"></div>
                    </div>
                  </div>

                  {/* Quick list */}
                  <span className="font-bold text-[10px] text-gray-800 dark:text-white block mb-2">Today's schedule</span>
                  <div className="space-y-2">
                    {['Team Standup', 'Deploy v2.0'].map((task, i) => (
                      <div key={i} className="p-2.5 border border-gray-100 dark:border-white/5 rounded-xl flex items-center justify-between bg-white dark:bg-[#18181f] text-[10px]">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{task}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By Logos */}
      <section className="bg-white dark:bg-[#09090b] py-12 border-y border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-8">We are trusted by</p>
          <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
            <span className="font-bold text-xl text-gray-600 dark:text-gray-400 font-sans tracking-tight">mailchimp</span>
            <span className="font-bold text-xl text-gray-600 dark:text-gray-400 font-sans tracking-tight">DOORDASH</span>
            <span className="font-bold text-xl text-gray-600 dark:text-gray-400 font-sans tracking-tight">Google</span>
            <span className="font-bold text-xl text-gray-600 dark:text-gray-400 font-sans tracking-tight">Spotify</span>
            <span className="font-bold text-xl text-gray-600 dark:text-gray-400 font-sans tracking-tight">Webflow</span>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 px-6 bg-[#fafafc] dark:bg-[#09090b]">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block font-semibold">Advantages</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white font-sans">Key features to boost your productivity</h2>
          <p className="text-gray-400 dark:text-gray-500 mt-3 max-w-xl mx-auto text-sm">Explore the essential tools designed to streamline your workflow, enhance team collaboration, and ensure your projects run smoothly from start to finish.</p>
        </div>

        {/* Features / Benefits Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: To-do List */}
          <div className="bg-[#fffdf9] dark:bg-[#121216] rounded-3xl p-8 border border-amber-100/50 dark:border-amber-900/20 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[460px] relative overflow-hidden group">
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">01</span>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 font-sans">To-do List</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-8">Organize your daily tasks effortlessly with our intuitive to-do list. Stay focused and prioritize what matters most.</p>
            </div>

            {/* Illustration Mockup for Card 1 */}
            <div className="bg-amber-50/40 dark:bg-amber-900/5 rounded-2xl p-4 border border-amber-100/20 dark:border-amber-900/10 relative min-h-[160px] flex flex-col gap-2.5 justify-end">
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white rounded-lg text-[9px] font-bold shadow-sm shadow-amber-500/25">
                  <CheckSquare className="w-3 h-3" /> Mascot Illustration
                </span>
                <span className="px-2.5 py-1 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-white/5 rounded-lg text-[9px] font-semibold">
                  Mobile Prototype
                </span>
              </div>
              
              <div className="bg-white dark:bg-[#18181f] p-3 rounded-xl border border-amber-100/40 dark:border-white/5 shadow-sm">
                <span className="text-[10px] font-bold text-gray-900 dark:text-white block mb-1">UI Design Kits</span>
                <p className="text-[8px] text-gray-400 leading-normal">Develop and assemble a comprehensive UI design kit, including components, templates...</p>
              </div>
            </div>
          </div>

          {/* Card 2: Team Member Tracking */}
          <div className="bg-[#fbfcff] dark:bg-[#121216] rounded-3xl p-8 border border-blue-100/50 dark:border-blue-900/20 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[460px] relative overflow-hidden group">
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-lg">02</span>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 font-sans">Team Member Tracking</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-8">Easily track your team members' progress and stay connected. Ensure everyone is aligned and working towards shared goals.</p>
            </div>

            {/* Illustration Mockup for Card 2 */}
            <div className="bg-primary/5 dark:bg-primary/5 rounded-2xl p-4 border border-primary/10 dark:border-primary/10 relative min-h-[160px] flex flex-col gap-2.5 justify-end">
              <div className="bg-white dark:bg-[#18181f] p-3 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-gray-900 dark:text-white">Team Members</span>
                  <span className="text-[8px] text-gray-400">Collaborative Space</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 bg-gray-50/50 dark:bg-[#1e1e24] rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-primary/15 text-primary text-[9px] font-bold flex items-center justify-center">EP</div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-semibold text-gray-800 dark:text-gray-200 block truncate font-sans">Eleanor Pena</span>
                    <span className="text-[8px] text-gray-400 block truncate">pena@icloud.com</span>
                  </div>
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Project Tracking */}
          <div className="bg-[#f9fffb] dark:bg-[#121216] rounded-3xl p-8 border border-emerald-100/50 dark:border-emerald-900/20 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[460px] relative overflow-hidden group">
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">03</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 font-sans">Project Tracking</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-8">Monitor project timelines and milestones in real-time. Keep projects on track and meet your deadlines with confidence.</p>
            </div>

            {/* Illustration Mockup for Card 3 */}
            <div className="bg-emerald-50/40 dark:bg-emerald-900/5 rounded-2xl p-4 border border-emerald-100/20 dark:border-emerald-900/10 relative min-h-[160px] flex flex-col gap-2.5 justify-end">
              <div className="bg-white dark:bg-[#18181f] p-3 rounded-xl border border-emerald-100/40 dark:border-white/5 shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-gray-900 dark:text-white">SprintWave Dashboard</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[8px] font-bold">In Progress</span>
                </div>
                <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[65%] rounded-full"></div>
                </div>
                <div className="flex justify-between items-center text-[8px] text-gray-400">
                  <span>UI Design Kit</span>
                  <span className="font-bold text-gray-900 dark:text-white">$120,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Powerful Features Detail */}
      <section id="features" className="py-24 px-6 bg-white dark:bg-[#09090b] border-t border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block font-semibold">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white font-sans">Powerful Features to Elevate Your Workflow</h2>
            <p className="text-gray-400 dark:text-gray-500 mt-3 max-w-xl mx-auto text-sm">Explore advanced tools that help you make smarter decisions, track progress, and manage your tasks with ease. Stay organized and in control with features designed to enhance your productivity.</p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { title: 'Make Smart Decisions', desc: 'Get real-time insights, reports, and alerts to help you make more informed decisions.', icon: Shield, active: false },
              { title: 'Optimize Your Goals', desc: 'Track your progress and stay aligned with personal or project goals using smart tracking tools.', icon: Zap, active: true },
              { title: 'Task management', desc: 'Easily manage tasks, deadlines, and priorities to keep projects running smoothly.', icon: CheckSquare, active: false },
              { title: 'Team chat', desc: 'Stay connected with real-time messaging, making team collaboration easier.', icon: MessageSquare, active: false }
            ].map((f, i) => (
              <div 
                key={i} 
                className={`p-6 rounded-2xl border transition-all duration-300 ${
                  f.active 
                    ? 'bg-rose-50/40 dark:bg-rose-950/5 border-rose-200/50 dark:border-rose-900/20 shadow-sm' 
                    : 'border-gray-100 dark:border-white/5 hover:shadow-md bg-white dark:bg-[#121216]'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  f.active ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary'
                }`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2 font-sans text-sm">{f.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Interactive Play Button Row */}
          <div className="flex justify-center mb-12">
            <button 
              onClick={() => user ? navigate('/dashboard') : navigate('/login')}
              className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
                  Play now
                </button>
              </div>

              {/* Giant Browser Mockup representing actual App */}
              <div className="max-w-5xl mx-auto bg-gray-900 dark:bg-black p-2 lg:p-3 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-gray-800 dark:border-white/5 transition-colors duration-300">
                <div className="bg-[#f8f7fa] dark:bg-[#121216] rounded-xl overflow-hidden aspect-[16/10] w-full text-left flex flex-col">
                  {/* Window Bar */}
                  <div className="bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                    </div>
                    <div className="bg-gray-100 dark:bg-[#1e1e24] rounded-lg text-[9px] text-gray-400 dark:text-gray-500 px-3 py-1 w-64 text-center truncate font-medium">
                      app.taskflowai.com/dashboard
                    </div>
                    <div className="w-10"></div>
                  </div>

                  {/* Layout Content */}
                  <div className="flex-1 flex overflow-hidden text-[10px] text-gray-850 dark:text-gray-300">
                    {/* Sidebar Mock */}
                    <div className="w-1/5 bg-white dark:bg-[#121216]/95 border-r border-gray-100 dark:border-white/5 p-3 hidden sm:flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 text-xs">
                          <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-white text-[10px] font-bold">T</div>
                          TaskFlowAI
                        </div>
                        <div className="space-y-1">
                          <div className="p-1.5 bg-primary/10 text-primary rounded-lg font-semibold flex items-center gap-2">
                            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                          </div>
                          <div className="p-1.5 text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <CheckSquare className="w-3.5 h-3.5" /> My Tasks
                          </div>
                          <div className="p-1.5 text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" /> Projects
                          </div>
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 dark:bg-[#18181f] rounded-xl border dark:border-white/5">
                        <span className="font-bold text-[9px] block text-gray-900 dark:text-white mb-0.5">Upgrade Workspace</span>
                        <span className="text-[8px] text-gray-400 dark:text-gray-500 block mb-2">Get premium tools</span>
                        <button className="w-full bg-primary text-white text-[8px] font-bold py-1.5 rounded-lg">Go Pro</button>
                      </div>
                    </div>

                    {/* Dashboard Main Grid */}
                    <div className="flex-1 p-4 bg-[#f8f7fa] dark:bg-gray-950 overflow-y-auto flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-base font-bold text-gray-900 dark:text-white font-sans">Hello, Cecilia</h4>
                          <p className="text-gray-400 dark:text-gray-500 text-[8px]">Let's get things done!</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-white dark:bg-[#18181f] border border-gray-100 dark:border-white/5 rounded-lg flex items-center justify-center"><Search className="w-3 h-3 text-gray-400" /></div>
                          <div className="w-5 h-5 bg-white dark:bg-[#18181f] border border-gray-100 dark:border-white/5 rounded-lg flex items-center justify-center text-xs font-bold text-primary">C</div>
                        </div>
                      </div>

                      {/* Top Stats */}
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: 'Project Finished', val: '12' },
                          { label: 'Time Tracked (week)', val: '20h 30m' },
                          { label: 'Total Revenue', val: '$2190' },
                          { label: 'Total Members', val: '21' }
                        ].map((st, i) => (
                          <div key={i} className="p-3 bg-white dark:bg-[#18181f] border border-gray-100 dark:border-white/5 shadow-sm rounded-xl">
                            <span className="font-bold text-gray-900 dark:text-white text-xs block">{st.val}</span>
                            <span className="text-gray-400 dark:text-gray-500 text-[8px] mt-0.5 block">{st.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Lists Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Ongoing tasks */}
                        <div className="bg-white dark:bg-[#18181f] p-3 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-gray-900 dark:text-white">Ongoing Tasks</span>
                            <span className="text-[8px] text-primary font-semibold">View All</span>
                          </div>
                          {[
                            { title: 'UI Kit Development', label: 'Important', bg: 'bg-[#fff7ed] dark:bg-orange-950/20 text-orange-700' },
                            { title: 'Client Feedback Review', label: 'OK', bg: 'bg-[#f0fdf4] dark:bg-green-950/20 text-green-700' },
                            { title: 'Sprint Planning', label: 'Meh', bg: 'bg-[#fefce8] dark:bg-yellow-950/20 text-yellow-700' }
                          ].map((t, idx) => (
                            <div key={idx} className="p-2 border border-gray-50 dark:border-white/5 rounded-lg flex items-center justify-between text-[9px] bg-white dark:bg-gray-950">
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${t.bg}`}>{t.label}</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{t.title}</span>
                              </div>
                              <div className="flex -space-x-1">
                                <div className="w-4 h-4 rounded-full bg-blue-200 border border-white dark:border-gray-900"></div>
                                <div className="w-4 h-4 rounded-full bg-purple-200 border border-white dark:border-gray-900"></div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Right Panel: Team Standup */}
                        <div className="bg-white dark:bg-[#18181f] p-3 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-gray-900 dark:text-white">Internal Teams</span>
                            <span className="text-[8px] text-gray-400 dark:text-gray-500">August, 2026</span>
                          </div>
                          <div className="p-2 bg-rose-50/40 dark:bg-rose-950/5 rounded-lg border border-rose-100/50 dark:border-rose-900/10 relative">
                            <span className="text-[9px] font-bold text-gray-900 dark:text-white block mb-1">Mobile Prototype</span>
                            <p className="text-[8px] text-gray-400 dark:text-gray-500 leading-normal font-sans">Develop mockups and wireframes for mobile redesign...</p>
                            {/* Elle Cohan avatar float */}
                            <div className="absolute right-2 bottom-2 flex items-center gap-1.5 bg-emerald-500 text-white rounded px-1.5 py-0.5 text-[8px] font-bold shadow">
                              <span>Elle Cohan</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-[#fafafc] dark:bg-[#09090b] border-t border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block font-semibold">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white font-sans">What our users say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: 'TaskFlowAI has completely changed how our team collaborates. It\'s intuitive and has made tracking projects so much easier.',
                author: 'Sarah Thompson',
                role: 'Product Manager',
                company: 'Spotify'
              },
              {
                quote: 'With TaskFlowAI, we\'ve streamlined our workflow and met deadlines more consistently. The team chat feature is a game-changer.',
                author: 'Alex Rivera',
                role: 'Marketing Lead',
                company: 'DocuSign'
              },
              {
                quote: 'TaskFlowAI has helped us keep all our tasks in order. The interface is clean, and it makes managing multiple projects a breeze.',
                author: 'David Lee',
                role: 'Operations Director',
                company: 'Codecademy'
              }
            ].map((t, idx) => (
              <div key={idx} className="bg-white dark:bg-[#121216] p-8 rounded-2xl border border-gray-100 dark:border-white/5 hover:shadow-md transition-shadow flex flex-col justify-between">
                <p className="text-sm text-gray-650 dark:text-gray-400 italic leading-relaxed mb-6">"{t.quote}"</p>
                <div>
                  <h5 className="font-bold text-gray-900 dark:text-white text-sm font-sans">{t.author}</h5>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-sans">{t.role} at {t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stat Strip */}
      <section className="bg-primary text-white py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: '15,000+', label: 'Projects Managed' },
            { num: '1,300+', label: 'Teams Collaborating' },
            { num: '150,000+', label: 'Tasks Completed' },
            { num: '195%', label: 'Productivity Boost' }
          ].map((stat, idx) => (
            <div key={idx}>
              <span className="text-2xl sm:text-4xl font-extrabold block mb-1 font-sans">{stat.num}</span>
              <span className="text-xs text-indigo-100 font-medium font-sans">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="bg-white dark:bg-[#121216] p-8 rounded-3xl max-w-md w-full shadow-2xl relative border border-gray-100/50 dark:border-white/5 text-left"
            >
              {/* Close button */}
              <button 
                onClick={() => setShowAuthModal(null)} 
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-655 transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              {showAuthModal === 'login' ? (
                /* LOGIN FORM */
                <div>
                  <div className="text-center mb-6">
                    <div className="w-11 h-11 bg-primary rounded-xl mx-auto flex items-center justify-center mb-3 text-white font-bold text-lg shadow-md shadow-primary/20">
                      T
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-sans">Welcome back</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-sans">Please enter your details to sign in.</p>
                  </div>

                  {/* Google OAuth Button inside Modal */}
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => { setShowAuthModal(null); navigate('/login'); }}
                      className="w-full py-2.5 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.3 7.31 24 12 24z" />
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.99 0 12s.46 3.84 1.26 5.42l4.02-3.15z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </div>


                  <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 font-sans">Email Address</label>
                      <input 
                        type="email"
                        {...loginRegister('email', { required: 'Email is required' })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm text-gray-900 dark:text-white transition-all"
                        placeholder="you@example.com"
                      />
                      {loginErrors.email && <p className="text-red-500 text-[10px] mt-1 font-semibold font-sans">{loginErrors.email.message}</p>}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 font-sans">Password</label>
                        <button type="button" className="text-[10px] text-primary font-bold hover:underline font-sans cursor-pointer">Forgot password?</button>
                      </div>
                      <input 
                        type="password"
                        {...loginRegister('password', { required: 'Password is required' })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm text-gray-900 dark:text-white transition-all"
                        placeholder="••••••••"
                      />
                      {loginErrors.password && <p className="text-red-500 text-[10px] mt-1 font-semibold font-sans">{loginErrors.password.message}</p>}
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-md shadow-primary/20 mt-2 cursor-pointer font-sans"
                    >
                      Sign In
                    </button>
                  </form>

                  <p className="text-center text-xs text-gray-500 dark:text-gray-450 mt-6 font-medium font-sans">
                    Don't have an account?{' '}
                    <button 
                      onClick={() => setShowAuthModal('register')} 
                      className="text-primary font-bold hover:underline cursor-pointer font-sans"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              ) : (
                /* REGISTER FORM */
                <div>
                  <div className="text-center mb-6">
                    <div className="w-11 h-11 bg-primary rounded-xl mx-auto flex items-center justify-center mb-3 text-white font-bold text-lg shadow-md shadow-primary/20">
                      T
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white font-sans">Create an account</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-sans">Start managing your projects today.</p>
                  </div>

                  <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 font-sans">Full Name</label>
                      <input 
                        type="text"
                        {...registerRegister('name', { required: 'Name is required' })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm text-gray-900 dark:text-white transition-all"
                        placeholder="John Doe"
                      />
                      {registerErrors.name && <p className="text-red-500 text-[10px] mt-1 font-semibold font-sans">{registerErrors.name.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 font-sans">Email Address</label>
                      <input 
                        type="email"
                        {...registerRegister('email', { required: 'Email is required' })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm text-gray-900 dark:text-white transition-all"
                        placeholder="you@example.com"
                      />
                      {registerErrors.email && <p className="text-red-500 text-[10px] mt-1 font-semibold font-sans">{registerErrors.email.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 font-sans">Password</label>
                      <input 
                        type="password"
                        {...registerRegister('password', { 
                          required: 'Password is required',
                          minLength: { value: 6, message: 'Password must be at least 6 characters' }
                        })}
                        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm text-gray-900 dark:text-white transition-all"
                        placeholder="••••••••"
                      />
                      {registerErrors.password && <p className="text-red-500 text-[10px] mt-1 font-semibold font-sans">{registerErrors.password.message}</p>}
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-md shadow-primary/20 mt-2 cursor-pointer font-sans"
                    >
                      Create Account
                    </button>
                  </form>

                  <p className="text-center text-xs text-gray-500 dark:text-gray-455 mt-6 font-medium font-sans">
                    Already have an account?{' '}
                    <button 
                      onClick={() => setShowAuthModal('login')} 
                      className="text-primary font-bold hover:underline cursor-pointer font-sans"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#09090b] py-12 px-6 border-t border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">P</div>
            <span className="font-bold text-gray-900 dark:text-white font-sans">Project Dock</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-sans">© 2026 Project Dock. All rights reserved.</p>

        </div>
      </footer>
    </div>
  );
};

export default Landing;
