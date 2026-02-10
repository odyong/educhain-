
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../App';
import { UserRole, Quiz, QuizQuestion } from '../types';
import { BrainCircuit, Plus, Trash2, CheckCircle2, XCircle, Trophy, Clock, Sparkles, ChevronRight, LayoutList, Zap, ShieldAlert, Target, Rocket, RefreshCcw } from 'lucide-react';

const QuizHub: React.FC = () => {
  const { user, quizzes, addQuiz, schoolConfig } = useContext(AuthContext);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizSession, setQuizSession] = useState<{
    currentIndex: number;
    answers: number[];
    isComplete: boolean;
  } | null>(null);
  
  // Creator State
  const [quizTitle, setQuizTitle] = useState('');
  const [quizSubject, setQuizSubject] = useState('Mathematics');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState('');
  const [currentOptions, setCurrentOptions] = useState(['', '', '', '']);
  const [correctIdx, setCorrectIdx] = useState(0);

  const isTeacher = user?.role === UserRole.TEACHER || user?.role === UserRole.SUPER_ADMIN;
  const classLabel = schoolConfig.classLabels[user?.assignedClassId || 'P4'];

  const filteredQuizzes = quizzes.filter(q => 
    user?.role === UserRole.STUDENT || user?.role === UserRole.PARENT 
      ? q.classId === (user.assignedClassId || 'P4')
      : true
  );

  const handleAddQuestion = () => {
    if (!currentQ || currentOptions.some(o => !o)) return;
    const newQ: QuizQuestion = {
      id: Date.now().toString(),
      question: currentQ,
      options: [...currentOptions],
      correctIndex: correctIdx
    };
    setQuestions([...questions, newQ]);
    setCurrentQ('');
    setCurrentOptions(['', '', '', '']);
    setCorrectIdx(0);
  };

  const handlePublishQuiz = () => {
    if (!quizTitle || questions.length === 0) return;
    const quiz: Quiz = {
      id: `q_${Date.now()}`,
      title: quizTitle,
      subject: quizSubject,
      classId: user?.assignedClassId || 'P4',
      teacherName: user?.name || 'Staff',
      questions,
      createdAt: new Date().toLocaleDateString(),
      status: 'active'
    };
    addQuiz(quiz);
    setIsCreatorOpen(false);
    setQuizTitle('');
    setQuestions([]);
  };

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setQuizSession({
      currentIndex: 0,
      answers: [],
      isComplete: false
    });
  };

  const submitAnswer = (optionIdx: number) => {
    if (!quizSession || !activeQuiz) return;
    
    const newAnswers = [...quizSession.answers, optionIdx];
    const isLast = quizSession.currentIndex === activeQuiz.questions.length - 1;
    
    if (isLast) {
      setQuizSession({
        ...quizSession,
        answers: newAnswers,
        isComplete: true
      });
    } else {
      setQuizSession({
        ...quizSession,
        currentIndex: quizSession.currentIndex + 1,
        answers: newAnswers
      });
    }
  };

  const calculateScore = () => {
    if (!quizSession || !activeQuiz) return 0;
    let correct = 0;
    quizSession.answers.forEach((ans, idx) => {
      if (ans === activeQuiz.questions[idx].correctIndex) correct++;
    });
    return Math.round((correct / activeQuiz.questions.length) * 100);
  };

  return (
    <div className="p-8 min-h-screen bg-slate-950 text-slate-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <BrainCircuit className="text-indigo-500" />
            Assessment <span className="text-indigo-500">Node</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1 uppercase text-xs tracking-[0.2em]">
            {isTeacher ? `Drafting examinations for ${classLabel}.` : `Synchronized evaluations for your level.`}
          </p>
        </div>
        
        {isTeacher && (
          <button 
            onClick={() => setIsCreatorOpen(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <Plus size={18} /> Deploy Quiz
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredQuizzes.length > 0 ? filteredQuizzes.map((quiz, idx) => (
          <div key={quiz.id} className="group relative bg-slate-900 rounded-[2.5rem] border border-slate-800 p-8 shadow-sm hover:shadow-2xl hover:border-indigo-500/50 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition">
                <BrainCircuit size={24} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Active</span>
            </div>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{quiz.subject}</p>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-indigo-400 transition">{quiz.title}</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6">{quiz.questions.length} Objective Units</p>
            
            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase">HOD: {quiz.teacherName}</span>
              <button 
                onClick={() => startQuiz(quiz)}
                className="flex items-center gap-2 bg-white text-slate-900 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition"
              >
                {isTeacher ? 'Manage' : 'Initialize'} <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-32 text-center bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-800">
             <Trophy className="w-16 h-16 text-slate-800 mx-auto mb-6" />
             <p className="text-sm font-black text-slate-500 uppercase tracking-widest">No active assessments in the class buffer.</p>
          </div>
        )}
      </div>

      {/* Architect (Creator) Modal */}
      {isCreatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-slate-800">
            <div className="p-8 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800">
              <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <Sparkles className="text-indigo-400" /> Assessment <span className="text-indigo-400">Architect</span>
              </h2>
              <button onClick={() => setIsCreatorOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition text-slate-400"><XCircle /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Quiz Specification</label>
                  <input type="text" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="e.g. Mid-Term Geometry Exam" className="w-full bg-slate-950 border-slate-800 rounded-2xl px-6 py-4 font-bold text-white focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 space-y-6">
                  <h4 className="font-black uppercase tracking-tighter text-indigo-400 flex items-center gap-2"><Plus size={16} /> Add Objective</h4>
                  <textarea value={currentQ} onChange={e => setCurrentQ(e.target.value)} placeholder="Question prompt..." className="w-full bg-slate-900 border-slate-800 rounded-2xl px-5 py-4 text-sm font-medium text-white focus:ring-2 focus:ring-indigo-500/20" rows={2} />
                  <div className="grid grid-cols-1 gap-4">
                    {currentOptions.map((opt, i) => (
                      <div key={i} className="flex gap-3">
                        <button onClick={() => setCorrectIdx(i)} className={`w-12 h-12 rounded-xl shrink-0 border-2 transition-all flex items-center justify-center ${correctIdx === i ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'border-slate-800 bg-slate-900 text-slate-600'}`}>
                          {correctIdx === i ? <CheckCircle2 size={24} /> : (i + 1)}
                        </button>
                        <input type="text" value={opt} onChange={e => {
                          const n = [...currentOptions];
                          n[i] = e.target.value;
                          setCurrentOptions(n);
                        }} placeholder={`Candidate Option ${i+1}`} className="flex-1 bg-slate-900 border-slate-800 rounded-xl px-5 py-3 text-xs font-bold text-white focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                    ))}
                  </div>
                  <button onClick={handleAddQuestion} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition shadow-xl shadow-indigo-500/20">Commit to Batch</button>
                </div>
              </div>

              <div className="space-y-6">
                 <h4 className="font-black uppercase tracking-widest text-[10px] text-slate-500">Sequence Summary ({questions.length} Units)</h4>
                 <div className="space-y-4">
                   {questions.map((q, i) => (
                     <div key={q.id} className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex justify-between items-start group hover:border-indigo-500/30 transition">
                       <div>
                         <p className="text-xs font-black text-white">{i+1}. {q.question}</p>
                         <p className="text-[10px] font-bold text-emerald-400 mt-2 uppercase flex items-center gap-1">
                           <Target size={12} /> Valid: {q.options[q.correctIndex]}
                         </p>
                       </div>
                       <button onClick={() => setQuestions(questions.filter(qu => qu.id !== q.id))} className="text-rose-500 opacity-0 group-hover:opacity-100 transition p-2 bg-slate-900 rounded-lg"><Trash2 size={16}/></button>
                     </div>
                   ))}
                   {questions.length === 0 && <div className="py-20 text-center text-slate-700 italic text-xs uppercase font-black tracking-widest border-2 border-dashed border-slate-800 rounded-[2rem]">Empty Sequence.</div>}
                 </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-800 flex justify-end gap-4 bg-slate-950/50">
              <button onClick={() => setIsCreatorOpen(false)} className="px-8 py-4 bg-slate-900 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-800 hover:text-white transition">Abort Draft</button>
              <button onClick={handlePublishQuiz} className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition">Deploy To Live Cluster</button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Session (Student View) */}
      {activeQuiz && quizSession && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in fade-in duration-500">
          {!quizSession.isComplete ? (
            <div className="flex-1 flex flex-col">
              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-900">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-500 shadow-2xl shadow-indigo-500/50"
                  style={{ width: `${((quizSession.currentIndex + 1) / activeQuiz.questions.length) * 100}%` }}
                ></div>
              </div>

              <div className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-4xl w-full space-y-12 animate-in zoom-in-95 duration-500">
                  <div className="text-center space-y-4">
                    <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em]">Question {quizSession.currentIndex + 1} of {activeQuiz.questions.length}</p>
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-tight">
                      {activeQuiz.questions[quizSession.currentIndex].question}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeQuiz.questions[quizSession.currentIndex].options.map((option, i) => (
                      <button 
                        key={i}
                        onClick={() => submitAnswer(i)}
                        className="p-8 bg-slate-900 border border-slate-800 rounded-[2rem] text-left group hover:bg-indigo-600 hover:border-indigo-600 transition-all duration-300 shadow-xl"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-slate-500 group-hover:bg-white/20 group-hover:text-white group-hover:border-transparent transition">
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span className="text-lg font-black text-white uppercase tracking-tight">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-slate-900 flex justify-between items-center bg-slate-950/50 backdrop-blur-xl">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 rounded-xl text-indigo-400"><ShieldAlert size={20} /></div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Integrity Protocol: Tracking User Focus</p>
                 </div>
                 <button onClick={() => setActiveQuiz(null)} className="px-8 py-3 bg-rose-600/10 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest border border-rose-500/20 hover:bg-rose-600 hover:text-white transition">Abandon Assessment</button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 animate-in zoom-in-95">
              <div className="relative">
                <div className="w-32 h-32 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/50">
                  <Trophy size={64} className="text-white" />
                </div>
                <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 scale-150"></div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.5em]">Assessment Finalized</p>
                <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-none">Your Terminal Score</h2>
                <div className="text-9xl font-black text-indigo-500 tracking-tighter mt-8">{calculateScore()}%</div>
              </div>

              <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
                 <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem]">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Valid Units</p>
                    <p className="text-3xl font-black text-white">{quizSession.answers.filter((ans, idx) => ans === activeQuiz.questions[idx].correctIndex).length}</p>
                 </div>
                 <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem]">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Completion</p>
                    <p className="text-3xl font-black text-white">100%</p>
                 </div>
              </div>

              <div className="flex gap-4 pt-12">
                 <button 
                  onClick={() => startQuiz(activeQuiz)} 
                  className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest border border-slate-800 hover:bg-indigo-600 hover:border-indigo-600 transition"
                 >
                   <RefreshCcw size={20} className="inline mr-2" /> Re-Attempt
                 </button>
                 <button 
                  onClick={() => setActiveQuiz(null)} 
                  className="px-16 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/40 hover:bg-indigo-700 transition"
                 >
                   Return to Node
                 </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizHub;
