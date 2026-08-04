import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register: registerField, handleSubmit, formState: { errors }, watch } = useForm();
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (data) => {
    const success = await register(data.name, data.email, data.password);
    if (success) {
      const returnTo = location.state?.returnTo || '/dashboard';
      navigate(returnTo);
    }
  };

  const password = watch('password');

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-color px-4 py-8">
      <div className="max-w-md w-full bg-surface-color p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl leading-none">T</span>
          </div>
          <h2 className="text-2xl font-bold text-text-color">Create an account</h2>
          <p className="text-text-muted mt-2">Start managing your projects today.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-color mb-1">Full Name</label>
            <input
              type="text"
              {...registerField('name', { required: 'Name is required' })}
              className="saas-input w-full"
              placeholder="Enter your full name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-color mb-1">Email address</label>
            <input
              type="email"
              {...registerField('email', { required: 'Email is required' })}
              className="saas-input w-full"
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-color mb-1">Password</label>
            <input
              type="password"
              {...registerField('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              className="saas-input w-full"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
          >
            Create account
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
