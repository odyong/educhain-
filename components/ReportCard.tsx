
import React, { useContext, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { AttendanceStatus } from '../types';
import { Printer, Download, ArrowLeft, GraduationCap, UserCheck } from 'lucide-react';

const ReportCard: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { schoolConfig, attendanceHistory, studentResults, students } = useContext(AuthContext);

  const student = students.find(s => s.id === id);
  const results = studentResults[id || ''] || [];

  if (!student) return <Navigate to="/students" />;

  // Calculate Attendance Stats
  let totalDays = 0;
  let presentDays = 0;
  Object.values(attendanceHistory).forEach(dayRecords => {
    if (dayRecords[student.id]) {
      totalDays++;
      if (dayRecords[student.id] === AttendanceStatus.PRESENT) presentDays++;
    }
  });

  const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 'N/A';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition">
          <ArrowLeft size={20} /> Back to Student
        </button>
        <div className="flex gap-4">
          <button 
            onClick={handlePrint} 
            className="flex items-center gap-2 bg-indigo-600 px-6 py-3 rounded-xl text-white font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
          >
            <Printer size={18} /> Print & Download PDF
          </button>
        </div>
      </div>

      {/* Actual Report Card Document */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl p-12 border border-slate-200 print:shadow-none print:border-none print:p-8 print:w-full">
        {/* Header */}
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0">
              <GraduationCap size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">EduChain Academy</h1>
              <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mt-1">Institutional Academic Transcript</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Student Report</h2>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase">{schoolConfig.academicSession} SESSION</p>
            <p className="text-xs font-bold text-slate-500 uppercase">{schoolConfig.currentTerm} TERM</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-10 print:bg-slate-50">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</p>
            <p className="font-black text-slate-900 uppercase text-sm">{student.name}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Card</p>
            <p className="font-black text-slate-900 uppercase text-sm">{student.studentIdCard}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level</p>
            <p className="font-black text-slate-900 uppercase text-sm">{schoolConfig.classLabels[student.classId]}</p>
          </div>
        </div>

        {/* Performance Table */}
        <div className="mb-12">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase">Subject</th>
                <th className="px-4 py-3 text-center text-[10px] font-black uppercase">CA (30)</th>
                <th className="px-4 py-3 text-center text-[10px] font-black uppercase">Exam (70)</th>
                <th className="px-4 py-3 text-center text-[10px] font-black uppercase">Total</th>
                <th className="px-4 py-3 text-center text-[10px] font-black uppercase">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border-x border-b border-slate-100">
              {results.length > 0 ? results.map((res, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="px-4 py-4 font-bold text-slate-800 text-xs">{res.subject}</td>
                  <td className="px-4 py-4 text-center font-mono text-xs text-slate-600">{res.testScore}</td>
                  <td className="px-4 py-4 text-center font-mono text-xs text-slate-600">{res.examScore}</td>
                  <td className="px-4 py-4 text-center font-black text-indigo-600 text-xs">{res.total}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-black text-slate-900 text-xs">{res.grade}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 text-sm italic">Academic scores pending verification.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="grid grid-cols-2 gap-12 pt-8 border-t-2 border-slate-900">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-900 uppercase flex items-center gap-2">
              <UserCheck size={14} /> Attendance Records
            </h4>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-500 uppercase">Present</span>
                <span className="text-slate-900">{presentDays} Days</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-500 uppercase">School Days</span>
                <span className="text-slate-900">{totalDays} Days</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between">
                <span className="text-[10px] font-black text-slate-900 uppercase">Rate</span>
                <span className="text-[10px] font-black text-indigo-600">{attendancePercentage}%</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <div className="flex justify-between gap-8">
              <div className="flex-1 text-center">
                <div className="border-b-2 border-slate-900 h-10"></div>
                <p className="text-[8px] font-black text-slate-400 uppercase mt-2">Class Teacher</p>
              </div>
              <div className="flex-1 text-center">
                <div className="border-b-2 border-slate-900 h-10 flex items-center justify-center opacity-10">
                    <GraduationCap size={20} className="text-slate-900" />
                </div>
                <p className="text-[8px] font-black text-slate-400 uppercase mt-2">Seal / Registrar</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center pt-8 border-t border-dashed border-slate-200">
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
            Generated via EduChain Secure Enterprise Core | Audit ID: {Math.random().toString(36).substr(2, 12).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
