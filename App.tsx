import React, { useState } from 'react';
import { Header } from './components/Header';
import { MessageList } from './components/MessageList';
import { InputArea } from './components/InputArea';
import { Message } from './types';
import { sendMessageToAlaska, generateSpeechFromText } from './services/aiService';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSend = async (text: string, imageFile?: File, pdfFile?: File, isVoice: boolean = false) => {
    setIsLoading(true);
    setCurrentResponse('');

    let imageBase64: string | undefined = undefined;
    let pdfBase64: string | undefined = undefined;
    
    try {
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
      }
      if (pdfFile) {
        pdfBase64 = await fileToBase64(pdfFile);
      }

      // Add user message
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        text: text.trim(),
        image: imageBase64,
        pdf: pdfBase64
      };
      
      setMessages(prev => [...prev, userMsg]);

      // Create a temporary ID for the streaming message
      const responseId = (Date.now() + 1).toString();
      
      let collectedText = '';
      
      // Optimize prompt for voice: Force conciseness to reduce TTS latency
      const promptToSend = isVoice 
        ? `${text} (أجب باختصار شديد ومباشر لأنني أستخدم المساعد الصوتي)`
        : text;
      
      // Send to AI
      await sendMessageToAlaska(promptToSend, imageBase64, pdfBase64, (chunk) => {
        collectedText += chunk;
        setCurrentResponse(prev => prev + chunk);
        
        // Live update the messages array so the user sees typing
        setMessages(prevMessages => {
          const lastMsg = prevMessages[prevMessages.length - 1];
          if (lastMsg && lastMsg.role === 'model' && lastMsg.id === responseId) {
            // Update existing model message
            return prevMessages.map(m => 
              m.id === responseId ? { ...m, text: collectedText } : m
            );
          } else {
            // Add new model message
            return [...prevMessages, {
              id: responseId,
              role: 'model',
              text: collectedText,
            }];
          }
        });
      });

      // If voice mode, generate audio after text is complete
      if (isVoice && collectedText) {
         // Generate WAV audio
         const audioBase64 = await generateSpeechFromText(collectedText);
         if (audioBase64) {
            setMessages(prevMessages => {
              return prevMessages.map(m => 
                m.id === responseId ? { ...m, audio: audioBase64 } : m
              );
            });
         }
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى لاحقاً.',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
      setCurrentResponse('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      <Header />
      
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full bg-white shadow-xl shadow-slate-200/50 my-0 sm:my-4 sm:rounded-2xl border-x border-slate-100 overflow-hidden">
        <MessageList messages={messages} isStreaming={isLoading && currentResponse === '' && messages[messages.length - 1]?.role !== 'model'} />
        <InputArea onSend={handleSend} isLoading={isLoading} />
      </main>
    </div>
  );
}