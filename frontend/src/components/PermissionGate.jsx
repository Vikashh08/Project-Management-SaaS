import React from 'react';
import { useAuth } from '../context/AuthContext';

const PermissionGate = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user) return null;

  if (allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  return null;
};

export default PermissionGate;
