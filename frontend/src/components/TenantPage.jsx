// src/pages/TenantPage.jsx
import React, { useState, useEffect } from 'react';
import TenantList from '../components/TenantList';

const TenantPage = () => {
  const [tenants, setTenants] = useState(() => {
    const saved = localStorage.getItem('tenants');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('tenants', JSON.stringify(tenants));
  }, [tenants]);

  const addTenant = tenant => {
    setTenants(prev => [...prev, tenant]);
  };

  const removeTenant = posId => {
    setTenants(prev => prev.filter(t => t.posId !== posId));
  };

  return (
    <TenantList
      tenants={tenants}
      addTenant={addTenant}
      removeTenant={removeTenant}
    />
  );
};

export default TenantPage;
