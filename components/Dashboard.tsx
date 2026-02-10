
import React, { useContext } from 'react';
import { AuthContext } from '../App';
import { 
  Users, GraduationCap, Calendar, MessageSquare, ArrowRight, BookOpen, 
  Clock, ShieldCheck, Zap, Star, Trophy, ClipboardCheck, Layout, 
  Target, Rocket, Sparkles, BrainCircuit, Radio 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole, ReminderType } from '../types';

const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
  <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-2xl flex items-start justify-between group hover:border-indigo-500/50 transition-all duration-500">
    <div>
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
      <h3 className="text-3xl font-black text-white mt-1 group-hover:text-indigo-400 transition">{value}</h3>
      <p className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${color === 'rose' ? 'text-rose-500' : color === 'emerald' ? 'text-emerald-500' : 'text-indigo-500'}`}>
        {sub}
      </p>
    </div>
    <div className={`p-4 rounded-2xl ${color === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' : color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
      <Icon size={24} />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user, reminders, scopedStudents, schoolConfig, studentResults, lessons, quizzes, activeLessonId } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const isTeacher = user?.role === UserRole.TEACHER || user?.role === UserRole.SUPER_ADMIN;
  const isParent = user?.role === UserRole.PARENT;
  const isStudent = user?.role === UserRole.STUDENT;

  const myReminders = reminders.filter(r => {
    if (isParent) return r.parentId === user?.uid;
    if (isStudent) return r.studentId === user?.studentRefId;
    return r.teacherId === user?.uid;
  }).slice(0, 3);

  const targetId = isStudent ? user?.studentRefId : isParent ? scopedStudents[0]?.id : null;
  const activeLesson = activeLessonId ? lessons.find(l => l.id === activeLessonId) : null;

  return (
    <div className="p-8 min-h-screen bg-slate-950 text-slate-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[9px] font-black rounded-full border border-indigo-500/20 uppercase tracking-widest">
              {schoolConfig.academicSession} Session
            </span>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[9px] font-black rounded-full border border-emerald-500/20 uppercase tracking-widest">
              {schoolConfig.currentTerm} Term
            </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
            {user?.name.split(' ')[0]}'s <span className="text-indigo-500">Command</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Status</p>
            <p className="text-xs font-bold text-emerald-500 uppercase">Authenticated Node</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-500 shadow-xl">
            <ShieldCheck size={24} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {activeLesson ? (
          <div className="lg:col-span-2 relative group overflow-hidden bg-gradient-to-br from-rose-600 to-rose-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-rose-500/20 animate-in slide-in-from-top-4 duration-500">
             <div className="absolute top-0 right-0 p-12 opacity-10 animate-pulse">
                <Radio size={200} />
             </div>
             <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/20 mb-6">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                      <span className="text-[9px] font-black uppercase tracking-widest">Faculty Sync Active</span>
                   </div>
                   <h2 className="text-4xl font-black uppercase tracking-tight leading-tight mb-4">
                     Live Instruction: <br/> {activeLesson.title}
                   </h2>
                   <p className="text-rose-100/70 text-sm font-medium max-w-md leading-relaxed">
                     Instruction by {activeLesson.teacherName}. Open the synchronized module to follow along in real-time.
                   </p>
                </div>
                <div className="flex gap-4 mt-10">
                   <Link to="/lessons" className="bg-white text-rose-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 transition shadow-xl">
                      Enter Live Node
                   </Link>
                </div>
             </div>
          </div>
        ) : (
          <div className="lg:col-span-2 relative group overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-500/20">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition duration-1000">
              <Rocket size={200} />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 border border-white/20">
                  <Sparkles size={32} />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight leading-tight mb-4">
                  {isStudent ? "Ready for today's objectives?" : isTeacher ? "Manage your Classroom" : "Track academic growth"}
                </h2>
                <p className="text-indigo-100/70 text-sm font-medium max-w-md leading-relaxed">
                  {isStudent 
                    ? "Welcome back James. Your Node Class P4 is synced. Check the Learning Hub for new curriculum provisioned today."
                    : "Every grade, note, and attendance record is cryptographically secured for institutional excellence."}
                </p>
              </div>
              <div className="flex gap-4 mt-10">
                <Link to="/lessons" className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition shadow-xl">
                  Enter Learning Hub
                </Link>
                <Link to="/messages" className="bg-indigo-500/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition">
                  Open Classroom Chat
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 p-8 opacity-5 group-hover:rotate-12 transition duration-700">
            <Target size={120} />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-2">
            <Zap className="text-amber-400" /> Academic XP
          </h3>
          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                <span className="text-slate-500">Term Progress</span>
                <span className="text-white">65%</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div className="h-full bg-indigo-500 rounded-full w-[65%] shadow-lg shadow-indigo-500/50"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rank</p>
                <p className="text-lg font-black text-white">#12</p>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Average</p>
                <p className="text-lg font-black text-emerald-500">84%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Active Lessons" value={lessons.length} sub="Curriculum Updated" icon={BookOpen} color="indigo" />
        <StatCard title="Assessments" value={quizzes.length} sub="Pending Rounds" icon={BrainCircuit} color="emerald" />
        <StatCard title="Attendance" value="98%" sub="On Schedule" icon={ClipboardCheck} color="indigo" />
        <StatCard title="Status" value={activeLessonId ? "LIVE" : "SYNC"} sub={activeLessonId ? "Instruction Sync" : "Standby"} icon={activeLessonId ? Radio : ShieldCheck} color={activeLessonId ? "rose" : "indigo"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-8 flex items-center justify-between">
              Subject Modules
              <Link to="/lessons" className="text-[10px] text-indigo-400 hover:underline">Provision Center</Link>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Mathematics', 'Science', 'English', 'Physics', 'Chemistry', 'History', 'Geography', 'Art'].map((sub) => (
                <Link 
                  key={sub} 
                  to={`/lessons?subject=${sub}`}
                  className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center gap-3 text-center group hover:border-indigo-500/50 transition-all"
                >
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition">
                    <BookOpen size={20} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition">{sub}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-2">
              <Clock className="text-rose-500" /> Strategic Objectives
            </h3>
            <div className="space-y-4">
              {myReminders.length > 0 ? myReminders.map(rem => (
                <div key={rem.id} className="p-6 bg-slate-950 border border-slate-800 rounded-[2rem] flex items-center justify-between group hover:border-rose-500/30 transition">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20">
                      <ClipboardCheck size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-tight">{rem.title}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{rem.type} • {rem.teacherName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Due Cycle</p>
                    <p className="text-xs font-bold text-white uppercase">{rem.dueDate || 'ASAP'}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-slate-600 font-bold uppercase text-xs tracking-widest border-2 border-dashed border-slate-800 rounded-3xl">
                  No pending institutional tasks.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl">
             <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6">Classroom Node</h3>
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Sync: Active</span>
                </div>
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Notice</p>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                    "Ensure all PDF modules are provisioned on local buffers before the regional exams."
                  </p>
                  <p className="text-[9px] font-black text-slate-600 uppercase mt-3">— Dr. Sarah James</p>
                </div>
                <Link to="/messages" className="w-full py-4 bg-slate-800 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition">
                  Enter Secure Chat <ArrowRight size={14} />
                </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
