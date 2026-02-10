
import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { UserRole, UserProfile } from '../types';
import { UserPlus, Shield, Briefcase, UserCircle, Search, Mail, Key, UserCheck, X } from 'lucide-react';

const UserManagement: React.FC = () => {
  const { user, allUsers, addUser } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDept, setNewDept] = useState('PRIMARY');
  const [newClass, setNewClass] = useState('P1');

  const canAddRole = user?.role === UserRole.SUPER_ADMIN ? UserRole.SUB_ADMIN : UserRole.TEACHER;
  
  const filteredUsers = allUsers.filter(u => 
    u.role === canAddRole && 
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newUser: UserProfile = {
      uid: `u_${Date.now()}`,
      name: newName,
      email: newEmail,
      role: canAddRole,
      schoolId: user?.schoolId || 's1',
      departmentId: canAddRole === UserRole.SUB_ADMIN ? newDept : undefined,
      assignedClassId: canAddRole === UserRole.TEACHER ? newClass : undefined
    };

    addUser(newUser);
    setIsModalOpen(false);
    setNewName('');
    setNewEmail('');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
            {user?.role === UserRole.SUPER_ADMIN ? <Shield className="text-indigo-600" /> : <Briefcase className="text-indigo-600" />}
            {user?.role === UserRole.SUPER_ADMIN ? 'Administrative Control' : 'Staff Registry'}
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            {user?.role === UserRole.SUPER_ADMIN 
              ? 'Provision and manage Sub-Administrative credentials (HODs/Principals).' 
              : 'Onboard and manage teaching faculty for your department.'}
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <UserPlus size={18} /> {user?.role === UserRole.SUPER_ADMIN ? 'Add Sub-Admin' : 'Onboard Teacher'}
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <UserCheck size={20} className="text-emerald-500" /> 
            Active {user?.role === UserRole.SUPER_ADMIN ? 'Administrators' : 'Faculty Members'} ({filteredUsers.length})
          </h3>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter list..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border-slate-200 rounded-xl pl-12 pr-4 py-2 text-xs font-bold w-full md:w-64 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                <th className="px-8 py-4">Identity</th>
                <th className="px-8 py-4">Role / Scope</th>
                <th className="px-8 py-4">Contact</th>
                <th className="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.length > 0 ? filteredUsers.map(u => (
                <tr key={u.uid} className="hover:bg-slate-50/50 transition">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{u.uid}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">{u.role === UserRole.SUB_ADMIN ? 'Sub-Administrator' : 'Class Instructor'}</span>
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{u.departmentId || `Class ${u.assignedClassId}`}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Mail size={14} className="text-slate-300" /> {u.email}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest">Active Access</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic text-sm font-medium">
                    No matching personnel found in the directory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboarding Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg"><UserPlus size={20} /></div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">System Provisioning</h2>
                  <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Generating Immutable Credentials</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-10 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Legal Name</label>
                  <input 
                    type="text" 
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Institutional Email</label>
                  <input 
                    type="email" 
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="name@educhain.com"
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                
                {canAddRole === UserRole.SUB_ADMIN ? (
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assigned Department</label>
                    <select 
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="PRIMARY">Primary Education (K-6)</option>
                      <option value="SECONDARY">Secondary Block (JSS-SS)</option>
                      <option value="REGISTRY">Institutional Registry</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assigned Classroom</label>
                    <select 
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="P1">Primary 1</option>
                      <option value="P4">Primary 4</option>
                      <option value="SS1">Senior Secondary 1</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                >
                  <Key size={16} /> Activate Access
                </button>
              </div>
              <p className="text-[9px] text-center text-slate-400 font-bold uppercase leading-relaxed">
                By activating, you confirm this individual has passed institutional vetting. <br/> Access is audited per ISO 27001 standards.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
