'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Copy, Trash2 } from 'lucide-react';
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
  }, [token, router, chatId]);

  const fetchChat = async () => {
    try {
      const data = await apiFetch(`/chats/${chatId}/?include_messages=true`);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Fetch chat error:', error);
    }
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

  const copyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      // Optional: toast notification
      console.log('Copied to clipboard');
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <header className="bg-white dark:bg-slate-800 border-b px-6 py-4 shadow-sm">
        <Button variant="ghost" onClick={() => router.back()}>← Back to Chats</Button>
      </header>
      
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-6 mb-8 pb-20">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
              <div className={`max-w-3xl ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                {/* Message Bubble */}
                <div className={`p-4 rounded-2xl shadow-sm group relative ${
                  msg.role === 'user' 
                    ? 'bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-br-sm' 
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-sm'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
                
                {/* Actions - Hover to show */}
                <div className={`opacity-0 group-hover:opacity-100 transition-all flex mt-2 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={() => copyMessage(msg.content)}
                        className="cursor-pointer flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive flex items-center gap-2 cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Avatar + Time */}
                <div className={`flex items-center gap-2 mt-2 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={msg.role === 'user' ? '/user.png' : '/ai.png'} />
                    <AvatarFallback className="text-xs">
                      {msg.role === 'user' ? 'U' : 'AI'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start p-4">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                  <div className="w-3 h-3 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-3 h-3 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">AI is typing...</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Input */}
        <div className="border-t bg-white dark:bg-slate-800 p-4 sticky bottom-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Message your AI..."
              className="flex-1 min-h-11"
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
