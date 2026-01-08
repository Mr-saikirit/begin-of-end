
import React, { useState, useMemo } from 'react';
import { Donation, User, DonationStatus, UserRole } from '../types';

interface AdminDashboardProps {
  allDonations: Donation[];
  allUsers: User[];
  onUpdateStatus: (id: string, status: DonationStatus) => void;
}

type SortField = 'itemName' | 'donorName' | 'status';
type SortDirection = 'asc' | 'desc';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ allDonations, allUsers, onUpdateStatus }) => {
  const [sortField, setSortField] = useState<SortField>('itemName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedDonations = useMemo(() => {
    return [...allDonations].sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [allDonations, sortField, sortDirection]);

  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return allUsers;
    const query = userSearchQuery.toLowerCase();
    return allUsers.filter(u => 
      u.name.toLowerCase().includes(query) || 
      u.email.toLowerCase().includes(query)
    );
  }, [allUsers, userSearchQuery]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="ml-1 text-slate-300">↕</span>;
    return <span className="ml-1 text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Admin Command Center</h2>
        <p className="text-slate-500">Monitor platform activity and manage safety.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Users</div>
          <div className="text-3xl font-bold text-slate-900">{allUsers.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Donors</div>
          <div className="text-3xl font-bold text-indigo-600">{allUsers.filter(u => u.role === UserRole.DONOR).length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Donations</div>
          <div className="text-3xl font-bold text-green-600">{allDonations.filter(d => d.status === DonationStatus.AVAILABLE).length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pending Requests</div>
          <div className="text-3xl font-bold text-amber-600">{allDonations.filter(d => d.status === DonationStatus.REQUESTED).length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-lg">Platform Donations</h3>
          </div>
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th 
                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleSort('itemName')}
                  >
                    Item <SortIcon field="itemName" />
                  </th>
                  <th 
                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleSort('donorName')}
                  >
                    Donor <SortIcon field="donorName" />
                  </th>
                  <th 
                    className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleSort('status')}
                  >
                    Status <SortIcon field="status" />
                  </th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedDonations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No donations available.</td>
                  </tr>
                ) : (
                  sortedDonations.map(d => (
                    <tr key={d.id} className="text-sm hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-medium">{d.itemName}</td>
                      <td className="px-6 py-4 text-slate-500">{d.donorName}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === DonationStatus.AVAILABLE ? 'bg-green-100 text-green-700' :
                          d.status === DonationStatus.REJECTED ? 'bg-red-100 text-red-700' :
                          d.status === DonationStatus.REQUESTED ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {d.status !== DonationStatus.REJECTED ? (
                          <button 
                            onClick={() => onUpdateStatus(d.id, DonationStatus.REJECTED)}
                            className="text-red-500 hover:text-red-700 font-bold text-xs"
                          >
                            Flag/Hide
                          </button>
                        ) : (
                          <button 
                            onClick={() => onUpdateStatus(d.id, DonationStatus.AVAILABLE)}
                            className="text-green-500 hover:text-green-700 font-bold text-xs"
                          >
                            Restore
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b space-y-3">
            <h3 className="font-bold text-slate-900 text-lg">User Directory</h3>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                className="w-full pl-9 pr-4 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
              />
              <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[350px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm">No users found matching "{userSearchQuery}"</td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="text-sm hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-medium">{u.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                          u.role === UserRole.DONOR ? 'bg-indigo-100 text-indigo-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 truncate max-w-[150px]">{u.email}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
