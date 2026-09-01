import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { Workflow, ShieldAlert, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('aarav.sharma@enterprise.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    try {
      setLoading(true);
      setError('');
      await login(demoEmail, 'Password123!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-500/30 mb-4">
          <Workflow className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          FLOW<span className="text-indigo-400">SYNC</span> ENTERPRISE
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Business Workflow & Operations Management Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                placeholder="name@enterprise.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Evaluator Quick Persona Picker */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
              Evaluator Persona Quick-Select
            </p>
            <p className="text-[10px] text-slate-400 mb-3 text-center">
              Click any demo account to test role permissions:
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {DEMO_ACCOUNTS.map((acc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDemoSelect(acc.email)}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-[11px] font-medium border border-slate-200 transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{acc.label}</span>
                  <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono shrink-0 ml-1">
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
