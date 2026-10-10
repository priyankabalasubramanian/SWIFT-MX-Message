import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './MessageInquiry.css';
import { generateSwiftMxXml, highlightXml } from '../utils/xmlGenerator.js';
import { api } from '../services/api.js';

function MessageInquiry({ onNavigateToCreation, onSignOut, operatorId = 'OP-84920' }) {
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [apiError, setApiError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch messages from backend API
  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const data = await api.getMessages();
      setMessages(data || []);
    } catch (err) {
      setApiError(err.message || 'Unable to connect to the backend server. Please verify the Spring Boot service is running on port 8080.');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Handle server search
  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    setApiError('');
    try {
      const results = await api.searchMessages(searchQuery.trim());
      setMessages(results || []);
    } catch (err) {
      setApiError(`Search failed: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  // View Details handler: fetches full message entity including persisted XML
  const handleViewDetails = async (msg) => {
    const id = msg.messageId || msg.id;
    try {
      const detailed = await api.getMessageById(id);
      setSelectedMessage(detailed || msg);
    } catch (err) {
      setApiError(`Unable to fetch message details: ${err.message}`);
      setSelectedMessage(msg);
    }
  };

  // Compute XML for display
  const selectedXml = useMemo(() => {
    if (!selectedMessage) return null;
    if (selectedMessage.generatedXml) {
      return selectedMessage.generatedXml;
    }
    if (selectedMessage.hasXml === false) {
      return null;
    }
    return generateSwiftMxXml({
      messageType: selectedMessage.messageType,
      messageId: selectedMessage.messageId || selectedMessage.id,
      creationDate: selectedMessage.creationDate,
      currency: selectedMessage.currency,
      senderName: selectedMessage.senderName,
      senderBic: selectedMessage.senderBic,
      receiverName: selectedMessage.receiverName,
      receiverBic: selectedMessage.receiverBic,
      debtorName: selectedMessage.debtorName,
      debtorAccount: selectedMessage.debtorAccount,
      creditorName: selectedMessage.creditorName,
      creditorAccount: selectedMessage.creditorAccount,
      amount: selectedMessage.amount,
      remittanceInfo: selectedMessage.remittanceInfo
    });
  }, [selectedMessage]);

  // Copy XML handler
  const handleCopyXml = async () => {
    if (!selectedXml) return;
    try {
      await navigator.clipboard.writeText(selectedXml);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2200);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = selectedXml;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2200);
    }
  };

  // Helper for status badge styling
  const getStatusClass = (status) => {
    if (!status) return 'status-badge';
    const s = status.toLowerCase();
    if (s.includes('settled')) return 'status-badge settled';
    if (s.includes('processed')) return 'status-badge processed';
    if (s.includes('pending')) return 'status-badge pending';
    return 'status-badge archived';
  };

  return (
    <div className="inquiry-root">
      {/* Institutional Top Header */}
      <header className="inquiry-header">
        <div className="inquiry-header-content">
          <div className="inquiry-brand-block">
            <svg className="banking-logo-svg" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="28" height="28" rx="6" fill="#0B1D3D" stroke="#203A66" strokeWidth="1"/>
              <path d="M6 14L14 6L22 14L14 22Z" stroke="#C5A880" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M14 6V22M6 14H22" stroke="#627B9F" strokeWidth="1.2" strokeDasharray="1.5 1.5"/>
              <circle cx="14" cy="14" r="2.8" fill="#F7F3EC"/>
              <circle cx="6" cy="14" r="1.8" fill="#C5A880"/>
              <circle cx="22" cy="14" r="1.8" fill="#C5A880"/>
              <circle cx="14" cy="6" r="1.8" fill="#C5A880"/>
              <circle cx="14" cy="22" r="1.8" fill="#C5A880"/>
            </svg>
            <div className="inquiry-brand-text">
              <h1 className="inquiry-brand-title">SWIFT MX MESSAGE PORTAL</h1>
              <p className="inquiry-brand-subtitle">Secure Financial Messaging</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="inquiry-nav-tabs" aria-label="Portal Workspace Navigation">
            <button
              type="button"
              onClick={onNavigateToCreation}
              className="nav-tab-btn"
            >
              Create Message
            </button>
            <button
              type="button"
              className="nav-tab-btn active"
              aria-current="page"
            >
              Message Inquiry
            </button>
          </nav>

          <div className="inquiry-header-actions">
            <div className="operator-session-pill">
              <span className="operator-status-dot" aria-hidden="true"></span>
              <span className="operator-email-text">{operatorId.includes('@') ? operatorId : `${operatorId.toLowerCase()}@swift.bank`}</span>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="header-logout-btn"
              title="Return to Portal Login"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="inquiry-main">
        {apiError && (
          <div className="inquiry-error-banner" role="alert">
            <div className="inquiry-error-content">
              <span className="inquiry-error-badge">BACKEND SERVICE ALERT</span>
              <p className="inquiry-error-message">{apiError}</p>
            </div>
            <button
              type="button"
              onClick={loadMessages}
              className="btn-retry-connection"
              title="Attempt to reconnect to backend"
            >
              Retry Connection
            </button>
          </div>
        )}

        {!selectedMessage ? (
          /* List & Search View */
          <>
            {/* Page Intro Banner */}
            <div className="inquiry-intro-card">
              <div>
                <h2 className="page-title">Message Inquiry</h2>
              </div>
              <span className="demo-status-badge">
                {isLoading ? 'Connecting...' : `${messages.length} messages recorded`}
              </span>
            </div>

            {/* Search Controls */}
            <form onSubmit={handleSearchSubmit} className="search-controls-card">
              <div className="search-input-wrapper">
                <svg className="search-icon-svg" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Message ID, sender, receiver, or message type..."
                  className="search-input"
                  aria-label="Search SWIFT MX messages"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      loadMessages();
                    }}
                    className="search-clear-btn"
                    title="Clear search filter"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="submit"
                  className="btn-action-sm btn-action-download"
                  style={{ padding: '0.6rem 1.25rem' }}
                  disabled={isSearching}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
                <div className="search-results-counter">
                  Showing {messages.length} records
                </div>
              </div>
            </form>

            {/* Message Table */}
            <div className="table-card-container">
              {isLoading ? (
                <div className="inquiry-empty-state">
                  <h3 className="inquiry-empty-title">Loading Messages...</h3>
                  <p className="inquiry-empty-text">Retrieving ISO 20022 message records from MySQL repository.</p>
                </div>
              ) : messages.length > 0 ? (
                <div className="table-responsive-wrapper">
                  <table className="messages-table">
                    <thead>
                      <tr>
                        <th>Message ID</th>
                        <th>Message Type</th>
                        <th>Sender</th>
                        <th>Receiver</th>
                        <th>Amount</th>
                        <th>Currency</th>
                        <th>Creation Date</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.map((msg) => {
                        const msgId = msg.messageId || msg.id;
                        return (
                          <tr key={msgId}>
                            <td className="cell-msg-id">{msgId}</td>
                            <td>
                              <span className="cell-type-badge">{msg.messageType}</span>
                            </td>
                            <td>
                              <div className="cell-party">
                                <span className="party-name">{msg.senderName}</span>
                                <span className="party-bic">{msg.senderBic}</span>
                              </div>
                            </td>
                            <td>
                              <div className="cell-party">
                                <span className="party-name">{msg.receiverName}</span>
                                <span className="party-bic">{msg.receiverBic}</span>
                              </div>
                            </td>
                            <td className="cell-amount">
                              {parseFloat(msg.amount || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </td>
                            <td className="cell-currency">{msg.currency}</td>
                            <td className="cell-date">{msg.creationDate}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => handleViewDetails(msg)}
                                className="btn-view-details"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : apiError && messages.length === 0 ? (
                /* Service Unavailable State */
                <div className="inquiry-empty-state error-state">
                  <div className="inquiry-empty-icon">&#9888;</div>
                  <h3 className="inquiry-empty-title">Database Connection Unavailable</h3>
                  <p className="inquiry-empty-text">
                    {apiError}
                  </p>
                  <button
                    type="button"
                    onClick={loadMessages}
                    className="btn-reset-search"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : (
                /* Empty Database or Search Results */
                <div className="inquiry-empty-state">
                  <div className="inquiry-empty-icon">{searchQuery ? '🔍' : '📄'}</div>
                  <h3 className="inquiry-empty-title">
                    {searchQuery ? 'No Matching Messages Found' : 'No Messages Found in Database'}
                  </h3>
                  <p className="inquiry-empty-text">
                    {searchQuery
                      ? `No SWIFT MX messages match the filter "${searchQuery}". Try searching with another Message ID, BIC, or clear the search field.`
                      : 'The database currently contains no persisted messages. Navigate to Create Message to prepare and save your first SWIFT MX message.'}
                  </p>
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        loadMessages();
                      }}
                      className="btn-reset-search"
                    >
                      Reset Search Filter
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onNavigateToCreation}
                      className="btn-reset-search"
                    >
                      Create SWIFT MX Message
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          /* View Message Details Mode */
          <div className="details-view-container">
            {/* Top Return Bar */}
            <div className="details-top-bar">
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="btn-back-to-list"
              >
                &larr; Back to Message List
              </button>
              <span className={getStatusClass(selectedMessage.status || 'CREATED')}>
                Status: {selectedMessage.status || 'CREATED'}
              </span>
            </div>

            {/* Complete Message Details Card */}
            <div className="details-card">
              <div className="details-header-row">
                <div>
                  <h2 className="details-msg-title">{selectedMessage.messageId || selectedMessage.id}</h2>
                  <p className="details-msg-subtitle">
                    {selectedMessage.messageType} &bull; Created on {selectedMessage.creationDate}
                  </p>
                </div>
                <div className="cell-amount" style={{ fontSize: '1.25rem' }}>
                  {parseFloat(selectedMessage.amount || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}{' '}
                  <span className="cell-currency">{selectedMessage.currency}</span>
                </div>
              </div>

              {/* 3-Column Information Grid */}
              <div className="details-section-grid">
                {/* 1. Routing Institutions */}
                <div className="details-info-box">
                  <span className="box-title">Routing Institutions</span>
                  <div className="info-item">
                    <span className="info-label">Sender Name</span>
                    <span className="info-value">{selectedMessage.senderName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Sender BIC (Instructing)</span>
                    <span className="info-value-mono">{selectedMessage.senderBic}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Receiver Name</span>
                    <span className="info-value">{selectedMessage.receiverName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Receiver BIC (Instructed)</span>
                    <span className="info-value-mono">{selectedMessage.receiverBic}</span>
                  </div>
                </div>

                {/* 2. Counterparties & Settlement */}
                <div className="details-info-box">
                  <span className="box-title">Counterparties & Accounts</span>
                  <div className="info-item">
                    <span className="info-label">Debtor (Ordering Customer)</span>
                    <span className="info-value">{selectedMessage.debtorName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Debtor Account / IBAN</span>
                    <span className="info-value-mono">{selectedMessage.debtorAccount}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Creditor (Beneficiary)</span>
                    <span className="info-value">{selectedMessage.creditorName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Creditor Account / IBAN</span>
                    <span className="info-value-mono">{selectedMessage.creditorAccount}</span>
                  </div>
                </div>

                {/* 3. Transaction Metadata */}
                <div className="details-info-box">
                  <span className="box-title">Payment Narrative & Status</span>
                  <div className="info-item">
                    <span className="info-label">End-to-End Reference</span>
                    <span className="info-value-mono">{selectedMessage.messageId || selectedMessage.id}-E2E</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Remittance Information</span>
                    <span className="info-value">{selectedMessage.remittanceInfo}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Settlement Method</span>
                    <span className="info-value">CLRG (Clearing System)</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Database Record ID</span>
                    <span className="info-value">DB #{selectedMessage.id || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* XML Preview Section */}
              <div className="details-xml-wrapper">
                {selectedXml ? (
                  <div className="xml-preview-card">
                    <div className="xml-preview-header">
                      <div className="xml-title-group">
                        <h3 className="xml-title">ISO 20022 XML Message Payload</h3>
                        <span className="xml-type-badge">{selectedMessage.messageType}</span>
                      </div>
                      <div className="xml-preview-actions">
                        <button
                          type="button"
                          onClick={handleCopyXml}
                          className={`btn-action-sm btn-action-copy ${copySuccess ? 'is-copied' : ''}`}
                          title="Copy XML payload to clipboard"
                        >
                          {copySuccess ? '✓ Copied!' : 'Copy XML'}
                        </button>
                      </div>
                    </div>

                    <div className="xml-viewport-wrapper">
                      <pre className="xml-code-block">
                        <code
                          dangerouslySetInnerHTML={{
                            __html: highlightXml(selectedXml)
                          }}
                        />
                      </pre>
                    </div>
                  </div>
                ) : (
                  /* Clear message when XML is not available */
                  <div className="no-xml-alert" role="status">
                    <div className="no-xml-title">XML Payload Not Available</div>
                    <div className="no-xml-desc">
                      This statement record was registered as an unstructured summary without an associated ISO 20022 pacs XML payload, or the XML archive is currently pending reconciliation.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Institutional Portal Footer */}
      <footer className="inquiry-footer">
        SWIFT MX Message Portal &bull; ISO 20022 Financial Messaging Engine &bull; Task 7 Complete
      </footer>
    </div>
  );
}

export default MessageInquiry;
