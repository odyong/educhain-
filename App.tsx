
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { UserRole, UserProfile, SchoolConfig, ExamResult, AttendanceStatus, Reminder, Student, Lesson, Quiz, ChatMessage } from './types';
import { MOCK_STUDENTS as INITIAL_STUDENTS } from './constants';
import Dashboard from './components/Dashboard';
import StudentProfile from './components/StudentProfile';
import MessagingHub from './components/MessagingHub';
import AttendanceTracker from './components/AttendanceTracker';
import ReportCard from './components/ReportCard';
import UserManagement from './components/UserManagement';
import LessonLibrary from './components/LessonLibrary';
import QuizHub from './components/QuizHub';
import { Layout, Users, GraduationCap, MessageSquare, CheckSquare, ShieldCheck, BookOpen, UserCog, Sparkles, Zap, Smartphone, Globe, ArrowRight, BrainCircuit, Rocket, Target, Heart, Shield } from 'lucide-react';

const DEFAULT_CONFIG: SchoolConfig = {
  academicSession: '2024/2025',
  currentTerm: '1st',
  classLabels: {
    'KG': 'Kindergarten', 'P1': 'Primary 1', 'P2': 'Primary 2', 'P3': 'Primary 3', 
    'P4': 'Primary 4', 'P5': 'Primary 5', 'P6': 'Primary 6', 'JSS1': 'JSS 1', 
    'JSS2': 'JSS 2', 'JSS3': 'JSS 3', 'SS1': 'SS 1', 'SS2': 'SS 2', 'SS3': 'SS 3'
  }
};

const INITIAL_USERS: UserProfile[] = [
  { uid: 'super_001', name: 'Dr. Sarah James', email: 'proprietor@edu.com', role: UserRole.SUPER_ADMIN, schoolId: 's1' },
  { uid: 'teacher_001', name: 'Mrs. Deborah Smith', email: 'deborah@edu.com', role: UserRole.TEACHER, schoolId: 's1', assignedClassId: 'P4' },
  { uid: 'p1', name: 'Mrs. Cynthia Harrison', email: 'cynthia@gmail.com', role: UserRole.PARENT, schoolId: 's1', assignedClassId: 'P4' },
  { uid: 's1_login', name: 'James Wilson', email: 'james@student.edu', role: UserRole.STUDENT, schoolId: 's1', studentRefId: '1', assignedClassId: 'P4' }
];

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', senderName: 'Mrs. Deborah Smith', senderId: 'teacher_001', text: 'Welcome to the P4 Classroom Room! Please check the Learning Hub for today\'s Math slides.', timestamp: '09:00 AM', type: 'classroom', classId: 'P4' },
  { id: '2', senderName: 'Mrs. Cynthia Harrison', senderId: 'p1', text: 'Thank you for the update, Mrs. Smith!', timestamp: '10:15 AM', type: 'parent_dm', recipientId: 'teacher_001' }
];

