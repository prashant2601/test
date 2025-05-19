import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Custom hook to access auth context
import { readLocalStorageValue } from '@mantine/hooks';
import { Center, Loader } from '@mantine/core';
import { UserRoleTypes } from '../pages/admin/adminPanelSetting/usersAndRole/constants';

interface ProtectedRouteProps {
  element: React.ReactNode;
  protectedForRole?: UserRoleTypes;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  protectedForRole,
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const appToken = readLocalStorageValue({ key: 'appToken' });
  if (!appToken) {
    return <Navigate to="/login" state={{ from: location }} />;
  }
  if (!user) {
    return (
      <Center h={'100vh'}>
        <Loader size={'lg'} />
      </Center>
    );
  }
  if (
    protectedForRole === 'merchant' &&
    !['admin', 'superAdmin', 'merchant']?.includes(user?.role)
  ) {
    return <Navigate to="/merchant/unauthorized" />;
  }
  return <>{element}</>;
};

export default ProtectedRoute;
