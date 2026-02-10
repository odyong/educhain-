
import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { Camera, Save, User, Mail, Shield, CheckCircle } from 'lucide-react';

const ProfileSettings: React.FC = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [photoInput, setPhotoInput] = useState(user?.photoURL || '');
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile({ photoURL: photoInput, name });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Professional Identity</h1>
        <p className="text-slate-500">Manage your administrative profile and professional photo.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-indigo-100 flex items-center justify-center">
              {photoInput ? (
                <img src={photoInput} className="w-full h-full object-cover" />
              ) : (
                <User size={64} className="text-indigo-300" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
              <Camera className="text-white" />
            </div>
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-800">{user?.name}</h2>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Class Teacher & Admin</p>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Professional Photo URL</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={photoInput}
                onChange={(e) => setPhotoInput(e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition">
                Browse
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Recommended: Square aspect ratio, minimum 400x400px.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Display Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Work Email</label>
              <input 
                type="email" 
                value={user?.email}
                disabled
                className="w-full rounded-xl border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-4">
            <Shield className="text-indigo-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-indigo-900">Administrative Status: Active</p>
              <p className="text-xs text-indigo-700 leading-relaxed">
                As a Class Teacher, you have been automatically granted administrative rights to promote students, 
                edit class records, and send school-wide messages.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={handleSave}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold shadow-lg transition transform active:scale-95 ${
              saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {saved ? <CheckCircle size={20} /> : <Save size={20} />}
            {saved ? 'Changes Saved!' : 'Update Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
