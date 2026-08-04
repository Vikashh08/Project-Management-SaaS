import React from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { 
  ArrowRight, CheckCircle2, Play, Users, BarChart3, 
  CheckSquare, Globe, ArrowUpRight, MessageSquare, Shield, Zap 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fafafc] text-[#1a1a2e] font-sans selection:bg-primary/20 selection:text-primary">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-55 bg-white/80 backdrop-blur-md border-b border-gray-100/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-white font-bold text-lg leading-none">T</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-text-color">
              TaskFlow<span className="text-primary">AI</span>
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Features</a>
            <a href="#benefits" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Benefits</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Testimonials</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Pricing</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={() => navigate('/')} 
                className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all shadow-md shadow-primary/25 hover:shadow-primary/45 active:scale-[0.98] flex items-center gap-1.5"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-primary transition-colors">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all shadow-md shadow-primary/25 hover:shadow-primary/45 active:scale-[0.98]"
                >
                  Get Started
                </Link>
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
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.15] mb-6 max-w-4xl mx-auto"
          >
            Effortless task management, <span className="text-[#f59e0b]">anytime</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Manage tasks and projects easily with an all-in-one platform designed for seamless collaboration and smart workflows.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-20"
          >
            <Link 
              to={user ? '/' : '/register'}
              className="px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 flex items-center gap-2 hover:-translate-y-0.5"
            >
              Request a Demo
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#features"
              className="px-8 py-4 bg-white text-gray-700 font-bold rounded-2xl hover:bg-gray-50 border border-gray-200 transition-all hover:-translate-y-0.5"
            >
              Explore Features
            </a>
          </motion.div>

          {/* Interactive HTML/CSS Mockups (Browser + Phone Overlay) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative max-w-5xl mx-auto"
          >
            {/* Browser Mockup */}
            <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden text-left aspect-[16/10] w-full">
              {/* Browser Window Header */}
              <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="bg-white/80 border border-gray-100/50 rounded-lg text-[10px] text-gray-400 px-3 py-1 w-64 mx-auto text-center truncate">
                  app.taskflowai.com/dashboard
                </div>
              </div>

              {/* Browser App Layout */}
              <div className="flex h-full text-xs text-gray-800">
                {/* Mock Sidebar */}
                <div className="w-1/5 bg-gray-50/50 border-r border-gray-100 p-3 hidden sm:flex flex-col gap-4">
                  <div className="font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-primary rounded-md flex items-center justify-center text-white text-[10px]">T</div>
                    TaskFlowAI
                  </div>
                  <div className="space-y-1">
                    <div className="p-1.5 bg-primary/10 text-primary rounded-lg font-semibold">Home</div>
                    <div className="p-1.5 text-gray-500">Projects</div>
                    <div className="p-1.5 text-gray-500">Tasks</div>
                    <div className="p-1.5 text-gray-500">Teams</div>
                  </div>
                </div>

                {/* Mock Content */}
                <div className="flex-1 p-4 sm:p-6 bg-white overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Hello, Cecilia</h4>
                      <p className="text-gray-400 text-[10px]">Let's get things done!</p>
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
                      <div key={idx} className="p-2.5 border border-gray-100 rounded-xl bg-gray-50/50">
                        <span className="text-gray-400 text-[9px] block mb-0.5">{s.label}</span>
                        <span className="font-bold text-gray-800 text-sm">{s.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tasks List */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-gray-900">Ongoing Tasks</span>
                      <span className="text-[10px] text-primary font-semibold">View All</span>
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { title: 'UI Kit Development', label: 'Important', col: 'bg-orange-100 text-orange-700' },
                        { title: 'Client Feedback Review', label: 'OK', col: 'bg-green-100 text-green-700' },
                        { title: 'Sprint Planning', label: 'Meh', col: 'bg-yellow-100 text-yellow-700' }
                      ].map((t, idx) => (
                        <div key={idx} className="p-3 border border-gray-100 rounded-xl flex items-center justify-between hover:shadow-sm transition-shadow bg-white">
                          <div className="flex items-center gap-3">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${t.col}`}>{t.label}</span>
                            <span className="font-semibold text-gray-800">{t.title}</span>
                          </div>
                          <div className="flex -space-x-1.5">
                            <div className="w-5 h-5 rounded-full bg-indigo-200 border border-white"></div>
                            <div className="w-5 h-5 rounded-full bg-purple-200 border border-white"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Phone Mockup Overlay */}
            <div className="absolute right-[5%] bottom-[-10%] w-[220px] bg-gray-900 p-2.5 rounded-[36px] shadow-2xl hidden md:block border-4 border-gray-800">
              <div className="bg-white rounded-[28px] overflow-hidden aspect-[9/19] w-full text-left p-4 relative">
                {/* Speaker/Camera notch */}
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-3 bg-gray-900 rounded-full"></div>

                <div className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-xs">TaskFlowAI</span>
                    <span className="text-[9px] text-gray-400">English</span>
                  </div>

                  {/* Hello */}
                  <div className="mb-4">
                    <h5 className="text-sm font-bold">Welcome Back</h5>
                    <p className="text-[10px] text-gray-400">Your workspace is ready.</p>
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
                  <span className="font-bold text-[10px] text-gray-800 block mb-2">Today's schedule</span>
                  <div className="space-y-2">
                    {['Team Standup', 'Deploy v2.0'].map((task, i) => (
                      <div key={i} className="p-2.5 border border-gray-100 rounded-xl flex items-center justify-between bg-white text-[10px]">
                        <span className="font-medium text-gray-700">{task}</span>
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
      <section className="bg-white py-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">We are trusted by</p>
          <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
            <span className="font-bold text-xl text-gray-600 font-sans tracking-tight">mailchimp</span>
            <span className="font-bold text-xl text-gray-600 font-sans tracking-tight">DOORDASH</span>
            <span className="font-bold text-xl text-gray-600 font-sans tracking-tight">Google</span>
            <span className="font-bold text-xl text-gray-600 font-sans tracking-tight">Spotify</span>
            <span className="font-bold text-xl text-gray-600 font-sans tracking-tight">Webflow</span>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 px-6 bg-[#fafafc]">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block font-semibold">Benefits</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">The smart choice for your team</h2>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto">Everything you need to simplify your projects, boost productivity, and keep your team aligned.</p>
        </div>

        {/* Features / Benefits Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              num: '01',
              title: 'To-do List',
              desc: 'Organize your daily tasks effortlessly with our intuitive to-do list. Stay focused and prioritize what matters most.',
              icon: CheckSquare,
              color: 'bg-amber-500'
            },
            {
              num: '02',
              title: 'Team Member Tracking',
              desc: 'Easily track your team members\' progress and stay connected. Ensure everyone is aligned and working towards shared goals.',
              icon: Users,
              color: 'bg-primary'
            },
            {
              num: '03',
              title: 'Project Tracking',
              desc: 'Monitor project timelines and milestones in real-time. Keep projects on track and meet your deadlines with confidence.',
              icon: BarChart3,
              color: 'bg-emerald-500'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <span className="text-4xl font-extrabold text-gray-100 group-hover:text-primary/10 transition-colors absolute right-6 top-6">{item.num}</span>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6 ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Powerful Features Detail */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block font-semibold">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Powerful Features to Elevate Your Workflow</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: 'Make Smart Decisions', desc: 'Get real-time insights, reports, and alerts to help you make more informed decisions.', icon: Shield },
                { title: 'Optimize Your Goals', desc: 'Track your progress and stay aligned with personal or project goals using smart tracking tools.', icon: Zap },
                { title: 'Task management', desc: 'Easily manage tasks, deadlines, and priorities to keep projects running smoothly.', icon: CheckSquare },
                { title: 'Team chat', desc: 'Stay connected with real-time messaging, making team collaboration easier.', icon: MessageSquare }
              ].map((f, i) => (
                <div key={i} className="p-6 border border-gray-100 rounded-2xl hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{f.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Visual demo representation */}
            <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-8 rounded-3xl relative overflow-hidden shadow-2xl min-h-[350px] flex flex-col justify-between">
              <div className="absolute right-[-20%] top-[-20%] w-72 h-72 rounded-full bg-white/5 pointer-events-none"></div>
              <div>
                <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2 block font-semibold">Live Preview</span>
                <h3 className="text-2xl font-bold mb-4 font-sans">See how TaskFlowAI works in 2 minutes</h3>
                <p className="text-sm text-indigo-100 leading-relaxed max-w-sm">Learn how to streamline tasks, manage your teammates, and track organization health easily.</p>
              </div>
              <div>
                <button 
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-white text-primary font-bold rounded-xl shadow-lg flex items-center gap-2 hover:bg-indigo-50 transition-colors"
                >
                  <Play className="w-4 h-4 fill-primary" />
                  Play Demo Video
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-[#fafafc] border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block font-semibold">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-sans">What our users say</h2>
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
              <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
                <p className="text-sm text-gray-600 italic leading-relaxed mb-6">"{t.quote}"</p>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm font-sans">{t.author}</h5>
                  <p className="text-xs text-gray-400 font-sans">{t.role} at {t.company}</p>
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

      {/* Footer */}
      <footer className="bg-white py-12 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">T</div>
            <span className="font-bold text-gray-900 font-sans">TaskFlowAI</span>
          </div>
          <p className="text-xs text-gray-400 font-sans">© 2026 TaskFlowAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
