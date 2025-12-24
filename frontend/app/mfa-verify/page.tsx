'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MfaVerifyModal from '@/components/MfaVerifyModal';

export default function MfaVerifyPage() {
  const router = useRouter();
  const [tempToken, setTempToken] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('mfaTempToken');
    if (!token) {
      router.push('/login');
      return;
    }
    setTempToken(token);
    setIsReady(true);
  }, [router]);

  const handleSuccess = (token: string, userId: string, role: string) => {
    localStorage.removeItem('mfaTempToken');
    localStorage.removeItem('mfaUserId');
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ userId, role }));
    
    if (role === 'parent') {
      router.push('/parent');
    } else {
      router.push('/dashboard');
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('mfaTempToken');
    localStorage.removeItem('mfaUserId');
    router.push('/login');
  };

  if (!isReady) {
    return null;
  }

  return (
    <MfaVerifyModal
      isOpen={true}
      tempToken={tempToken}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}

