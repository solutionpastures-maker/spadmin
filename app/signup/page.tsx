'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Church, User, Mail, Lock, Building, KeyRound } from 'lucide-react';
import { signInUser } from '@/lib/firebase-utils';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    churchName: '',
    signupCode: '',
  });
  const [errors, setErrors] = useState<string[]>([]);

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.displayName.trim()) {
      newErrors.push('Display name is required');
    }

    if (!formData.email.trim()) {
      newErrors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push('Please enter a valid email address');
    }

    if (!formData.password) {
      newErrors.push('Password is required');
    } else if (formData.password.length < 8) {
      newErrors.push('Password must be at least 8 characters long');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Passwords do not match');
    }

    if (!formData.churchName.trim()) {
      newErrors.push('Church name is required');
    }

    if (!formData.signupCode.trim()) {
      newErrors.push('Admin signup code is required');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      const verifyRes = await fetch('/api/auth/signup/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signupCode: formData.signupCode.trim() }),
      });

      if (!verifyRes.ok) {
        const verifyData = await verifyRes.json().catch(() => ({}));
        setErrors([verifyData.error || 'Invalid signup code']);
        setIsLoading(false);
        return;
      }

      const profileRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signupCode: formData.signupCode.trim(),
          name: formData.displayName,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!profileRes.ok) {
        const profileData = await profileRes.json().catch(() => ({}));
        throw new Error(profileData.error || 'Failed to create admin profile');
      }

      await signInUser(formData.email, formData.password);
      router.push('/');
    } catch (error: unknown) {
      console.error('Signup error:', error);

      let errorMessage = 'Failed to create account. Please try again.';

      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      setErrors([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
            <Church className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Create Admin Account
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Set up a new administrator account with your invite code
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Admin signup code */}
            <div>
              <label htmlFor="signupCode" className="block text-sm font-medium text-foreground">
                Admin signup code
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="signupCode"
                  name="signupCode"
                  type="password"
                  autoComplete="off"
                  required
                  value={formData.signupCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, signupCode: e.target.value }))}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-input rounded-md placeholder-gray-400 focus:outline-none focus:ring-ring focus:border-ring sm:text-sm text-foreground"
                  placeholder="Enter your invite code"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Provided by your church tech team. Not the same as your login password.
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-foreground">
                Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-input rounded-md placeholder-gray-400 focus:outline-none focus:ring-ring focus:border-ring sm:text-sm text-foreground"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Church Name */}
            <div>
              <label htmlFor="churchName" className="block text-sm font-medium text-foreground">
                Church Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="churchName"
                  name="churchName"
                  type="text"
                  required
                  value={formData.churchName}
                  onChange={(e) => setFormData(prev => ({ ...prev, churchName: e.target.value }))}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-input rounded-md placeholder-gray-400 focus:outline-none focus:ring-ring focus:border-ring sm:text-sm text-foreground"
                  placeholder="Enter your church name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-input rounded-md placeholder-gray-400 focus:outline-none focus:ring-ring focus:border-ring sm:text-sm text-foreground"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-input rounded-md placeholder-gray-400 focus:outline-none focus:ring-ring focus:border-ring sm:text-sm text-foreground"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-input rounded-md placeholder-gray-400 focus:outline-none focus:ring-ring focus:border-ring sm:text-sm text-foreground"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Please fix the following errors:
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-input" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="font-medium text-primary hover:text-blue-500"
              >
                Sign in to your account
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              By creating an account, you agree to use this tool responsibly and only for church administration purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
