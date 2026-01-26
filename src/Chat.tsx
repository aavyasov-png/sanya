import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);

  useEffect(() => {
    setIsApiKeySet(!!import.meta.env.VITE_OPENAI_API_KEY && import.meta.env.VITE_OPENAI_API_KEY !== 'your_openai_api_key');
  }, []);

  useEffect(() => {
    // Load all content from Supabase
    const loadContext = async () => {
      const sections = await supabase.from('sections').select('title_ru, title_uz');
      const cards = await supabase.from('cards').select('title_ru, title_uz, body_ru, body_uz');
      const faq = await supabase.from('faq').select('question_ru, question_uz, answer_ru, answer_uz');
      const news = await supabase.from('news').select('title_ru, title_uz, body_ru, body_uz');
      const manual = await supabase.from('manual_sections').select('title, content');

      const allContent = [
        ...(sections.data || []).map(s => `${s.title_ru} ${s.title_uz}`),
        ...(cards.data || []).map(c => `${c.title_ru} ${c.title_uz} ${c.body_ru} ${c.body_uz}`),
        ...(faq.data || []).map(f => `${f.question_ru} ${f.question_uz} ${f.answer_ru} ${f.answer_uz}`),
        ...(news.data || []).map(n => `${n.title_ru} ${n.title_uz} ${n.body_ru} ${n.body_uz}`),
        ...(manual.data || []).map(m => `${m.title} ${m.content}`)
      ].join('\n');

      setContext(allContent);
    };
    loadContext();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    if (!isApiKeySet) {
      const errorMessage = { role: 'assistant' as const, content: 'Ключ API OpenAI не настроен. Обратитесь к администратору.' };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    try {
      // Generate response with OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: `You are a support bot for Uzum app. Use the following manual content to answer questions in Russian or Uzbek: ${context}` },
          userMessage
        ]
      });

      const assistantMessage = { role: 'assistant' as const, content: completion.choices[0].message.content || '' };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage = { role: 'assistant' as const, content: 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте позже.' };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      backgroundColor: '#f5f5f5', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px' 
      }} ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: '8px'
          }}>
            {msg.role === 'assistant' && (
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: '#6F00FF', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                fontSize: '14px', 
                marginRight: '8px',
                flexShrink: 0
              }}>
                🤖
              </div>
            )}
            <div style={{ 
              maxWidth: '70%', 
              padding: '12px 16px', 
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', 
              backgroundColor: msg.role === 'user' ? '#6F00FF' : 'white', 
              color: msg.role === 'user' ? 'white' : '#333', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
              wordWrap: 'break-word'
            }}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: '#ddd', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#333', 
                fontSize: '14px', 
                marginLeft: '8px',
                flexShrink: 0
              }}>
                👤
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ 
        padding: '16px', 
        borderTop: '1px solid #e0e0e0', 
        backgroundColor: 'white', 
        display: 'flex', 
        gap: '8px'
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSend()}
          placeholder="Введите вопрос..."
          style={{ 
            flex: 1, 
            padding: '12px 16px', 
            border: '1px solid #ccc', 
            borderRadius: '24px', 
            outline: 'none', 
            fontSize: '16px'
          }}
        />
        <button 
          onClick={handleSend} 
          style={{ 
            padding: '12px 20px', 
            border: 'none', 
            borderRadius: '24px', 
            backgroundColor: '#6F00FF', 
            color: 'white', 
            cursor: 'pointer', 
            fontSize: '16px', 
            fontWeight: 'bold'
          }}
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default Chat;
