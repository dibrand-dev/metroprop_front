'use client';

import { use } from 'react';
import Profile from '../../profile/Profile/Profile';

interface UserEditPageProps {
  params: Promise<{ id: string }>;
}

export default function UserEditPage({ params }: UserEditPageProps) {
  const resolvedParams = use(params);
  const userId = parseInt(resolvedParams.id);
  
  return <Profile userId={userId} />;
}
