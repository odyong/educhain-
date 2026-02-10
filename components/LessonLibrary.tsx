
import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../App';
import { UserRole, Lesson } from '../types';
import { 
  BookOpen, Plus, FileText, Trash2, 
  Sparkles, X, LayoutGrid, List, 
  Monitor, Maximize2, Minimize2, ArrowLeft,
  ChevronRight, Search, Zap, Book, ShieldCheck,
  Radio, Play, UploadCloud, Loader2
} from 'lucide-react';

const LessonLibrary: React.FC = () => {
  const { user, lessons, addLesson, schoolConfig, toggleLessonLive, activeLessonId } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [focusLesson, setFocusLesson] = useState<Lesson | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  
  // Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [type, setType] = useState<'pdf' | 'word' | 'slides'>('pdf');
  const [desc, setDesc] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{name: string, data: string} | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isTeacher = user?.role === UserRole.TEACHER || user?.role === UserRole.SUPER_ADMIN;
  
  const subjects = ['All', 'Mathematics', 'Science', 'English', 'Physics', 'Chemistry', 'History', 'Geography', 'Art', 'Biology', 'Economics'];

  const filteredLessons = lessons.filter(l => {
    const matchesRole = user?.role === UserRole.STUDENT || user?.role === UserRole.PARENT 
      ? l.classId === user.assignedClassId 
      : true;
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || l.subject === selectedSubject;
    return matchesRole && matchesSearch && matchesSubject;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedFile({
          name: file.name,
          data: event.target?.result as string
        });
        setIsUploading(false);
        // Auto-detect type based on extension
        if (file.name.toLowerCase().endsWith('.pdf')) setType('pdf');
        else if (file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx')) setType('word');
        else if (file.name.toLowerCase().endsWith('.ppt') || file.name.toLowerCase().endsWith('.pptx')) setType('slides');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    const newLesson: Lesson = {
      id: `l_${Date.now()}`,
      title,
      subject,
      classId: user?.assignedClassId || 'P4',
      teacherName: user?.name || 'Staff',
      fileType: type,
      fileUrl: '#',
      fileName: uploadedFile?.name,
      fileData: uploadedFile?.data,
      description: desc,
      createdAt: new Date().toLocaleDateString()
    };
    addLesson(newLesson);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDesc('');
    setUploadedFile(null);
    setType('pdf');
  };

  // Focus/Projector View
  if (focusLesson) {
    const isThisLessonLive = activeLessonId === focusLesson.id;

    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center p-8 md:p-12 overflow-y-auto animate-in zoom-in-95 duration-300">
        <div className="max-w-6xl w-full">
          <header className="flex items-center justify-between mb-12 border-b border-slate-800 pb-8">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setFocusLesson(null)}
                className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition shadow-xl"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.4em] mb-1">
                  {focusLesson.subject} • {isThisLessonLive ? 'LIVE SESSION' : 'OFFLINE MODULE'}
                </p>
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">{focusLesson.title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isThisLessonLive && (
                <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse">
                  <Radio size={16} /> Sync Active
                </div>
              )}
              {isTeacher && (
                <button 
                  onClick={() => toggleLessonLive(isThisLessonLive ? null : focusLesson.id)}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2 ${
                    isThisLessonLive ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isThisLessonLive ? 'Stop Broadcast' : 'Start Broadcast'}
                </button>
              )}
              <button onClick={() => setFocusLesson(null)} className="w-14 h-14 bg-slate-900 text-slate-400 border border-slate-800 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition">
                <X size={24} />
              </button>
            </div>
          </header>

          <div className="bg-slate-900 rounded-[3rem] border border-slate-800 p-10 md:p-20 shadow-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
              <BookOpen size={300} />
            </div>
            
            <div className="relative z-10 space-y-12">
              <div className="prose prose-invert max-w-none">
                <p className="text-2xl md:text-3xl text-slate-300 leading-relaxed font-medium italic border-l-4 border-indigo-500 pl-8">
                  {focusLesson.description || "In this module, we explore the core principles of " + focusLesson.subject + ". Please pay close attention to the visual aids provided."}
                </p>
              </div>

              {/* Synchronized Content Rendering */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-12">
                <div className="bg-slate-950 p-10 rounded-[2.5rem] border border-slate-800 space-y-6">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <Zap className="text-amber-400" /> Lesson Objectives
                  </h3>
                  <ul className="space-y-4 text-slate-400 font-medium text-lg">
                    <li className="flex items-center gap-3"><ChevronRight className="text-indigo-500" /> Analyze core concepts in {focusLesson.subject}</li>
                    <li className="flex items-center gap-3"><ChevronRight className="text-indigo-500" /> Apply methodology to case studies</li>
                    <li className="flex items-center gap-3"><ChevronRight className="text-indigo-500" /> Critical Review of Chapter Materials</li>
                  </ul>
                </div>
                
                <div className="bg-indigo-600 p-10 rounded-[2.5rem] flex flex-col justify-between group relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10"><FileText size={120} /></div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Module Content</h3>
                    <p className="text-indigo-100 text-sm opacity-80 mb-8">
                      {focusLesson.fileName ? `Provisioned File: ${focusLesson.fileName}` : "Official module material is ready for synchronized review."}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      if (focusLesson.fileData) {
                        const win = window.open();
                        win?.document.write('<iframe src="' + focusLesson.fileData + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
                      }
                    }}
                    className="w-full py-5 bg-white text-indigo-900 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50 transition shadow-2xl flex items-center justify-center gap-3"
                  >
                    <FileText size={20} /> Open {focusLesson.fileType.toUpperCase()} Buffer
                  </button>
                </div>
              </div>

              <div className="pt-12 text-center">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
                  Institutional Record • ID: {focusLesson.id} • Faculty: {focusLesson.teacherName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-slate-950 text-slate-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
            <BookOpen className="text-indigo-500" /> Academic <span className="text-indigo-500">Vault</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-[0.2em]">Institutional Curriculum Repository</p>
        </div>
        
        <div className="flex items-center gap-3">
          {isTeacher && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <Plus size={18} /> Provision Lesson
            </button>
          )}
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex shadow-sm">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <LayoutGrid size={18} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
              <List size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Live Session Alert for Students */}
      {activeLessonId && (
        <div className="mb-10 bg-indigo-600 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-500 shadow-2xl shadow-indigo-600/30 animate-pulse">
           <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                <Radio size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.4em]">Faculty Sync Active</p>
                 <h2 className="text-xl font-black text-white uppercase tracking-tight">
                   {lessons.find(l => l.id === activeLessonId)?.title} — Live Now
                 </h2>
              </div>
           </div>
           <button 
            onClick={() => setFocusLesson(lessons.find(l => l.id === activeLessonId) || null)}
            className="px-10 py-4 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition"
           >
             Join Live Module
           </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar">
        {subjects.map(sub => (
          <button 
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 ${
              selectedSubject === sub 
                ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      <div className="mb-10 relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition" size={20} />
        <input 
          type="text" 
          placeholder="Query module by title, subject or teacher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border-slate-800 rounded-[2rem] pl-16 pr-6 py-5 font-bold text-white shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
        />
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredLessons.map((lesson, idx) => (
            <div key={lesson.id} className={`group relative bg-slate-900 rounded-[2.5rem] border p-8 shadow-sm hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 ${lesson.isLive ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-800'}`} style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl border transition ${lesson.isLive ? 'bg-indigo-600 text-white border-transparent' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white'}`}>
                  <FileText size={24} />
                </div>
                {lesson.isLive && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest">
                    <Radio size={12} className="animate-pulse" /> Live Now
                  </span>
                )}
              </div>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{lesson.subject}</p>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4 group-hover:text-indigo-400 transition">{lesson.title}</h3>
              
              <div className="space-y-3 mt-6 pt-6 border-t border-slate-800">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">Instructor</span>
                  <span className="text-slate-300">{lesson.teacherName}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-500">Node Class</span>
                  <span className="text-slate-300">{lesson.classId}</span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setFocusLesson(lesson)}
                  className="flex-1 py-4 bg-slate-950 border border-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:border-indigo-600 transition flex items-center justify-center gap-2"
                >
                  {lesson.isLive ? 'Join Stream' : 'Open Module'}
                </button>
              </div>
            </div>
          ))}
          
          {filteredLessons.length === 0 && (
            <div className="col-span-full py-32 text-center bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-800">
              <Book className="w-16 h-16 text-slate-800 mx-auto mb-6" />
              <p className="text-sm font-black text-slate-500 uppercase tracking-widest">No matching modules in the vault.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="border-b border-slate-800">
              <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                <th className="px-8 py-5">Lesson Identity</th>
                <th className="px-8 py-5">Subject</th>
                <th className="px-8 py-5">Node Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLessons.map(lesson => (
                <tr key={lesson.id} className={`group hover:bg-slate-800/50 transition ${lesson.isLive ? 'bg-indigo-500/5' : ''}`}>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-white uppercase tracking-tight">{lesson.title}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{lesson.createdAt}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-indigo-400 uppercase">{lesson.subject}</span>
                  </td>
                  <td className="px-8 py-6">
                    {lesson.isLive ? (
                      <span className="text-xs font-black text-rose-500 uppercase flex items-center gap-2">
                        <Radio size={14} /> Broadcasting
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 font-bold uppercase">Archived</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => setFocusLesson(lesson)} className="p-3 bg-slate-950 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition">
                      <Play size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Provision Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-800">
            <div className="p-8 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg"><UploadCloud size={20} /></div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Provision Curriculum</h2>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Node Upload Protocol</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition text-slate-400"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddLesson} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Module Title</label>
                  <input 
                    type="text" required value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border-slate-800 rounded-2xl px-5 py-4 font-bold text-white focus:ring-2 focus:ring-indigo-500/20 transition"
                    placeholder="e.g. Calculus I: Derivatives"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Subject</label>
                  <select 
                    value={subject} onChange={e => setSubject(e.target.value)}
                    className="w-full bg-slate-950 border-slate-800 rounded-2xl px-5 py-4 font-bold text-white focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {subjects.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Module Format</label>
                  <select 
                    value={type} onChange={e => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border-slate-800 rounded-2xl px-5 py-4 font-bold text-white focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="pdf">PDF Institutional Document</option>
                    <option value="word">Word Script</option>
                    <option value="slides">Visual Presentation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">File Resource (PDF / Word)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-800 rounded-[2rem] p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all bg-slate-950/50 group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                  />
                  {isUploading ? (
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                  ) : uploadedFile ? (
                    <div className="flex flex-col items-center">
                      <FileText className="w-10 h-10 text-emerald-500 mb-2" />
                      <p className="text-xs font-black text-white uppercase truncate max-w-xs">{uploadedFile.name}</p>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }} className="text-[10px] text-rose-500 font-black mt-2 uppercase tracking-widest hover:underline">Detach</button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-10 h-10 text-slate-700 group-hover:text-indigo-500 transition mb-3" />
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Select Node Data</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Lesson Abstract</label>
                <textarea 
                  value={desc} onChange={e => setDesc(e.target.value)}
                  className="w-full bg-slate-950 border-slate-800 rounded-2xl px-5 py-4 font-bold text-white focus:ring-2 focus:ring-indigo-500/20 h-24"
                  placeholder="Summary of learning objectives..."
                />
              </div>

              <button type="submit" disabled={isUploading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-500/20 hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                <Zap size={18} /> Provision Module
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonLibrary;
