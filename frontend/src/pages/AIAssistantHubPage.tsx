import React, { useState } from 'react';
import { workflowApi } from '../features/workflow/services/workflowApi';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  references?: string[];
  timestamp: Date;
}

export const AIAssistantHubPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    sender: 'AI',
    text: 'Hello! I am Lumina AI Assistant. You can ask me questions about general trade finance compliance (e.g. UCP 600 rules) or provide an LC ID for contextual query resolution.',
    timestamp: new Date()
  }]);
  const [loading, setLoading] = useState(false);
  const [lcIdContext, setLcIdContext] = useState('');

  const token = localStorage.getItem('token') || 'mock-jwt-token-xyz';

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'USER',
      text: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const payload = {
        query: userMessage.text,
        context: lcIdContext ? { lcId: lcIdContext } : undefined
      };

      const res = await workflowApi.aiQueryAssistant(payload, token);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'AI',
        text: res.data.response,
        references: res.data.references,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'AI',
        text: err.response?.data?.message || 'I am currently unavailable. Please try again later.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">AI Intelligence Hub</h1>
          <p className="text-on-surface-variant text-sm">Contextual queries & compliance guidance powered by MongoDB Atlas Vector Search.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-outline">LC Context:</span>
          <input 
            type="text" 
            placeholder="Optional LC ID" 
            value={lcIdContext}
            onChange={(e) => setLcIdContext(e.target.value)}
            className="bg-surface border border-outline-variant/30 rounded-lg px-3 py-1.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/50 transition-all w-48"
          />
        </div>
      </div>

      <div className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-t-xl shadow-lg flex flex-col overflow-hidden">
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl p-4 ${
                msg.sender === 'USER' 
                  ? 'bg-primary text-on-primary rounded-tr-sm shadow-md' 
                  : 'bg-surface-container-highest text-on-surface border border-outline-variant/20 rounded-tl-sm'
              }`}>
                <div className="flex items-center gap-2 mb-1 opacity-80">
                  <span className="material-symbols-outlined text-sm">
                    {msg.sender === 'USER' ? 'person' : 'smart_toy'}
                  </span>
                  <span className="text-xs font-medium">{msg.sender === 'USER' ? 'You' : 'Lumina AI'}</span>
                  <span className="text-[10px] ml-auto">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                
                {msg.references && msg.references.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-outline-variant/20 flex flex-wrap gap-2">
                    {msg.references.map((ref, idx) => (
                      <span key={idx} className="bg-surface/50 px-2 py-1 rounded text-[10px] font-mono border border-outline-variant/10">
                        {ref}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-surface-container-highest border border-outline-variant/20 rounded-2xl rounded-tl-sm p-4 flex gap-2 items-center">
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-surface-container border-t border-outline-variant/20">
          <div className="flex gap-3">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a compliance or trade finance question..." 
              className="flex-1 bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
              disabled={loading}
            />
            <button 
              onClick={handleSend}
              disabled={loading || !query.trim()}
              className="bg-primary hover:bg-primary-fixed disabled:opacity-50 text-on-primary rounded-xl px-6 flex items-center justify-center transition-all shadow-md shadow-primary/20"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
