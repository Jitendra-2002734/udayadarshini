import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { COM_PATH_PERMISSIONS,LOCAL_STORAGE_CONSTANTS } from '../configure/MyUtilsConfig';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname.slice(1); 

  const getAllowedPaths = () => {
    const info = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONSTANTS.USER_INFO));
    if (!info || !info.roleId) return [];
    return COM_PATH_PERMISSIONS[info.roleId] || [];
  };

  const allowedPaths = getAllowedPaths();

  if (allowedPaths.includes(currentPath)) {

    return children;
  } else {
    return <Navigate to="/error" replace />;
  }
};

export default ProtectedRoute;
