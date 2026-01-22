import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants';

interface ProtectedMemberRouteProps {
  children: React.ReactNode;
}

const ProtectedMemberRoute: React.FC<ProtectedMemberRouteProps> = ({ children }) => {
  const { memberId } = useAuth();

  if (!memberId) {
    return <Navigate to={ROUTES.MEMBER_LOGIN} replace />;
  }

  return <>{children}</>;
};

export default ProtectedMemberRoute;
