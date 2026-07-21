import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { apiClient } from '../api/axios';

export const OrganizationList = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError('');
      const url = statusFilter === 'all' 
        ? '/manager/organizations' 
        : `/manager/organizations?status=${statusFilter}`;
      
      const { data } = await apiClient.get(url);
      setOrganizations(data.organizations || []);
    } catch (err) {
      setError(err.message || 'Error fetching organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [statusFilter]);

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.facilityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (org.location?.city || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Healthcare Entities Directory
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Directory of Hospitals, Clinics, and Laboratories across verification statuses.
          </p>
        </div>

        <button onClick={fetchOrganizations} className="btn-secondary">
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="white-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px', width: '100%', fontSize: '0.85rem' }}
            placeholder="Search by name, facility type, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={14} color="var(--text-dim)" style={{ marginRight: '4px' }} />
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className="btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                textTransform: 'capitalize',
                background: statusFilter === status ? '#0284c7' : '#ffffff',
                borderColor: statusFilter === status ? '#0284c7' : 'var(--border-color)',
                color: statusFilter === status ? '#ffffff' : 'var(--text-muted)',
                fontWeight: statusFilter === status ? 700 : 500
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Organizations White Table */}
      {loading ? (
        <div className="white-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading healthcare organizations...
        </div>
      ) : filteredOrgs.length === 0 ? (
        <div className="white-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No organizations match your current search or filter.
        </div>
      ) : (
        <div className="white-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 20px' }}>Organization Name</th>
                <th style={{ padding: '14px 20px' }}>Facility Type</th>
                <th style={{ padding: '14px 20px' }}>City & State</th>
                <th style={{ padding: '14px 20px' }}>Certificate No</th>
                <th style={{ padding: '14px 20px' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrgs.map((org) => (
                <tr key={org._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-main)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Building2 size={18} color="#0284c7" />
                      <span>{org.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', textTransform: 'capitalize', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {org.facilityType}
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                    {org.location?.city || 'N/A'}, {org.location?.state || ''}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#ea580c', fontWeight: 700 }}>
                    {org.organizationCertificateNo}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {org.verificationStatus === 'approved' && (
                      <span className="badge badge-approved"><CheckCircle2 size={10} /> APPROVED</span>
                    )}
                    {(org.verificationStatus === 'pending' || org.verificationStatus === 'pending_approval') && (
                      <span className="badge badge-pending"><Clock size={10} /> PENDING</span>
                    )}
                    {org.verificationStatus === 'rejected' && (
                      <span className="badge badge-rejected"><XCircle size={10} /> REJECTED</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    {org.organizationCertificateUrl ? (
                      <a
                        href={org.organizationCertificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        <ExternalLink size={12} />
                        <span>Certificate</span>
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>No Link</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
