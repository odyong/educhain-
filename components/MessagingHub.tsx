
import React, { useState, useContext, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../App';
import { UserRole, ChatMessage } from '../types';
import { MessageSquare, Send, Search, UserCircle, Globe, Bell, Sparkles, User, ShieldCheck, Hash } from 'lucide-react';

const MessagingHub: React.FC = () => {
  const { user, allUsers, schoolConfig, messages, addMessage } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const deepLinkParentId = searchParams.get('parentId');

  const isStaff = user?.role !== UserRole.STUDENT && user?.role !== UserRole.PARENT;
  const isStudent = user?.role === UserRole.STUDENT;
  const isParent = user?.role === UserRole.PARENT;

  const [activeTab, setActiveTab] = useState<'classroom' | 'parent_dm'>(isStudent ? 'classroom' : 'classroom');
  const [activeChatId, setActiveChatId] = useState<string | null>(deepLinkParentId || null);
  
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, activeTab, activeChatId]);

  useEffect(() => {
    if (deepLinkParentId) {
      setActiveTab('parent_dm');
      setActiveChatId(deepLinkParentId);
    }
  }, [deepLinkParentId]);

  const handleSend = () => {
    if (!input.trim() || !user) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderName: user.name,
      senderId: user.uid,
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: activeTab,
      classId: activeTab === 'classroom' ? (user.assignedClassId || 'P4') : undefined,
      recipientId: activeTab === 'parent_dm' ? (activeChatId || undefined) : undefined
    };
    
    addMessage(newMessage);
    setInput('');
  };

  const classroomLabel = schoolConfig.classLabels[user?.assignedClassId || 'P4'];

  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      if (activeTab === 'classroom') {
        // Classroom messages for the user's class
        return m.type === 'classroom' && m.classId === (user?.assignedClassId || 'P4');
      }
      if (activeTab === 'parent_dm') {
        // DM between user and activeChatId
        return m.type === 'parent_dm' && (
          (m.senderId === user?.uid && m.recipientId === activeChatId) ||
          (m.senderId === activeChatId && m.recipientId === user?.uid)
        );
      }
      return false;
    });
  }, [messages, activeTab, activeChatId, user]);

  const sidebarContacts = useMemo(() => {
    if (isStaff) return allUsers.filter(u => u.role === UserRole.PARENT);
    if (isParent) return allUsers.filter(u => u.role === UserRole.TEACHER && u.assignedClassId === user?.assignedClassId);
    return [];
  }, [allUsers, isStaff, isParent, user]);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-8 border-b border-slate-800">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Sync Core</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Classroom Link Active</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <button 
            onClick={() => { setActiveTab('classroom'); setActiveChatId(null); }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition duration-300 ${activeTab === 'classroom' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'classroom' ? 'bg-white/20' : 'bg-slate-800'}`}>
              <Globe size={18} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-tight">Main Room</p>
              <p className={`text-[9px] font-bold uppercase ${activeTab === 'classroom' ? 'text-indigo-200' : 'text-slate-500'}`}>{classroomLabel} Public</p>
            </div>
          </button>

          {!isStudent && (
            <div className="pt-8">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-5 mb-4">{isStaff ? 'Institutional Guardians' : 'Academic Faculty'}</p>
              <div className="space-y-1">
                {sidebarContacts.map(contact => (
                  <button 
                    key={contact.uid}
                    onClick={() => { setActiveTab('parent_dm'); setActiveChatId(contact.uid); }}
                    className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl transition duration-300 ${activeChatId === contact.uid ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-600/20' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
                  >
                    <div className={`p-2 rounded-xl ${activeChatId === contact.uid ? 'bg-white/20' : 'bg-slate-800'}`}>
                      <User size={16} />
                    </div>
                    <div className="text-left truncate">
                      <p className="text-xs font-black uppercase truncate tracking-tight">{contact.name}</p>
                      <p className={`text-[9px] font-bold uppercase ${activeChatId === contact.uid ? 'text-emerald-200' : 'text-slate-600'}`}>{contact.role.replace('_', ' ')}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-950">
        <div className="h-20 border-b border-slate-900 flex items-center px-10 justify-between bg-slate-950/50 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeTab === 'classroom' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40' : 'bg-emerald-600 text-white shadow-2xl shadow-emerald-600/40'}`}>
              {activeTab === 'classroom' ? <Hash size={24} /> : <User size={24} />}
            </div>
            <div>
              <h3 className="font-black text-white uppercase tracking-tight text-base">
                {activeTab === 'classroom' ? `${classroomLabel} General` : sidebarContacts.find(c => c.uid === activeChatId)?.name || 'Direct Uplink'}
              </h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                {activeTab === 'classroom' ? 'Standard Protocol Channel' : 'Secure Point-to-Point Link'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Channel Secure</span>
            </div>
            <ShieldCheck size={24} className="text-slate-700 hover:text-indigo-500 transition cursor-help" />
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 p-10 overflow-y-auto space-y-10 custom-scrollbar">
          {filteredMessages.map((msg, idx) => (
            <div key={idx} className={`flex gap-5 ${msg.senderId === user?.uid ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border border-slate-800 shadow-xl ${msg.senderId === user?.uid ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'}`}>
                {msg.senderName.charAt(0)}
              </div>
              <div className={`max-w-[65%] ${msg.senderId === user?.uid ? 'items-end' : ''} flex flex-col`}>
                <div className="flex items-center gap-3 mb-2 px-1">
                  <span className="text-[10px] font-black text-white uppercase tracking-tight">{msg.senderName}</span>
                  <span className="text-[8px] text-slate-600 font-bold uppercase">{msg.timestamp}</span>
                </div>
                <div className={`px-6 py-4 rounded-3xl text-sm font-medium shadow-2xl leading-relaxed ${msg.senderId === user?.uid ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          
          {filteredMessages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
               <MessageSquare size={64} className="text-slate-400 mb-6" />
               <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No communication logs detected in this buffer.</p>
            </div>
          )}
        </div>

        <div className="p-8 bg-slate-950/50 border-t border-slate-900 backdrop-blur-md">
          <div className="max-w-4xl mx-auto flex gap-5 bg-slate-900 p-2 rounded-[2rem] border border-slate-800 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-600 transition-all duration-500 group">
            <input 
              type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Draft institutional update..." className="flex-1 bg-transparent border-none px-6 py-4 text-xs font-bold text-white focus:ring-0 placeholder:text-slate-600"
            />
            <button 
              onClick={handleSend} 
              disabled={!input.trim()} 
              className="bg-indigo-600 p-5 rounded-2xl text-white shadow-2xl shadow-indigo-600/40 hover:bg-indigo-700 disabled:opacity-20 transition-all duration-300 group-hover:scale-105"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-[8px] text-center text-slate-700 font-bold uppercase tracking-[0.4em] mt-4">Transmitting via EduChain Secure Protocol v2.4</p>
        </div>
      </div>
    </div>
  );
};

export default MessagingHub;
