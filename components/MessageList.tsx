import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { Bot, User, FileText, Volume2 } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isStreaming }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 mt-20">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
             <Bot size={40} className="text-cyan-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-700 mb-2">مرحباً بك في ألاسكا</h2>
          <p className="max-w-md">أنا هنا لمساعدتك في تحليل البيانات، الصور، ملفات PDF، والمحادثة الصوتية. كيف يمكنني خدمتك اليوم؟</p>
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {/* Avatar */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
            msg.role === 'user' 
              ? 'bg-slate-800 text-white' 
              : 'bg-cyan-600 text-white'
          }`}>
            {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
          </div>

          {/* Bubble */}
          <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`px-5 py-3 rounded-2xl shadow-sm whitespace-pre-wrap leading-relaxed relative ${
              msg.role === 'user'
                ? 'bg-slate-800 text-white rounded-tr-sm'
                : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'
            } ${msg.isError ? 'border-red-500 bg-red-50 text-red-600' : ''}`}>
              
              {/* Display Image if present */}
              {msg.image && (
                <div className="mb-3">
                  <img 
                    src={msg.image} 
                    alt="User uploaded" 
                    className="max-w-full rounded-lg border border-white/20 shadow-sm max-h-[300px] object-cover"
                  />
                </div>
              )}

              {/* Display PDF if present */}
              {msg.pdf && (
                <div className="mb-3 flex items-center gap-2 p-2 bg-white/10 rounded-lg border border-white/20">
                   <FileText size={24} className="text-red-400" />
                   <span className="text-sm opacity-90">ملف PDF مرفق</span>
                </div>
              )}
              
              {msg.text}

              {/* Audio Player if present */}
              {msg.audio && (
                <div className="mt-3 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-cyan-600 text-xs font-semibold mb-1">
                        <Volume2 size={14} />
                        <span>رد صوتي</span>
                    </div>
                    <audio controls autoPlay className="w-full h-8 max-w-[200px]" src={`data:audio/wav;base64,${msg.audio}`} />
                </div>
              )}

            </div>
            {msg.role === 'model' && (
              <span className="text-xs text-slate-400 mt-1 px-1">ألاسكا AI</span>
            )}
          </div>
        </div>
      ))}
      
      {isStreaming && (
        <div className="flex gap-4">
           <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center shadow-sm">
            <Bot size={20} />
          </div>
          <div className="bg-white border border-slate-100 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      )}
      
      <div ref={bottomRef} className="h-4" />
    </div>
  );
};