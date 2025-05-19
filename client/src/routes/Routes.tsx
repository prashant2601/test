import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Skeleton } from '@mantine/core';
import { AuthProvider } from '../hooks/useAuth';
import { AbilityProvider } from '../abilityContext/AbilityContext';
import ProtectedRoute from './ProtectedRoute';
import UnprotectedRoute from './UnprotectedRoute';
import { routeConfig } from './routesConfig';
import NotFoundPage from '../pages/NotFound';
import { UserRoleTypes } from '../pages/admin/adminPanelSetting/usersAndRole/constants';

// Define the type for a single route
export interface AppRoute {
  path: string;
  element: React.ComponentType<any>;
  type: 'protected' | 'unprotected';
  protectedForRole?: UserRoleTypes;
  children?: AppRoute[]; // Nested routes
}

const AppRoutes: React.FC = () => {
  const renderRoutes = (routes: AppRoute[]): React.ReactNode =>
    routes.map(
      ({ path, element: Element, type, protectedForRole, children }) => {
        let WrappedElement: React.ReactNode = <Element />;

        if (type === 'protected') {
          WrappedElement = (
            <Suspense fallback={<Skeleton height={300} width="100%" />}>
              <ProtectedRoute
                element={WrappedElement}
                protectedForRole={protectedForRole}
              />
            </Suspense>
          );
        } else if (type === 'unprotected') {
          WrappedElement = (
            <Suspense fallback={<Skeleton height={300} width="100%" />}>
              <UnprotectedRoute element={WrappedElement} />;
            </Suspense>
          );
        }

        return (
          <Route key={path} path={path} element={WrappedElement}>
            {children && renderRoutes(children)}
          </Route>
        );
      }
    );

  return (
    <AbilityProvider>
      <AuthProvider>
        <Suspense fallback={<Skeleton height={300} width="100%" />}>
          <Routes>
            {renderRoutes(routeConfig)}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </AbilityProvider>
  );
};

export default AppRoutes;