export const AuthContext = React.createContext<{
  user: UserProfile | null;
  allUsers: UserProfile[];
  students: Student[];
  lessons: Lesson[];
  quizzes: Quiz[];
  messages: ChatMessage[];
  scopedStudents: Student[];
  schoolConfig: SchoolConfig;
  attendanceHistory: Record<string, Record<string, AttendanceStatus>>;
  studentResults: Record<string, ExamResult[]>;
  reminders: Reminder[];
  activeLessonId: string | null;
  loading: boolean;
  login: (uid: string) => void;
  logout: () => void;
  addQuiz: (quiz: Quiz) => void;
  addLesson: (lesson: Lesson) => void;
  addReminder: (reminder: Reminder) => void;
  addMessage: (message: ChatMessage) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  toggleLessonLive: (lessonId: string | null) => void;
  addUser: (newUser: UserProfile) => void;
}>({
  user: null,
  allUsers: [],
  students: [],
  lessons: [],
  quizzes: [],
  messages: [],
  scopedStudents: [],
  schoolConfig: DEFAULT_CONFIG,
  attendanceHistory: {},
  studentResults: {},
  reminders: [],
  activeLessonId: null,
  loading: false,
  login: () => {},
  logout: () => {},
  addQuiz: () => {},
  addLesson: () => {},
  addReminder: () => {},
  addMessage: () => {},
  updateStudent: () => {},
  toggleLessonLive: () => {},
  addUser: () => {},
});

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('educhain_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(DEFAULT_CONFIG);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('educhain_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('educhain_user');
    }
  }, [user]);

  const scopedStudents = useMemo(() => {
    if (!user) return [];
    if (user.role === UserRole.SUPER_ADMIN) return students;
    if (user.role === UserRole.TEACHER) return students.filter(s => s.classId === user.assignedClassId);
    if (user.role === UserRole.PARENT) return students.filter(s => s.parentId === user.uid || (s.classId === user.assignedClassId && s.id === user.studentRefId));
    if (user.role === UserRole.STUDENT) return students.filter(s => s.id === user.studentRefId);
    return [];
  }, [user, students]);

  const login = (uid: string) => {
    const targetUser = allUsers.find(u => u.uid === uid);
    if (targetUser) setUser(targetUser);
  };

  const logout = () => setUser(null);
  const addQuiz = (quiz: Quiz) => setQuizzes(prev => [quiz, ...prev]);
  const addLesson = (lesson: Lesson) => setLessons(prev => [lesson, ...prev]);
  const addReminder = (reminder: Reminder) => setReminders(prev => [reminder, ...prev]);
  const addMessage = (message: ChatMessage) => setMessages(prev => [...prev, message]);
  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };
  const toggleLessonLive = (id: string | null) => {
    setActiveLessonId(id);
    setLessons(prev => prev.map(l => ({ ...l, isLive: l.id === id })));
  };
  const addUser = (newUser: UserProfile) => setAllUsers(prev => [...prev, newUser]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500 selection:text-white">
        {/* Sticky Nav */}
        <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="text-indigo-500" size={32} />
            <span className="font-black text-xl uppercase tracking-tighter">EduChain</span>
          </div>
          <a href="#login-portal" className="bg-indigo-600 px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/20">
            Open Portal
          </a>
        </nav>

        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-8 pt-20 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="mb-8 inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl">
              <Sparkles className="text-indigo-400" size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-200">The New Academic Standard</span>
            </div>
            <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none mb-8">
              Sovereign <br/> <span className="text-indigo-500">Education</span>
            </h1>
            <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-medium mb-12">
              A cryptographically secure, secondary-focused school engine designed for the next generation of scholars and leaders.
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <a href="#teachers" className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition duration-300">Exploration Phase</a>
              <a href="#login-portal" className="px-10 py-5 bg-slate-900 border border-slate-800 text-white rounded-2xl font-black uppercase tracking-widest hover:border-indigo-500 transition duration-300">Institutional Access</a>
            </div>
          </div>

          <div className="mt-20 w-full max-w-6xl rounded-[3rem] overflow-hidden border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-1000 delay-300">
            <img 
              src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1600&auto=format&fit=crop" 
              alt="Classroom" 
              className="w-full h-[500px] object-cover opacity-60 hover:opacity-100 transition duration-700"
            />
          </div>
        </section>

        {/* Feature: Teachers */}
        <section id="teachers" className="min-h-screen py-32 px-8 flex items-center justify-center bg-slate-900/30">
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
                <BrainCircuit size={32} />
              </div>
              <h2 className="text-5xl font-black uppercase tracking-tighter">Command the <span className="text-indigo-500">Classroom</span></h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Projector Mode allows teachers to lead with immersive visual curriculum. From automated attendance to real-time curriculum broadcasting, teachers regain 40% of their instructional time.
              </p>
              <ul className="space-y-4">
                {['Interactive Slide Broadcast', 'Instant Assessment Hub', 'Automated Grading Protocol'].map(item => (
                  <li key={item} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-indigo-400">
                    <CheckSquare size={20} className="text-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[3rem] overflow-hidden border border-slate-800 shadow-2xl order-1 lg:order-2">
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb280714553?q=80&w=1000&auto=format&fit=crop" 
                alt="Teacher leading" 
                className="w-full h-[600px] object-cover"
              />
            </div>
          </div>
        </section>

        {/* Feature: Students */}
        <section className="min-h-screen py-32 px-8 flex items-center justify-center">
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="rounded-[3rem] overflow-hidden border border-slate-800 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop" 
                alt="Students working" 
                className="w-full h-[600px] object-cover"
              />
            </div>
            <div className="space-y-8">
              <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-600/30">
                <Rocket size={32} />
              </div>
              <h2 className="text-5xl font-black uppercase tracking-tighter">Ascend the <span className="text-emerald-500">Leaderboard</span></h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Experience a gamified academic dashboard where results aren't just numbers—they're XP. Track your growth, compete in secure class quizzes, and build an immutable academic legacy.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
                  <p className="text-2xl font-black text-white">98%</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Student Satisfaction</p>
                </div>
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
                  <p className="text-2xl font-black text-white">Zero</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Data Redundancy</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature: Parents */}
        <section className="min-h-screen py-32 px-8 flex items-center justify-center bg-indigo-600/5">
          <div className="max-w-4xl text-center space-y-12">
            <div className="w-20 h-20 bg-rose-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-rose-600/30">
              <Heart size={40} />
            </div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">Total <span className="text-rose-500">Transparency</span></h2>
            <p className="text-slate-400 text-xl font-medium leading-relaxed">
              Parents aren't left in the dark. With a dedicated "Guardian Link," monitor every grade, every lesson, and communicate directly with faculty through our encrypted messaging hub.
            </p>
            <div className="rounded-[3rem] overflow-hidden border border-slate-800 shadow-3xl">
              <img 
                src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=1200&auto=format&fit=crop" 
                alt="Parent and Child" 
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </section>

        {/* Login Portal Section */}
        <section id="login-portal" className="min-h-screen py-32 px-8 flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-indigo-600/5 blur-[200px] pointer-events-none"></div>
          <div className="relative z-10 w-full max-w-5xl">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-5xl font-black uppercase tracking-tighter">Initialize <span className="text-indigo-500">Portal</span></h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Select your institutional role to begin synchronization</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {allUsers.map((u, idx) => (
                <button 
                  key={u.uid} 
                  onClick={() => login(u.uid)} 
                  className="group bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] text-white text-left hover:bg-white hover:text-slate-900 transition-all duration-500 flex flex-col justify-between h-56 shadow-2xl"
                >
                  <div className={`p-4 rounded-2xl w-fit ${u.role === UserRole.SUPER_ADMIN ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'} group-hover:bg-slate-950 transition`}>
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="font-black text-2xl uppercase tracking-tighter mb-1">{u.name.split(' ')[0]}</p>
                    <p className="text-[9px] uppercase font-black tracking-[0.3em] opacity-50 group-hover:opacity-100">{u.role.replace('_', ' ')}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-8 border-t border-slate-900 text-center text-slate-600">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">EduChain Enterprise Architecture • v2.5 • All Rights Reserved</p>
        </footer>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, allUsers, students, lessons, quizzes, messages, scopedStudents, schoolConfig, attendanceHistory: {}, studentResults: {}, reminders, activeLessonId, loading,
      login, logout, addQuiz, addLesson, addReminder, addMessage, updateStudent, toggleLessonLive, addUser
    }}>
      <div className="flex min-h-screen bg-slate-50 font-sans">
        <aside className="w-64 bg-slate-900 text-white flex flex-col sticky top-0 h-screen print:hidden overflow-y-auto">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-500" />
            <span className="font-black text-xl tracking-tighter uppercase">EduChain</span>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition text-slate-400 hover:text-white font-bold text-sm">
              <Zap size={18} /> Dashboard
            </Link>
            <Link to="/messages" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition text-slate-400 hover:text-white font-bold text-sm">
              <MessageSquare size={18} /> Classroom Chat
            </Link>
            <Link to="/lessons" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition text-slate-400 hover:text-white font-bold text-sm">
              <BookOpen size={18} /> Learning Hub
            </Link>
            <Link to="/quizzes" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition text-slate-400 hover:text-white font-bold text-sm">
              <BrainCircuit size={18} /> Assessment Hub
            </Link>
            {user.role !== UserRole.STUDENT && user.role !== UserRole.PARENT && (
              <Link to="/students" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition text-slate-400 hover:text-white font-bold text-sm">
                <Users size={18} /> Students
              </Link>
            )}
            {(user.role === UserRole.STUDENT || user.role === UserRole.PARENT) && (
              <Link to={`/students/${user.role === UserRole.STUDENT ? user.studentRefId : scopedStudents[0]?.id}`} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition text-slate-400 hover:text-white font-bold text-sm">
                <UserCog size={18} /> My Academic Record
              </Link>
            )}
          </nav>
          <div className="p-4 border-t border-slate-800">
            <button onClick={logout} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition font-bold text-sm">
                Sign Out
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lessons" element={<LessonLibrary />} />
            <Route path="/quizzes" element={<QuizHub />} />
            <Route path="/messages" element={<MessagingHub />} />
            <Route path="/students" element={<StudentProfile />} />
            <Route path="/students/:id" element={<StudentProfile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  );
};

export default App;
