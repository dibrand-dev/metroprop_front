'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';
import { API_BASE_URL } from '@/utils/utils';

interface TokkoPropertyPageProps {
  params: { id: string };
}

export default function TokkoPropertyPage({ params }: TokkoPropertyPageProps) {
  const { id } = params;
  const router = useRouter();
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`${API_BASE_URL}/properties/tokko/${id}`)
      .then((result: any) => {
        if (result?.id) {
          router.replace(`/propertyDetail/${result.id}`);
        } else {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
  }, [id]);


  if (loading) return <p style={{ padding: '2rem' }}>Cargando...</p>;
  if (error) return <p style={{ padding: '2rem', color: 'red' }}>Error: {error}</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
        Propiedad Tokko #{id}
      </h1>
      <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px', overflow: 'auto', fontSize: '0.85rem' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
