'use client';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { useAccount } from '@/hooks/useAccount';

export default function Home() {
  const { account } = useAccount();

  useEffect(() => {
    redirect(account ? '/wallet' : '/create');
  }, [account]);

  return null;
}
