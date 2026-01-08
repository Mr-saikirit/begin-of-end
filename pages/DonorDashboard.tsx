
import React from 'react';
import { Donation, User, DonationStatus } from '../types';

interface DonorDashboardProps {
  donations: Donation[];
  user: User;
  onPost: () => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({ donations, user, onPost }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Donor Dashboard</h2>
          <p className="text-slate-500">Manage your contributions and track impact.</p>
        </div>
        <button 
          onClick={onPost}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition"
        >
          Post New Donation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-slate-500 text-sm font-medium mb-1">Total Contributions</div>
          <div className="text-3xl font-bold text-slate-900">{donations.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-slate-500 text-sm font-medium mb-1">Pending Requests</div>
          <div className="text-3xl font-bold text-amber-600">{donations.filter(d => d.status === DonationStatus.REQUESTED).length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-slate-500 text-sm font-medium mb-1">Items Fulfilled</div>
          <div className="text-3xl font-bold text-green-600">{donations.filter(d => d.status === DonationStatus.FULFILLED).length}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h3 className="font-bold text-slate-900">Your Donation History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Recipient</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {donations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">You haven't posted any donations yet.</td>
                </tr>
              ) : (
                donations.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">{d.itemName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        d.status === DonationStatus.AVAILABLE ? 'bg-green-100 text-green-700' :
                        d.status === DonationStatus.REQUESTED ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{d.receiverName || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
