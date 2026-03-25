'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/lib/types';

interface AuthProps {
  onAuthenticated: (userId: string, userName: string, isAdmin: boolean) => void;
}

export default function Auth({ onAuthenticated }: AuthProps) {
  const [step, setStep] = useState<'password' | 'select-user' | 'register'>('password');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (step === 'select-user') {
      loadUsers();
    }
  }, [step]);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('first_name');
    
    if (data) {
      setUsers(data);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['shared_password', 'admin_password']);

    setLoading(false);

    if (error || !data) {
      setError('Unable to verify password. Please try again.');
      return;
    }

    const sharedPassword = data.find((d) => d.key === 'shared_password')?.value;
    const adminPassword = data.find((d) => d.key === 'admin_password')?.value;

    if (password === adminPassword) {
      setIsAdmin(true);
      sessionStorage.setItem('isAdmin', 'true');
      setStep('select-user');
    } else if (password === sharedPassword) {
      setIsAdmin(false);
      sessionStorage.setItem('isAdmin', 'false');
      setStep('select-user');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const handleUserSelect = (userId: string, userName: string) => {
    sessionStorage.setItem('userId', userId);
    sessionStorage.setItem('userName', userName);
    sessionStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
    onAuthenticated(userId, userName, isAdmin);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();

    const { data: existingUser } = await supabase
      .from('users')
      .select('initials')
      .eq('initials', initials)
      .single();

    let finalInitials = initials;
    if (existingUser) {
      finalInitials = initials + '2';
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        first_name: firstName,
        last_name: lastName,
        initials: finalInitials,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      setError('Unable to register. Please try again.');
      return;
    }

    if (data) {
      const fullName = `${firstName} ${lastName}`;
      handleUserSelect(data.id, fullName);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Bible Study Group
        </h1>

        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Group Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 b
