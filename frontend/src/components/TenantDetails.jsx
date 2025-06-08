import React from 'react';
import Cashbook from '../components/Cashbook'; // Ensure correct path

const Reconciliation = ({ tenantId }) => {
    return (
        <div>
            <h2>Reconciliation for Tenant {tenantId}</h2>
            {/* Render the CashBook component */}
            <Cashbook tenantId={tenantId} />
        </div>
    );
};

export default Reconciliation;
