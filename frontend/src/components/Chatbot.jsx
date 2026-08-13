import React, { useState, useRef, useEffect } from 'react';
import { chatbotService } from '../services/api';
import { MessageSquare, X, Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      sender: 'ai', 
      text: '¡Hola! Soy tu asistente inteligente FitNet. 🏋️‍♂️ Puedo ayudarte con tus rutinas de ejercicios, técnica de entrenamiento y nutrición básica. ¿Qué te gustaría saber hoy?' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  const suggestionChips = [
    'Rutina principiante',
    'Técnica de sentadillas',
    'Cuánta proteína comer',
    'Cómo perder grasa'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    if (!textToSend) {
      setInputText('');
    }

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setIsLoading(true);

    try {
      const data = await chatbotService.sendMessage(text);
      setMessages(prev => [...prev, { sender: 'ai', text: data.response }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: 'Lo siento, he tenido un problema para conectar con mi base de conocimientos. Por favor, asegúrate de que el microservicio de IA esté corriendo en el puerto 5000.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-20 md:fixed md:bottom-6 md:right-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Chat Header */}
          <div className="bg-blue-600 px-5 py-4 flex items-center justify-between shadow-sm relative z-10">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-1.5 rounded-xl text-blue-600 shadow-sm">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white tracking-tight">FitNet Coach AI</h3>
                <span className="text-[10px] text-blue-100 font-medium flex items-center space-x-1.5 mt-0.5">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block animate-pulse"></span>
                  <span>En línea</span>
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-blue-100 hover:text-white hover:bg-blue-700 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 flex flex-col bg-slate-50/50">
            {messages.map((msg, index) => {
              const isAI = msg.sender === 'ai';
              return (
                <div 
                  key={index}
                  className={`flex ${isAI ? 'justify-start' : 'justify-end'} space-x-2.5 max-w-[85%] ${isAI ? 'self-start' : 'self-end'}`}
                >
                  {isAI && (
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  <div className={`p-3.5 rounded-2xl text-[13px] whitespace-pre-wrap leading-relaxed shadow-sm ${
                    isAI 
                      ? 'bg-white text-slate-700 border border-slate-200 rounded-tl-none' 
                      : 'bg-blue-600 text-white font-medium rounded-tr-none'
                  }`}>
                    {msg.text}
                  </div>
                  {!isAI && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4 text-slate-500" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading / Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start space-x-2.5 max-w-[85%] self-start">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="p-3.5 bg-white text-slate-500 border border-slate-200 shadow-sm rounded-2xl rounded-tl-none flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-xs font-medium">Pensando...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions chips */}
          <div className="px-5 py-3 border-t border-slate-100 bg-white flex flex-wrap gap-2">
            {suggestionChips.map(chip => (
              <button
                key={chip}
                onClick={() => handleSendMessage(chip)}
                className="text-[11px] font-bold tracking-wide bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-200 transition-all cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Footer */}
          <div className="p-4 border-t border-slate-100 bg-white flex items-center space-x-2.5">
            <input
              type="text"
              placeholder="Escribe tu duda fitness..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-slate-50 border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:hover:bg-blue-600 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg shadow-blue-600/30 transition-transform duration-300 hover:scale-105 flex items-center justify-center group cursor-pointer relative"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-bounce"></span>
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform duration-200" />}
      </button>
    </div>
  );
};

export default Chatbot;
