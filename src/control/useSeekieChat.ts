import { useState, useCallback, useEffect } from 'react';
import { t } from './i18n';

export type ChatMessage = {
  id: string;
  sender: 'user' | 'seekie';
  text: string;
};

const STORAGE_KEY = 'seekie_chat_history';

export function useSeekieChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim()
    };
    setMessages(prev => [...prev, userMsg]);

    // Simulate Seekie AI response after a short delay
    setTimeout(() => {
      const seekieMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'seekie',
        text: t.seekie.dummyResponse
      };
      setMessages(prev => [...prev, seekieMsg]);
    }, 1000);
  }, []);

  return {
    messages,
    sendMessage
  };
}
