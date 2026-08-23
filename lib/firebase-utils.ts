/**
 * Auth helpers (Supabase Auth) plus Firebase Storage uploads.
 */

import type { User } from '@supabase/supabase-js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { supabase } from './supabase';

export type AuthUser = {
  id: string;
  uid: string;
  email: string | null;
  displayName: string | null;
};

function mapUser(user: User): AuthUser {
  const name =
    typeof user.user_metadata?.name === 'string'
      ? user.user_metadata.name
      : typeof user.user_metadata?.displayName === 'string'
        ? user.user_metadata.displayName
        : null;
  return {
    id: user.id,
    uid: user.id,
    email: user.email ?? null,
    displayName: name,
  };
}

export const signInUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) {
    const value = error.message.toLowerCase();
    if (value.includes('invalid login') || value.includes('invalid_credentials')) {
      throw new Error(
        'That email has no password on the new sign-in yet. Old app passwords were not copied. Create a password first.'
      );
    }
    if (value.includes('email not confirmed')) {
      throw new Error('Confirm your email before signing in. Check the setup link we sent.');
    }
    throw new Error(error.message);
  }
  if (!data.user) throw new Error('Sign in failed');
  return mapUser(data.user);
};

export const signUpUser = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { name } },
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Could not create account');
  return mapUser(data.user);
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user ? mapUser(data.session.user) : null;
};

export const onAuthChange = (callback: (user: AuthUser | null) => void) => {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ? mapUser(session.user) : null);
  });
  return () => data.subscription.unsubscribe();
};

export const uploadFile = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};

export const isUserAdmin = async (): Promise<boolean> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return false;
    const response = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return false;
    const body = (await response.json()) as { role?: string };
    return body.role === 'admin';
  } catch {
    return false;
  }
};
