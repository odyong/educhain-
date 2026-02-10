
import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { Settings, Save, RefreshCw, Calendar, Tag, ShieldCheck, Database, CheckCircle } from 'lucide-react';

const ConfigPanel: React.FC = () => {
  const { schoolConfig, updateSchoolConfig } = useContext(AuthContext);
  const [localConfig, setLocalConfig] = useState(schoolConfig);
  const [saved, setSaved] = useState(false);

  const handleUpdateClassName = (id: string, name: string) => {
    setLocalConfig(prev => ({
      ...prev,
      classLabels: { ...prev.classLabels, [id]: name }
    }));
  };

  const handleSave = () => {
    updateSchoolConfig(localConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Settings className="text-indigo-600" />
          Global Configuration
        </h1>
        <p className="text-slate-500 mt-1">Define school structure, session timing, and dynamic labels.</p>
      </div>

      <div className="space-y-8">
        {/* Academic Session */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Calendar size={20} className="text-indigo-600" />
              Academic Cycle
            </h3>
            <span className="text-xs font-bold text-indigo-600 px-2 py-1 bg-indigo-50 rounded">Live Update</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Current Session</label>
              <select 
                value={localConfig.academicSession}
                onChange={(e) => setLocalConfig({...localConfig, academicSession: e.target.value})}
                className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 py-3"
              >
                <option value="2024/2025">2024 / 2025 Session</option>
                <option value="2025/2026">2025 / 2026 Session</option>
                <option value="2026/2027">2026 / 2027 Session</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Current Term</label>
              <select 
                value={localConfig.currentTerm}
                onChange={(e) => setLocalConfig({...localConfig, currentTerm: e.target.value as any})}
                className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 py-3"
              >
                <option value="1st">First Term</option>
                <option value="2nd">Second Term</option>
                <option value="3rd">Third Term</option>
              </select>
            </div>
          </div>
        </section>

        {/* Dynamic Class Labels */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Tag size={20} className="text-indigo-600" />
            Class Nomenclature
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Customize how classes are displayed throughout the app. Changes here update all student profile labels instantly.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(localConfig.classLabels).map(([id, name]) => (
              <div key={id} className="flex flex-col gap-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 transition">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter">System ID: {id}</span>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => handleUpdateClassName(id, e.target.value)}
                  className="w-full border-none bg-transparent focus:ring-0 font-bold text-slate-700 p-0"
                />
              </div>
            ))}
          </div>
          
          <button className="mt-6 flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline">
            <RefreshCw size={16} />
            Add New Class ID
          </button>
        </section>

        {/* Security / System */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-indigo-900 text-white p-8 rounded-3xl shadow-xl shadow-indigo-100 relative overflow-hidden">
            <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5" />
            <h3 className="text-lg font-bold mb-2">Audit Logs</h3>
            <p className="text-indigo-200 text-sm mb-6 leading-relaxed">
              Every sensitive action (Bio-data edits, Promotions, Account Creation) is cryptographically signed and archived.
            </p>
            <button className="bg-white text-indigo-900 px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-50 transition">
              View Activity Trail
            </button>
          </div>

          <div className="bg-slate-800 text-white p-8 rounded-3xl shadow-xl shadow-slate-100 relative overflow-hidden">
            <Database className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5" />
            <h3 className="text-lg font-bold mb-2">Data Retention</h3>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Your data is currently mirrored across 3 regions for 15-year persistence compliance.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs text-green-400 font-bold uppercase tracking-widest">Storage Status: Optimal</span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-8 flex justify-end">
          <button 
            onClick={handleSave}
            className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-bold shadow-2xl transition transform hover:-translate-y-1 ${
              saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            {saved ? <CheckCircle size={20} /> : <Save size={20} />}
            {saved ? 'Settings Applied' : 'Apply System Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
