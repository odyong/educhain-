
import React, { useContext, useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { UserRole, StudentStatus, UserProfile, Student } from '../types';
import { MOCK_PARENTS } from '../constants';
import { GraduationCap, FileText, FileDown, Printer, Search, ArrowLeft, MoreHorizontal, UserCheck, ShieldAlert, Heart, MessageCircle, Mail, Phone, ExternalLink, UserPlus, CheckCircle, ShieldCheck, Plus, LayoutGrid, List, User as UserIcon, X, Users, ChevronRight, Camera, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const StudentProfile: React.FC = () => {
  const { id } = useParams();
  const { user, schoolConfig, studentResults, scopedStudents, updateStudent } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'details' | 'results' | 'guardian' | 'history'>('details');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchId, setSearchId] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isGeneratingPhoto, setIsGeneratingPhoto] = useState(false);
  const navigate = useNavigate();

  // CRITICAL SECURITY GUARD
  useEffect(() => {
    if (!user || !id) return;
    
    // Students and Parents can ONLY see their linked records.
    // If they attempt to access another ID via URL, we bounce them back to their own ID.
    if (user.role === UserRole.STUDENT && user.studentRefId !== id) {
      navigate(`/students/${user.studentRefId}`, { replace: true });
    }
    
    if (user.role === UserRole.PARENT) {
      const parentStudents = scopedStudents.map(s => s.id);
      if (!parentStudents.includes(id)) {
        navigate(`/students/${parentStudents[0]}`, { replace: true });
      }
    }
  }, [user, id, navigate, scopedStudents]);

  const filteredStudents = useMemo(() => {
    return scopedStudents.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.studentIdCard.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [scopedStudents, searchQuery]);

  const student = useMemo(() => {
    if (id) {
      return scopedStudents.find(s => s.id === id);
    }
    return null;
  }, [id, scopedStudents]);

  const handleGenerateAIPhoto = async () => {
    if (!student) return;
    setIsGeneratingPhoto(true);
    try {
      // Use process.env.API_KEY directly as required by guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `A professional, realistic school portrait of a student named ${student.name}, high quality, clean white background, school uniform, front facing, studio lighting.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        }
      });

      // Find the image part in the response as per nano-banana image generation guidelines
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64Data = part.inlineData.data;
            const photoURL = `data:image/png;base64,${base64Data}`;
            updateStudent(student.id, { photoURL });
            break;
          }
        }
      }
    } catch (error) {
      console.error("Failed to generate AI photo:", error);
    } finally {
      setIsGeneratingPhoto(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && student) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateStudent(student.id, { photoURL: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusBadge = (status: StudentStatus) => {
    const styles = {
      [StudentStatus.ACTIVE]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      [StudentStatus.GRADUATED]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      [StudentStatus.EXPELLED]: 'bg-rose-100 text-rose-700 border-rose-200',
      [StudentStatus.TRANSFERRED]: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
      <span className={`px-4 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${styles[status]}`}>
        {status}
      </span>
    );
  };

  // Directory View (Teachers/Admins only)
  if (!id) {
    if (user?.role === UserRole.STUDENT || user?.role === UserRole.PARENT) {
      const targetId = user.role === UserRole.STUDENT ? user.studentRefId : scopedStudents[0]?.id;
      // Fixed: Navigate must be imported from react-router-dom
      return <Navigate to={`/students/${targetId}`} replace />;
    }

    return (
      <div className="p-8 max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
              <Users className="text-indigo-600" />
              {user?.role === UserRole.TEACHER ? 'Class Roster' : 'Student Directory'}
            </h1>
            <p className="text-slate-500 mt-1 font-medium italic">
              {user?.role === UserRole.TEACHER 
                ? `Managing Class ${schoolConfig.classLabels[user.assignedClassId || '']} Administratively.` 
                : 'Central registry for all active student credentials and records.'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <LayoutGrid size={18} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <List size={18} />
              </button>
            </div>
          </div>
        </header>

        <div className="mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or institutional ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-slate-200 rounded-2xl pl-12 pr-4 py-4 font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map(s => (
              <Link key={s.id} to={`/students/${s.id}`} className="group bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-2xl group-hover:bg-indigo-600 group-hover:text-white transition overflow-hidden">
                    {s.photoURL ? (
                      <img src={s.photoURL} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      s.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tight">{s.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{s.studentIdCard}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Level</span>
                    <span className="text-indigo-600">{schoolConfig.classLabels[s.classId]}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Status</span>
                    <span className="text-emerald-600">Active</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-50 flex justify-end">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] group-hover:translate-x-1 transition flex items-center gap-2">
                    Profile <ChevronRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                  <th className="px-8 py-5">Full Name</th>
                  <th className="px-8 py-5">Institutional ID</th>
                  <th className="px-8 py-5">Level</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map(s => (
                  <tr key={s.id} onClick={() => navigate(`/students/${s.id}`)} className="group cursor-pointer hover:bg-slate-50 transition">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold group-hover:bg-indigo-600 group-hover:text-white transition overflow-hidden">
                          {s.photoURL ? (
                            <img src={s.photoURL} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            s.name.charAt(0)
                          )}
                        </div>
                        <span className="text-sm font-black text-slate-800 uppercase">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-mono text-xs text-slate-500 uppercase tracking-tight">{s.studentIdCard}</td>
                    <td className="px-8 py-5 text-xs font-bold text-indigo-600 uppercase">{schoolConfig.classLabels[s.classId]}</td>
                    <td className="px-8 py-5">{getStatusBadge(s.status)}</td>
                    <td className="px-8 py-5 text-right">
                      <ChevronRight size={18} className="inline text-slate-200 group-hover:text-indigo-600 transition" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // Profile View
  if (!student) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-4 uppercase tracking-tighter">Access Restricted or Record Null</h2>
        <Link to="/" className="flex items-center justify-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline transition">
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    );
  }

  const results = studentResults[student.id] || [];
  const guardian = MOCK_PARENTS.find(p => p.id === student.parentId);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition">
          <ArrowLeft size={16} /> Dashboard
        </Link>
        {user?.role === UserRole.TEACHER && (
          <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition">
            <input 
              type="text" 
              placeholder="Jump to ID..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="bg-transparent border-none text-xs font-bold focus:ring-0 px-4 py-2 w-48"
            />
            <button 
              onClick={() => navigate(`/students/${searchId}`)}
              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
            >
              <Search size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden mb-10">
        <div className="h-48 bg-slate-900 relative">
          <div className="absolute inset-0 bg-indigo-600/20"></div>
          <div className="absolute -bottom-12 left-12 group">
            <div className="w-32 h-32 rounded-[2rem] bg-white p-1.5 border border-slate-200 shadow-2xl flex items-center justify-center font-black text-5xl text-indigo-600 uppercase tracking-tighter relative overflow-hidden">
              {student.photoURL ? (
                <img src={student.photoURL} alt={student.name} className="w-full h-full object-cover rounded-[1.8rem]" />
              ) : (
                student.name.charAt(0)
              )}
              
              {user?.role === UserRole.TEACHER && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <label className="p-2 bg-white text-slate-900 rounded-full cursor-pointer hover:bg-indigo-600 hover:text-white transition">
                    <Camera size={18} />
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  </label>
                  <button 
                    onClick={handleGenerateAIPhoto}
                    disabled={isGeneratingPhoto}
                    className="p-2 bg-white text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition disabled:opacity-50"
                    title="Generate AI Portrait"
                  >
                    {isGeneratingPhoto ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="pt-20 pb-10 px-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">{student.name}</h1>
              {getStatusBadge(student.status)}
            </div>
            <div className="flex items-center gap-4 text-slate-500 font-bold text-sm">
              <div className="flex items-center gap-2 uppercase tracking-tight">
                <GraduationCap size={18} className="text-indigo-600" />
                {schoolConfig.classLabels[student.classId]}
              </div>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <div className="uppercase tracking-widest font-mono text-xs">{student.studentIdCard}</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => navigate(`/students/${student.id}/report`)}
              className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition shadow-xl shadow-slate-200 text-xs font-black uppercase tracking-widest"
            >
              <Printer size={18} /> View Transcript
            </button>
          </div>
        </div>

        <div className="px-12 border-t border-slate-100 flex gap-10">
          {[
            { id: 'details', label: 'Identity' },
            { id: 'results', label: 'Academic Performance' },
            { id: 'guardian', label: 'Guardian' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === tab.id ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {activeTab === 'details' && (
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <UserCheck size={24} className="text-indigo-600" /> Academic Bio-Data
              </h3>
              <div className="grid grid-cols-2 gap-10">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Legal Full Name</p>
                  <p className="font-bold text-slate-800">{student.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Institutional ID</p>
                  <p className="font-mono text-slate-800 font-bold">{student.studentIdCard}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Date of Birth</p>
                  <p className="font-bold text-slate-800">{student.dob}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Initial Enrollment</p>
                  <p className="font-bold text-slate-800">{student.enrollmentDate}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black uppercase tracking-tight">Grade Ledger</h3>
              </div>
              <div className="space-y-4">
                {results.length > 0 ? results.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div>
                      <span className="font-black text-slate-800 uppercase tracking-tight">{r.subject}</span>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</p>
                        <p className="font-black text-indigo-600">{r.total}%</p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
                        {r.grade}
                      </div>
                    </div>
                  </div>
                )) : (
                    <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400 italic text-sm font-medium">
                      Scores are under faculty verification for the current cycle.
                    </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'guardian' && (
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 mb-10">
                <Heart size={24} className="text-rose-500" /> Linked Guardian
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {guardian ? (
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black text-3xl mb-4">
                      {guardian.name.charAt(0)}
                    </div>
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{guardian.name}</h4>
                    <div className="mt-8 w-full space-y-3">
                      <div className="flex items-center justify-center gap-3 p-3 bg-white rounded-xl text-xs font-bold text-slate-600">
                        <Mail size={16} className="text-indigo-400" /> {guardian.email}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                    <ShieldAlert size={48} className="text-slate-300 mb-4" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Protected Record</p>
                  </div>
                )}
                
                <div className="flex items-center">
                   <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Privacy Protocol</p>
                      <p className="text-xs text-indigo-800 font-medium leading-relaxed italic">
                        "Your institutional record is cryptographically linked to your Guardian's verified email. Only authorized faculty and linked guardians can access this data."
                      </p>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-10">
          <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Academic Status</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">Sync Status</span>
                  <span className="text-emerald-500">Live</span>
               </div>
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">Attendance</span>
                  <span className="text-indigo-400">98% Overall</span>
               </div>
            </div>
            <button 
              onClick={() => navigate(`/students/${student.id}/report`)}
              className="w-full mt-8 bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-700 transition"
            >
              Export Transcript
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
