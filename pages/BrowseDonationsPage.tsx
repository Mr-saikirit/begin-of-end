
import React, { useState } from 'react';
import { Donation, DonationCategory, User, UserRole } from '../types';
import { CATEGORIES, CITIES } from '../constants';

interface BrowseDonationsPageProps {
  donations: Donation[];
  onRequest: (id: string) => void;
  user: User | null;
  onNavigate: (page: string) => void;
}

export const BrowseDonationsPage: React.FC<BrowseDonationsPageProps> = ({ donations, onRequest, user, onNavigate }) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterCity, setFilterCity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = donations.filter(d => {
    const matchesCategory = filterCategory === 'All' || d.category === filterCategory;
    const matchesCity = filterCity === 'All' || d.location === filterCity;
    const matchesSearch = d.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesCity && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-slate-900">Available Donations</h2>
        <div className="text-sm text-slate-500 font-medium bg-white px-4 py-2 rounded-full border border-slate-100">
          Showing {filtered.length} resources
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search items..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <select 
          className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select 
          className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
        >
          <option value="All">All Cities</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button 
          onClick={() => {setSearchQuery(''); setFilterCategory('All'); setFilterCity('All');}}
          className="text-indigo-600 font-medium hover:text-indigo-700"
        >
          Reset Filters
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <p className="text-slate-400 text-lg">No donations found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(d => (
            <div key={d.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition">
              <div className="h-40 bg-indigo-50 flex items-center justify-center">
                 <img src={`https://picsum.photos/seed/${d.id}/400/200`} alt={d.itemName} className="w-full h-full object-cover opacity-80" />
              </div>
              <div className="p-6 flex-grow space-y-3">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded uppercase tracking-wider">{d.category}</span>
                  <span className="text-xs text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{d.itemName}</h3>
                <div className="flex items-center text-slate-500 text-sm gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {d.location} • {d.quantity}
                </div>
                <p className="text-slate-600 text-sm line-clamp-2">{d.description}</p>
                {d.expiryDate && (
                  <div className="text-xs text-orange-600 font-medium">Expires: {new Date(d.expiryDate).toLocaleDateString()}</div>
                )}
              </div>
              <div className="px-6 pb-6 mt-auto">
                {!user ? (
                   <button 
                    onClick={() => onNavigate('login')}
                    className="w-full py-2.5 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition"
                   >
                     Login to Request
                   </button>
                ) : user.role === UserRole.RECEIVER ? (
                  <button 
                    onClick={() => onRequest(d.id)}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition"
                  >
                    Request Item
                  </button>
                ) : (
                  <button disabled className="w-full py-2.5 bg-slate-50 text-slate-400 rounded-lg font-medium cursor-not-allowed">
                    Donors cannot request
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
