import fs from 'fs';
import path from 'path';

const login = `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Church } from 'lucide-react';
import { signInUser } from '@/lib/firebase-utils';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInUser(formData.email, formData.password);
      router.push('/');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to sign in.';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WRAPPER className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6">
      <WRAPPER className="sm:mx-auto sm:w-full sm:max-w-md">
        <WRAPPER className="flex justify-center">
          <WRAPPER className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg">
            <Church className="w-8 h-8 text-primary" />
          </WRAPPER>
        </WRAPPER>
        <h2 className="mt-6 text-center text-3xl font-bold text-foreground">Solution Pastures Admin</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">Sign in to manage your church app</p>
      </WRAPPER>

      <WRAPPER className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <WRAPPER className="bg-card py-8 px-4 shadow-lg border border-border sm:rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <WRAPPER>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">Email</label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@church.com"
              />
            </WRAPPER>
            <WRAPPER>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">Password</label>
              <WRAPPER className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  className="block w-full px-3 py-2 pr-10 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                </button>
              </WRAPPER>
            </WRAPPER>
            <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/signup" className="font-medium text-primary hover:underline">Create admin account</Link>
          </p>
        </WRAPPER>
      </WRAPPER>
    </WRAPPER>
  );
}
`.replaceAll('WRAPPER', 'motion').replaceAll('<motion', '<' + 'div').replaceAll('</motion>', '</' + 'div>');

fs.writeFileSync(path.join(process.cwd(), 'app/login/page.tsx'), login);
console.log('login done');
