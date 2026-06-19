'use client';

import Profile from '../../profile/Profile/Profile';

export default function UserEditPage({ params }: { params: { id: string } }) {
  const userId = parseInt(params.id);
  
  return <Profile userId={userId} />;
}
