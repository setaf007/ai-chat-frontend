'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

interface Chat {
  id: number;
  title: string;
  created_at: string;
  messages?: Array<{ role: string; content: string }>;
}

export default function Dashboard() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [newChat, setNewChat] = useState('');
  const router = useRouter();
  const { token, logout } = useAuth();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      if (!token) {
        router.push('/login');
        return;
      }
      const data = await apiFetch('/chats/');
      setChats(data);
    } catch (error: any) {
      console.error('Chats error:', error.message);
      if (error.message.includes('401') || error.message.includes('token')) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        alert('Error loading chats: ' + error.message);
      }
    } finally {
      setLoading(false);  // ✅ Always exit loading
    }
  };

  const createChat = async () => {
    if (!newChat.trim()) return;
    try {
      await apiFetch('/chats/', { method: 'POST', body: JSON.stringify({ title: newChat }) });
      setNewChat('');
      fetchChats();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading chats...</div>;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-200 p-8">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          My AI Chats
        </h1>
        <div className="flex gap-2">
          <Button onClick={logout} variant="outline">Logout</Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        <div className="flex gap-4 mb-8">
          <input
            className="flex-1 max-w-md px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            placeholder="New chat title..."
            value={newChat}
            onChange={e => setNewChat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createChat()}
          />
          <Button onClick={createChat}>New Chat</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chats.length === 0 ? (
            <p className="col-span-full text-center text-slate-500 py-12">
              No chats yet. Create one above!
            </p>
          ) : (
            chats.map(chat => (
              <Card key={chat.id} className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => router.push(`/chat/${chat.id}`)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1 group-hover:text-slate-900">{chat.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs">{chat.messages?.length || 0} msgs</Badge>
                  </div>
                  <CardDescription className="text-sm line-clamp-2">
                    {chat.messages?.[chat.messages.length - 1]?.content || 'Start chatting...'}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
