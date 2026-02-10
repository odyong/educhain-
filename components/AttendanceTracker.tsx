
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../App';
import { MOCK_STUDENTS } from '../constants';
import { AttendanceStatus, UserRole } from '../types';
import { CheckCircle, XCircle, Clock, Calendar, Users, Save, Check, RefreshCw, Info, Lock } from 'lucide-react';

const AttendanceTracker: React.FC = () => {
  const { user, schoolConfig, saveAttendance } = useContext(AuthContext);
  
  const defaultClass = (user?.role === UserRole.TEACHER && user?.assignedClassId) 
    ? user.assignedClassId 
    : 'P4';

  const [selectedClass, setSelectedClass] = useState(defaultClass);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const students = MOCK_STUDENTS.filter(s => s.classId === selectedClass);

  useEffect(() => {
    const initial: Record<string, AttendanceStatus> = {};
    students.forEach(s => {
      initial[s.id] = AttendanceStatus.PRESENT;
    });
    setAttendance(initial);
  }, [selectedClass, students.length]);

  const updateStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const updated = { ...attendance };
    students.forEach(s => { updated[s.id] = AttendanceStatus.PRESENT; });
    setAttendance(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Persist to Context Store
    saveAttendance(selectedDate, attendance);
    await new Promise(r => setTimeout(r, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const stats = {
    present: Object.values(attendance).filter(s => s === AttendanceStatus.PRESENT).length,
    absent: Object.values(attendance).filter(s => s === AttendanceStatus.ABSENT).length,
    late: Object.values(attendance).filter(s => s === AttendanceStatus.LATE).length,
  };

  const isTeacher = user?.role === UserRole.TEACHER;
  const canModifyAttendance = !isTeacher || user?.assignedClassId === selectedClass;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <CheckCircle className="text-emerald-600" />
            {isTeacher ? 'Class Roll Call' : 'Daily Attendance'}
          </h1>
          <p className="text-slate-500 mt-1">
            {isTeacher 
              ? `Recording attendance for Class ${schoolConfig.classLabels[user?.assignedClassId || '']}.` 
              : 'Attendance data is archived and used for generating Final Exam Report Cards.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <Calendar size={18} className="text-slate-400" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-none p-0 text-sm font-bold text-slate-700 focus:ring-0"
            />
          </div>
          
          <div className="relative">
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={isTeacher}
              className={`px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-700 focus:ring-indigo-500 ${isTeacher ? 'bg-slate-50 cursor-not-allowed opacity-75' : ''}`}
            >
              {Object.entries(schoolConfig.classLabels).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
            {isTeacher && <Lock size={12} className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400" />}
          </div>
        </div>
      </div>

      {!canModifyAttendance && (
        <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-3 text-amber-800">
          <Lock size={20} className="shrink-0" />
          <p className="text-sm font-medium">Read-only mode for this cohort.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden ${!canModifyAttendance ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">{schoolConfig.classLabels[selectedClass]} Roll Call</h3>
              {canModifyAttendance && (
                <button onClick={markAllPresent} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition">Mark All Present</button>
              )}
            </div>
            <div className="divide-y divide-slate-100">
              {students.length > 0 ? students.map(student => (
                <div key={student.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{student.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{student.studentIdCard}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => updateStatus(student.id, AttendanceStatus.PRESENT)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${attendance[student.id] === AttendanceStatus.PRESENT ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500'}`}>Present</button>
                    <button onClick={() => updateStatus(student.id, AttendanceStatus.ABSENT)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${attendance[student.id] === AttendanceStatus.ABSENT ? 'bg-rose-600 text-white shadow-md' : 'text-slate-500'}`}>Absent</button>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center text-slate-400 italic text-sm">No students found in this class scope.</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><RefreshCw size={18} /> Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between p-3 bg-emerald-50 rounded-2xl"><span className="text-sm font-bold">Present</span><span className="font-black">{stats.present}</span></div>
              <div className="flex justify-between p-3 bg-rose-50 rounded-2xl"><span className="text-sm font-bold">Absent</span><span className="font-black">{stats.absent}</span></div>
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving || !canModifyAttendance || students.length === 0}
              className={`w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition ${isSaving ? 'bg-slate-300' : saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'} ${(isSaving || !canModifyAttendance || students.length === 0) ? 'opacity-50' : ''}`}
            >
              {isSaving ? 'Saving...' : saved ? 'Archived' : 'Submit for Records'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;
