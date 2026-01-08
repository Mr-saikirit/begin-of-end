
import React from 'react';
import { Donation, User, DonationStatus } from '../types';

interface ReceiverDashboardProps {
  requests: Donation[];
  user: User;
  onBrowse: () => void;
}

export const ReceiverDashboard: React.FC<ReceiverDashboardProps> = ({ requests, user, onBrowse }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Receiver Dashboard</h2>
          <p className="text-slate-500">Track your requested resources and find new ones.</p>
        </div>
        <button 
          onClick={onBrowse}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition"
        >
          Find More Resources
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h3 className="font-bold text-slate-900">Your Resource Requests</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Donor</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">You haven't requested any resources yet.</td>
                </tr>
              ) : (
                requests.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">{d.itemName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{d.donorName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{d.location}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        d.status === DonationStatus.REQUESTED ? 'bg-amber-100 text-amber-700' :
                        d.status === DonationStatus.FULFILLED ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {d.status}
                      </span>
                    </td>
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
