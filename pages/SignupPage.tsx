
import React, { useState } from 'react';
import { UserRole } from '../types';

interface SignupPageProps {
  onSignup: (data: any) => void;
  onNavigate: (page: string) => void;
  error: string | null;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onNavigate, error }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: UserRole.DONOR
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup(formData);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">Join GiveBound</h2>
        <p className="text-slate-500 text-center mb-8">Start sharing or receiving resources today.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input 
              type="tel" required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">I want to...</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setFormData({...formData, role: UserRole.DONOR})}
                className={`py-3 rounded-lg font-medium border transition ${formData.role === UserRole.DONOR ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                Donate
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, role: UserRole.RECEIVER})}
                className={`py-3 rounded-lg font-medium border transition ${formData.role === UserRole.RECEIVER ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                Receive
              </button>
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          
          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition mt-4 shadow-md"
          >
            Create Account
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-slate-500">
          Already have an account? <button onClick={() => onNavigate('login')} className="text-indigo-600 font-bold hover:underline">Log in</button>
        </div>
      </div>
    </div>
  );
};
