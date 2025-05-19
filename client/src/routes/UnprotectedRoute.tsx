import { Skeleton } from '@mantine/core';
import { Suspense, useEffect } from 'react';

interface UnprotectedRouteProps {
  element: React.ReactNode;
}

const UnprotectedRoute: React.FC<UnprotectedRouteProps> = ({ element }) => {
  useEffect(() => {
    localStorage.removeItem('token');
  }, []);

  return (
    <Suspense fallback={<Skeleton height={300} width="100%" />}>
      {element}
    </Suspense>
  );
};

export default UnprotectedRoute;
