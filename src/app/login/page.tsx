'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, register } = useAuth();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      router.push('/dashboard');
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-200 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? 'Login' : 'Register'}</CardTitle>
          <CardDescription>Connect to your AI chats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isLogin && (
            <Input 
              placeholder="Username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
            />
          )}
          <Input 
            placeholder="Email" 
            type="email"
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
          <Input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={loading || (!isLogin && !username) || !email || !password} className="flex-1">
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
            </Button>
            <Button variant="outline" onClick={() => setIsLogin(!isLogin)} className="flex-1">
              {isLogin ? 'Register' : 'Login'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
