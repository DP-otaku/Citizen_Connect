import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { askAi } from '../services/api';
import { Bot, User, Send, AlertTriangle } from 'lucide-react';
import './AiChat.css';

export default function AiChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'ai', content: `Hello ${user?.name?.split(' ')[0] || 'there'}! I am the Citizen Connect AI Assistant. Ask me anything about disaster guidelines, relief norms, or reporting protocols.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await askAi(userMessage);
      const aiResponse = res.data.answer;
      const sources = res.data.sources?.filter(s => s) || [];
      
      let finalContent = aiResponse;
      if (sources.length > 0) {
        finalContent += `\n\n*(Sources: ${sources.join(', ')})*`;
      }

      setMessages(prev => [...prev, { role: 'ai', content: finalContent }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "⚠️ Sorry, I'm having trouble connecting to my brain right now. Make sure the AI service and Ollama are running!", isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-page">
      <div className="ai-chat-header">
        <h1><Bot size={32} color="var(--color-primary)" /> Ask AI</h1>
        <p>Instant answers to disaster relief protocols</p>
      </div>

      <div className="ai-chat-container glass-card">
        <div className="ai-chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`ai-message-wrapper ${msg.role === 'user' ? 'wrapper-user' : 'wrapper-ai'}`}>
              <div className={`ai-message ${msg.role === 'user' ? 'msg-user' : 'msg-ai'} ${msg.isError ? 'msg-error' : ''}`}>
                <div className="msg-avatar">{msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}</div>
                <div className="msg-content">
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="ai-message-wrapper wrapper-ai">
              <div className="ai-message msg-ai">
                <div className="msg-avatar"><Bot size={20} /></div>
                <div className="msg-content msg-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="ai-chat-input-area">
          <input
            type="text"
            className="form-input ai-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about NDRF guidelines or SDRF norms..."
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary ai-submit" disabled={loading || !input.trim()}>
            Send <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
