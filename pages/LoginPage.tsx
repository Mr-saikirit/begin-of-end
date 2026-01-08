
import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (email: string) => void;
  onNavigate: (page: string) => void;
  error: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigate, error }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email);
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition mt-4 shadow-md"
          >
            Login
          </button>
        </form>
        <div className="mt-8 text-center text-sm text-slate-500">
          Don't have an account? <button onClick={() => onNavigate('signup')} className="text-indigo-600 font-bold hover:underline">Sign up</button>
        </div>
      </div>
      <div className="mt-6 text-center text-xs text-slate-400">
        Tip: Default admin is <strong>admin@givebound.com</strong>
      </div>
    </div>
  );
};
