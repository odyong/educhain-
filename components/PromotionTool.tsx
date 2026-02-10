
import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { UserRole } from '../types';
import { ArrowRight, Search, Users, Check, CheckCircle, Lock, ShieldAlert } from 'lucide-react';

const PromotionTool: React.FC = () => {
  const { user, schoolConfig, students, promoteStudents } = useContext(AuthContext);
  
  const defaultSource = (user?.role === UserRole.TEACHER && user?.assignedClassId) 
    ? user.assignedClassId 
    : 'P4';

  const [sourceClass, setSourceClass] = useState<string>(defaultSource);
  const [targetClass, setTargetClass] = useState<string>('P5');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const studentsInClass = students.filter(s => s.classId === sourceClass);

  const toggleStudent = (id: string) => {
    const next = new Set(selectedStudents);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStudents(next);
  };

  const selectAll = () => {
    if (selectedStudents.size === studentsInClass.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(studentsInClass.map(s => s.id)));
    }
  };

  const handlePromote = async () => {
    if (selectedStudents.size === 0) return;
    setIsProcessing(true);
    
    // Real State Update
    promoteStudents(Array.from(selectedStudents), targetClass);
    
    await new Promise(r => setTimeout(r, 1500));
    setIsProcessing(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setSelectedStudents(new Set());
  };

  const canModifyCohort = user?.role !== UserRole.TEACHER || user?.assignedClassId === sourceClass;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tighter uppercase">
            Promotion Engine
          </h1>
          <p className="text-slate-500 mt-1">Atomic session transitions for cohort advancement.</p>
        </div>
        {!canModifyCohort && (
          <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-xs font-bold flex items-center gap-2">
            <Lock size={14} /> Locked: Assigned Classes Only
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-indigo-600 uppercase text-xs tracking-widest">
              <Search size={18} /> Configure Transition
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">From Class</label>
                <select 
                  value={sourceClass}
                  onChange={(e) => setSourceClass(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-bold text-slate-700"
                >
                  {Object.entries(schoolConfig.classLabels).map(([id, label]) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-center">
                <ArrowRight className="text-slate-300 rotate-90 lg:rotate-0" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">To Class</label>
                <select 
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 font-bold text-slate-700"
                >
                  {Object.entries(schoolConfig.classLabels).map(([id, label]) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 text-white p-6 rounded-3xl relative overflow-hidden">
            <ShieldAlert className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" />
            <p className="text-xs font-bold leading-relaxed opacity-80">
              Bulk promotion updates student metadata across the 15-year archive. 
              This operation is final and generates a system audit log.
            </p>
          </div>
        </div>

        <div className={`lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col ${!canModifyCohort ? 'opacity-50' : ''}`}>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold flex items-center gap-2">
              <Users size={18} className="text-indigo-600" />
              Cohort List ({studentsInClass.length})
            </h3>
            <button 
              onClick={selectAll}
              className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
            >
              Toggle Selection
            </button>
          </div>

          <div className="flex-1 max-h-[400px] overflow-y-auto">
            {studentsInClass.length === 0 ? (
                <div className="p-20 text-center text-slate-400 italic text-sm">No students currently in {schoolConfig.classLabels[sourceClass]}</div>
            ) : studentsInClass.map(student => (
              <div 
                key={student.id} 
                onClick={() => canModifyCohort && toggleStudent(student.id)}
                className={`p-4 flex items-center gap-4 transition cursor-pointer hover:bg-slate-50 border-b border-slate-50 ${selectedStudents.has(student.id) ? 'bg-indigo-50/50' : ''}`}
              >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition ${selectedStudents.has(student.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 bg-white'}`}>
                    {selectedStudents.has(student.id) && <Check size={14} className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{student.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{student.studentIdCard}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected</p>
              <p className="text-lg font-black text-slate-900">{selectedStudents.size}</p>
            </div>
            <button
              onClick={handlePromote}
              disabled={selectedStudents.size === 0 || isProcessing || !canModifyCohort}
              className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition transform active:scale-95 ${
                selectedStudents.size === 0 || isProcessing || !canModifyCohort
                  ? 'bg-slate-100 text-slate-400'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
              }`}
            >
              {isProcessing ? 'Updating State...' : success ? 'Success' : 'Promote Selected'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionTool;
