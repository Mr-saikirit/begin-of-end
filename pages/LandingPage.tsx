
import React from 'react';

export const LandingPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-20 py-12">
      <section className="text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight">
          Sharing <span className="text-indigo-600">Resources</span>,<br />
          Transforming Lives.
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          The simplest way to donate food, clothes, books, and medicine to those who need them most in your local community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button 
            onClick={() => onNavigate('signup')}
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition transform hover:-translate-y-1 shadow-lg shadow-indigo-200"
          >
            Join as a Donor
          </button>
          <button 
            onClick={() => onNavigate('browse')}
            className="px-8 py-4 bg-white border-2 border-indigo-100 text-indigo-600 rounded-xl font-bold text-lg hover:bg-indigo-50 transition transform hover:-translate-y-1"
          >
            Find Donations
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900">Post an Item</h3>
          <p className="text-slate-600">List available resources like surplus food, unused clothes, or spare books in minutes.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900">Browse & Request</h3>
          <p className="text-slate-600">NGOs and individuals can search by location and category to find exactly what they need.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900">Impact Verified</h3>
          <p className="text-slate-600">A transparent system where donors track their impact and admins ensure community trust.</p>
        </div>
      </section>

      <section className="bg-indigo-900 rounded-3xl p-12 text-center text-white space-y-6">
        <h2 className="text-3xl font-bold">Ready to make a difference?</h2>
        <p className="text-indigo-200 text-lg">It only takes 60 seconds to create an account and list your first donation.</p>
        <button 
          onClick={() => onNavigate('signup')}
          className="px-10 py-4 bg-white text-indigo-900 rounded-xl font-bold text-lg hover:bg-slate-100 transition"
        >
          Get Started Now
        </button>
      </section>
    </div>
  );
};
