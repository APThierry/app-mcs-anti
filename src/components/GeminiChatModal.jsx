import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, User, MessageCircle, MapPin, Ticket, Film } from 'lucide-react';
import { geminiService } from '../services/geminiService';

export default function GeminiChatModal({ isOpen, onClose }) {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Olá! Sou o Assistente Oficial do Monte Carmo Shopping. Como posso te ajudar hoje com lojas, cinema Cineart, cupons ou pontuação?'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const query = inputMessage.trim();
    if (!query || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const responseText = await geminiService.askAssistant(query, messages);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: responseText
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'Desculpe, tive um problema de conexão. Você pode falar diretamente com o shopping pelo WhatsApp (31) 3117-1511.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (q) => {
    setInputMessage(q);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        height: '620px',
        maxHeight: '90vh',
        backgroundColor: '#1E293B',
        borderRadius: '24px',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        {/* Header do Chat */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(16,185,129,0.5)'
            }}>
              <Sparkles size={22} color="#FFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#FFF', margin: 0 }}>Monte Carmo IA</h3>
                <span style={{ fontSize: '10px', backgroundColor: '#10B981', color: '#FFF', padding: '2px 6px', borderRadius: '10px', fontWeight: '800' }}>GEMINI RAG</span>
              </div>
              <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>Assistente Oficial do Shopping</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Mensagens do Chat */}
        <div style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {messages.map((msg) => (
            <div 
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                gap: '8px'
              }}
            >
              {msg.sender === 'bot' && (
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '10px',
                  backgroundColor: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={16} color="#FFF" />
                </div>
              )}

              <div style={{
                maxWidth: '80%',
                padding: '12px 14px',
                borderRadius: '16px',
                backgroundColor: msg.sender === 'user' ? '#10B981' : '#0F172A',
                color: '#FFF',
                fontSize: '13px',
                lineHeight: '18px',
                border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                borderTopLeftRadius: msg.sender === 'bot' ? '4px' : '16px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}>
                {msg.text}
              </div>

              {msg.sender === 'user' && (
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '10px',
                  backgroundColor: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={16} color="#FFF" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '10px',
                backgroundColor: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={16} color="#FFF" />
              </div>
              <div style={{
                padding: '10px 14px',
                borderRadius: '14px',
                backgroundColor: '#0F172A',
                color: '#94A3B8',
                fontSize: '12px',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                Digitando resposta...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sugestões Rápidas de Perguntas */}
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          backgroundColor: '#0F172A'
        }}>
          {[
            'Onde fica a academia?',
            'Qual o WhatsApp do shopping?',
            'Como resgatar cupons?',
            'Filmes em cartaz no cinema'
          ].map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickQuestion(q)}
              style={{
                background: '#1E293B',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                color: '#10B981',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Campo de Input */}
        <form 
          onSubmit={handleSendMessage}
          style={{
            padding: '12px 16px',
            backgroundColor: '#1E293B',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            gap: '8px'
          }}
        >
          <input
            type="text"
            placeholder="Pergunte sobre lojas, cinema ou cupons..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            style={{
              flex: 1,
              backgroundColor: '#0F172A',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '10px 14px',
              color: '#FFF',
              fontSize: '13px',
              outline: 'none'
            }}
          />

          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            style={{
              backgroundColor: '#10B981',
              border: 'none',
              borderRadius: '12px',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !inputMessage.trim() ? 0.6 : 1
            }}
          >
            <Send size={18} color="#FFF" />
          </button>
        </form>
      </div>
    </div>
  );
}
