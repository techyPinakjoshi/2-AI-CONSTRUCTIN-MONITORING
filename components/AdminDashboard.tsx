
import React, { useState } from 'react';
import { X, Users, Download, Trash2, Search, Filter, ShieldCheck, Mail, Calendar } from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock User Data
  const [users, setUsers] = useState([
    { id: '1', name: 'John Sharma', email: 'john@civilworks.in', signupDate: '2023-10-15', lastActive: '2023-11-20', chats: 42, method: 'Google' },
    { id: '2', name: 'Eng. Sarah Lee', email: 'sarah.lee@buildglobal.com', signupDate: '2023-11-01', lastActive: '2023-11-22', chats: 128, method: 'Email' },
    { id: '3', name: 'Rajesh Kumar', email: 'rajesh@lnt.com', signupDate: '2023-11-05', lastActive: '2023-11-19', chats: 15, method: 'Google' },
  ]);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    const headers = "Name,Email,Signup Date,Chats Used,Method\n";
    const rows = users.map(u => `${u.name},${u.email},${u.signupDate},${u.chats},${u.method}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'users_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/20"><ShieldCheck className="text-white" size={24}/></div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">System Administration</h2>
                    <p className="text-slate-500 text-sm">Managing registered users & site access</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 border border-slate-800 transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="text-slate-500 text-xs font-bold uppercase mb-2">Total Users</div>
                <div className="text-3xl font-bold text-white">1,248</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="text-slate-500 text-xs font-bold uppercase mb-2">Active Today</div>
                <div className="text-3xl font-bold text-cyan-400">84</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="text-slate-500 text-xs font-bold uppercase mb-2">Total AI Queries</div>
                <div className="text-3xl font-bold text-green-400">14.2k</div>
            </div>
        </div>

        {/* Table Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                    <input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name or email..." 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-300 focus:ring-1 focus:ring-cyan-500 outline-none"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700 transition-colors">
                        <Filter size={14}/> Filter
                    </button>
                    <button onClick={exportCSV} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-xs hover:bg-cyan-500 transition-colors">
                        <Download size={14}/> Export CSV
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-800/50 text-[10px] uppercase font-bold text-slate-500 sticky top-0">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4">Chats</th>
                            <th className="px-6 py-4">Method</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-800/30 group transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-cyan-400 border border-slate-700">
                                            {user.name[0]}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white">{user.name}</div>
                                            <div className="text-[10px] text-slate-500 flex items-center gap-1"><Mail size={10}/> {user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold border border-green-500/20">Active</span>
                                </td>
                                <td className="px-6 py-4 text-[10px] text-slate-400">
                                    <div className="flex items-center gap-1"><Calendar size={10}/> {user.signupDate}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-mono text-slate-300">{user.chats}</span>
                                </td>
                                <td className="px-6 py-4 text-[10px] text-slate-400">
                                    {user.method}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 size={16}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
