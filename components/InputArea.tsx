import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Image as ImageIcon, X, Mic, FileText } from 'lucide-react';

interface InputAreaProps {
  onSend: (text: string, image?: File, pdf?: File, isVoice?: boolean) => void;
  isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent, isVoice: boolean = false) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedImage && !selectedPdf) || isLoading) return;
    
    onSend(input, selectedImage || undefined, selectedPdf || undefined, isVoice);
    setInput('');
    clearAttachments();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        setSelectedPdf(null); // Clear PDF if image selected
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedPdf(file);
        setSelectedImage(null); // Clear image if PDF selected
        setPreviewUrl(null);
      }
    }
  };

  const clearAttachments = () => {
    setSelectedImage(null);
    setSelectedPdf(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  const startListening = () => {
    if (isLoading) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("متصفحك لا يدعم خاصية التعرف على الصوت.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Automatically send after voice recognition
      setTimeout(() => onSend(transcript, undefined, undefined, true), 500);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 150)}px`;
    }
  }, [input]);

  return (
    <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 pb-6">
      <div className="max-w-4xl mx-auto relative">
        
        {/* Attachments Preview */}
        {(previewUrl || selectedPdf) && (
          <div className="mb-2 flex justify-start">
            <div className="relative group">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Selected" 
                  className="h-20 w-20 object-cover rounded-xl border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="h-20 w-20 bg-red-50 text-red-500 rounded-xl border border-red-100 flex flex-col items-center justify-center p-1">
                    <FileText size={24} />
                    <span className="text-[10px] mt-1 text-center truncate w-full">{selectedPdf?.name}</span>
                </div>
              )}
              
              <button 
                onClick={clearAttachments}
                className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 shadow-md hover:bg-red-500 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)} className="relative flex items-end gap-2 bg-slate-100/50 border border-slate-200 p-2 rounded-3xl shadow-inner focus-within:ring-2 focus-within:ring-cyan-500/50 focus-within:border-cyan-500 transition-all hover:border-slate-300">
          
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            onChange={handleFileSelect}
          />
          
          <input 
            type="file" 
            ref={pdfInputRef}
            className="hidden" 
            accept="application/pdf"
            onChange={handlePdfSelect}
          />

          <div className="flex gap-1 mb-[1px]">
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-slate-400 hover:text-cyan-600 hover:bg-slate-200/50 rounded-full transition-colors"
                title="إرفاق صورة"
            >
                <ImageIcon size={20} />
            </button>
            
             <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="تحليل PDF"
            >
                <FileText size={20} />
            </button>
          </div>

          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedImage ? "أضف وصفاً للصورة..." : selectedPdf ? "اسأل عن ملف PDF..." : "أرسل رسالة..."}
            className="w-full bg-transparent border-0 focus:ring-0 resize-none py-3 px-2 max-h-[150px] text-slate-800 placeholder:text-slate-400 rounded-2xl"
            style={{ minHeight: '48px' }}
            disabled={isLoading}
          />
          
          <div className="flex gap-1">
             <button
                type="button"
                onClick={startListening}
                disabled={isLoading}
                className={`p-3 rounded-full flex-shrink-0 transition-all duration-200 ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'text-slate-400 hover:text-cyan-600 hover:bg-slate-200/50'
                }`}
                title="مساعد صوتي"
            >
                <Mic size={20} />
            </button>

            <button
                type="submit"
                disabled={(!input.trim() && !selectedImage && !selectedPdf) || isLoading}
                className={`p-3 rounded-full flex-shrink-0 transition-all duration-200 ${
                (input.trim() || selectedImage || selectedPdf) && !isLoading
                    ? 'bg-cyan-600 text-white shadow-lg hover:bg-cyan-700 hover:scale-105' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
            >
                {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                <Send size={20} className={(input.trim() || selectedImage || selectedPdf) ? 'ml-0.5' : ''} />
                )}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-2">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <Sparkles size={10} />
            ألاسكا يمكن أن يخطئ. يرجى التحقق من المعلومات المهمة.
          </p>
        </div>
      </div>
    </div>
  );
};