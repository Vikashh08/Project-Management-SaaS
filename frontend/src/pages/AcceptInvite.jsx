import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [status, setStatus] = useState('loading'); // loading, success, error, needs_login
  const [message, setMessage] = useState('Verifying invitation...');

  useEffect(() => {
    if (!user) {
      setStatus('needs_login');
      setMessage('You must be logged in to accept an invitation.');
      return;
    }

    const acceptInvitation = async () => {
      try {
        const { data } = await api.post(`/invites/accept/${token}`);
        setStatus('success');
        setMessage(data.message || 'Successfully joined the organization!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Invalid or expired invitation link.');
      }
    };

    acceptInvitation();
  }, [token, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-md w-full text-center">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Processing Invite</h2>
            <p className="text-gray-500 mt-2">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invitation Accepted!</h2>
            <p className="text-gray-500 mt-2">{message}</p>
            <p className="text-sm text-gray-400 mt-4">Redirecting you to dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invitation Failed</h2>
            <p className="text-gray-500 mt-2">{message}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {status === 'needs_login' && (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Authentication Required</h2>
            <p className="text-gray-500 mt-2">You need to log in or create an account to accept this invitation.</p>
            <div className="flex space-x-4 mt-6">
              <button 
                onClick={() => navigate('/login', { state: { returnTo: `/invite/${token}` } })}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Log In
              </button>
              <button 
                onClick={() => navigate('/register', { state: { returnTo: `/invite/${token}` } })}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AcceptInvite;
