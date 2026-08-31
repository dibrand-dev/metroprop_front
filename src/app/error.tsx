'use client';

import Button from '@/ui/Button/Button';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div>
        <h2>Ha ocurrido un error</h2>

        <Button
            label="Intentar de nuevo"
            type="button"
            variant="primary"
            fullWidth={false}
            size="medium"
            onClick={() => reset()}
        />
    </div>
  );
}