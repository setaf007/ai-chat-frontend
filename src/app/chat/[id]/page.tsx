'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export default function Chat() {
  const params = useParams();
  const chatId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.push('/login');
    else fetchChat();
  }, [token, router]);

  const fetchChat = async () => {
    const data = await apiFetch(`/chats/${chatId}/?include_messages=true`);
    setMessages(data.messages || []);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const now = new Date().toISOString();
    const userMsg: Message = { 
        id: Date.now(), 
        role: 'user', 
        content: input, 
        created_at: now 
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
        const aiMsg: Message = await apiFetch(`/chats/${chatId}/messages/`, {
        method: 'POST',
        body: JSON.stringify({ role: 'user', content: input }),
        });
        setMessages(prev => [...prev, aiMsg]);
    } catch (e: any) {
        setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'assistant' as const, 
        content: 'Error: ' + e.message, 
        created_at: now 
        }]);
    }
    setLoading(false);
    };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 shadow-sm">
        <Button variant="ghost" onClick={() => router.back()}>← Back to Chats</Button>
      </header>
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-8">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-br-sm' : 'bg-white border shadow-sm rounded-bl-sm'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <div className={`flex items-center gap-2 mt-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={msg.role === 'user' ? undefined : '/ai-icon.png'} />
                    <AvatarFallback>{msg.role === 'user' ? 'U' : 'AI'}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-slate-500">{new Date(msg.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="p-4 rounded-2xl bg-white border shadow-sm">
                <div className="h-6 bg-slate-200 rounded animate-pulse w-64" />
              </div>
            </div>
          )}
        </div>
        <div className="border-t bg-white p-4 sticky bottom-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Message LM Studio AI..."
              className="flex-1"
              disabled={loading}
            />
            <Button onClick={sendMessage} disabled={!input.trim() || loading}>
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
