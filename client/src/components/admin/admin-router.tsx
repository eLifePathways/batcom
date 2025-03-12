import React, { useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';

// This component handles direct hits to admin URLs
export default function AdminRouter() {
  const [location, navigate] = useLocation();
  const [isAdminRoute] = useRoute('/admin/*');
  const [isExactAdminRoute] = useRoute('/admin');
  
  useEffect(() => {
    if (isAdminRoute || isExactAdminRoute) {
      console.log('Admin router handling admin route:', location);
      
      // We only want to match the admin routes pattern and apply the correct layout
      // The Router component will handle the actual navigation
    }
  }, [isAdminRoute, isExactAdminRoute, location]);
  
  return null;
}