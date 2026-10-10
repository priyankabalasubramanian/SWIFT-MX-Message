import React, { useState, useRef } from 'react';
import './MessageCreation.css';
import { generateSwiftMxXml, highlightXml } from '../utils/xmlGenerator.js';
import { api } from '../services/api.js';

function MessageCreation({ onNavigateBack, onNavigateToInquiry, operatorId = 'OP-84920' }) {
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const formRef = useRef(null);
  const previewRef = useRef(null);

  const initialFormState = {
    messageType: 'pacs.008',
    messageId: '',
    creationDate: getTodayDate(),
    currency: 'USD',
    senderName: '',
    senderBic: '',
    receiverName: '',
    receiverBic: '',
    debtorName: '',
    debtorAccount: '',
    creditorName: '',
    creditorAccount: '',
    amount: '',
    remittanceInfo: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [generatedXml, setGeneratedXml] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Field change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name.endsWith('Bic') ? value.toUpperCase() : value
    }));

    // Clear error for the edited field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }

    if (serverError) setServerError('');
    if (successMessage) setSuccessMessage('');
  };

  // Form validation logic
  const validateForm = () => {
    const newErrors = {};

    // 1. Message Details Validation
    if (!formData.messageId.trim()) {
      newErrors.messageId = 'Message ID is required.';
    } else if (formData.messageId.trim().length < 4) {
      newErrors.messageId = 'Message ID must be at least 4 characters.';
    }

    if (!formData.creationDate) {
      newErrors.creationDate = 'Creation date is required.';
    }

    if (!formData.currency) {
      newErrors.currency = 'Please select a currency.';
    }

    // 2. Sender and Receiver Validation
    if (!formData.senderName.trim()) {
      newErrors.senderName = 'Sender institution name is required.';
    }

    if (!formData.senderBic.trim()) {
      newErrors.senderBic = 'Sender BIC is required.';
    } else if (!/^[A-Z0-9]{8}([A-Z0-9]{3})?$/.test(formData.senderBic.trim())) {
      newErrors.senderBic = 'BIC must be 8 or 11 alphanumeric characters.';
    }

    if (!formData.receiverName.trim()) {
      newErrors.receiverName = 'Receiver institution name is required.';
    }

    if (!formData.receiverBic.trim()) {
      newErrors.receiverBic = 'Receiver BIC is required.';
    } else if (!/^[A-Z0-9]{8}([A-Z0-9]{3})?$/.test(formData.receiverBic.trim())) {
      newErrors.receiverBic = 'BIC must be 8 or 11 alphanumeric characters.';
    }

    // 3. Payment Details Validation
    if (!formData.debtorName.trim()) {
      newErrors.debtorName = 'Debtor name is required.';
    }

    if (!formData.debtorAccount.trim()) {
      newErrors.debtorAccount = 'Debtor account or IBAN is required.';
    }

    if (!formData.creditorName.trim()) {
      newErrors.creditorName = 'Creditor name is required.';
    }

    if (!formData.creditorAccount.trim()) {
      newErrors.creditorAccount = 'Creditor account or IBAN is required.';
    }

    // Amount validation: must exist and be strictly greater than 0
    if (!formData.amount || String(formData.amount).trim() === '') {
      newErrors.amount = 'Payment amount is required.';
    } else {
      const numAmount = parseFloat(formData.amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Payment amount must be a valid number greater than 0.';
      }
    }

    if (!formData.remittanceInfo.trim()) {
      newErrors.remittanceInfo = 'Remittance information / payment reference is required.';
    }

    return newErrors;
  };

  // Clear Form handler
  const handleClearForm = () => {
    setFormData(initialFormState);
    setErrors({});
    setGeneratedXml(null);
    setCopySuccess(false);
    setServerError('');
    setSuccessMessage('');
  };

  // Preview Draft XML (client validation & preview without saving to database)
  const handlePreviewDraftXml = (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setGeneratedXml(null);
      const firstErrorKey = Object.keys(validationErrors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }

    setErrors({});
    const localXml = generateSwiftMxXml(formData);
    setGeneratedXml(localXml);
    setSuccessMessage('Draft ISO 20022 XML generated for verification. Click "Save to Database" to persist.');

    setTimeout(() => {
      if (previewRef.current) {
        previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Save to Database handler
  const handleSaveToDatabase = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setGeneratedXml(null);
      const firstErrorKey = Object.keys(validationErrors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const payload = {
      messageId: formData.messageId.trim(),
      messageType: formData.messageType.trim(),
      creationDate: formData.creationDate,
      currency: formData.currency.trim(),
      amount: parseFloat(formData.amount),
      senderName: formData.senderName.trim(),
      senderBic: formData.senderBic.trim().toUpperCase(),
      receiverName: formData.receiverName.trim(),
      receiverBic: formData.receiverBic.trim().toUpperCase(),
      debtorName: formData.debtorName.trim(),
      debtorAccount: formData.debtorAccount.trim(),
      creditorName: formData.creditorName.trim(),
      creditorAccount: formData.creditorAccount.trim(),
      remittanceInfo: formData.remittanceInfo.trim()
    };

    try {
      const savedMessage = await api.createMessage(payload);
      setGeneratedXml(savedMessage.generatedXml);
      setSuccessMessage(`Message ${savedMessage.messageId} verified and saved successfully to database.`);

      setTimeout(() => {
        if (previewRef.current) {
          previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      setGeneratedXml(null);
      setServerError(`Database Persistence Error: ${err.message}. Message was NOT saved.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy XML to clipboard
  const handleCopyXml = async () => {
    if (!generatedXml) return;
    try {
      await navigator.clipboard.writeText(generatedXml);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2200);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = generatedXml;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2200);
    }
  };

  // Download XML file
  const handleDownloadXml = () => {
    if (!generatedXml) return;
    const filename = `${formData.messageId.trim() || 'pacs.008'}_${formData.currency || 'USD'}.xml`;
    const blob = new Blob([generatedXml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Edit details (returns to form without resetting values)
  const handleEditDetails = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const msgIdInput = document.getElementById('messageId');
    if (msgIdInput) {
      msgIdInput.focus();
    }
  };

  return (
    <div className="creation-root">
      {/* Institutional Top Header */}
      <header className="creation-header">
        <div className="creation-header-content">
          <div className="creation-brand-block">
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
            <div className="creation-brand-text">
              <h1 className="creation-brand-title">SWIFT MX MESSAGE PORTAL</h1>
              <p className="creation-brand-subtitle">Secure Financial Messaging</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="creation-nav-tabs" aria-label="Portal Workspace Navigation">
            <button
              type="button"
              className="nav-tab-btn active"
              aria-current="page"
            >
              Create Message
            </button>
            <button
              type="button"
              onClick={onNavigateToInquiry}
              className="nav-tab-btn"
            >
              Message Inquiry
            </button>
          </nav>

          <div className="creation-header-actions">
            <div className="operator-session-pill">
              <span className="operator-status-dot" aria-hidden="true"></span>
              <span className="operator-email-text">{operatorId.includes('@') ? operatorId : `${operatorId.toLowerCase()}@swift.bank`}</span>
            </div>
            <button
              type="button"
              onClick={onNavigateBack}
              className="header-logout-btn"
              title="Return to Portal Login"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="creation-main">
        {/* Intro Banner */}
        <div className="page-intro-card" ref={formRef}>
          <div>
            <h2 className="page-title">Create SWIFT MX Message</h2>
          </div>
          <span className="message-standard-badge">ISO 20022 &bull; pacs.008</span>
        </div>

        {/* Server Success or Error Alerts */}
        {successMessage && (
          <div className="validation-success-banner" role="status" style={{ marginBottom: '1.5rem' }}>
            <span className="validation-success-text">
              &#10003; {successMessage}
            </span>
          </div>
        )}

        {serverError && (
          <div
            style={{
              backgroundColor: 'var(--color-error-bg)',
              border: '1px solid var(--color-error-border)',
              borderLeft: '4px solid var(--color-error-text)',
              color: 'var(--color-error-text)',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              marginBottom: '1.5rem',
              lineHeight: '1.5'
            }}
            role="alert"
          >
            <strong>System Notice:</strong> {serverError}
          </div>
        )}

        {/* Message Creation Form Card */}
        <div className="form-card">
          <form onSubmit={handleSaveToDatabase} noValidate>
            {/* Section 1: Message Details */}
            <section className="form-section">
              <div className="section-header">
                <span className="section-number">1</span>
                <h3 className="section-title">Message Details</h3>
                <span className="section-subtitle">Header & Classification</span>
              </div>

              <div className="grid-fields-4">
                {/* Message Type */}
                <div className="input-group">
                  <label htmlFor="messageType" className="field-label">
                    Message Type <span className="required-star">*</span>
                  </label>
                  <select
                    id="messageType"
                    name="messageType"
                    value={formData.messageType}
                    onChange={handleInputChange}
                    className="form-control select-control"
                    disabled={isSubmitting}
                  >
                    <option value="pacs.008">pacs.008 (Customer Credit Transfer)</option>
                    <option value="pacs.009">pacs.009 (Financial Institution Transfer)</option>
                    <option value="pacs.004">pacs.004 (Payment Return)</option>
                    <option value="camt.053">camt.053 (Bank-to-Customer Statement)</option>
                  </select>
                </div>

                {/* Message ID */}
                <div className="input-group">
                  <label htmlFor="messageId" className="field-label">
                    Message ID <span className="required-star">*</span>
                  </label>
                  <input
                    id="messageId"
                    type="text"
                    name="messageId"
                    value={formData.messageId}
                    onChange={handleInputChange}
                    placeholder="e.g. MSG-2026-00189"
                    className={`form-control form-control-mono ${errors.messageId ? 'has-error' : ''}`}
                    aria-invalid={errors.messageId ? 'true' : 'false'}
                    disabled={isSubmitting}
                  />
                  {errors.messageId && (
                    <span className="field-error-text" role="alert">{errors.messageId}</span>
                  )}
                </div>

                {/* Creation Date */}
                <div className="input-group">
                  <label htmlFor="creationDate" className="field-label">
                    Creation Date <span className="required-star">*</span>
                  </label>
                  <input
                    id="creationDate"
                    type="date"
                    name="creationDate"
                    value={formData.creationDate}
                    onChange={handleInputChange}
                    className={`form-control ${errors.creationDate ? 'has-error' : ''}`}
                    aria-invalid={errors.creationDate ? 'true' : 'false'}
                    disabled={isSubmitting}
                  />
                  {errors.creationDate && (
                    <span className="field-error-text" role="alert">{errors.creationDate}</span>
                  )}
                </div>

                {/* Currency */}
                <div className="input-group">
                  <label htmlFor="currency" className="field-label">
                    Currency <span className="required-star">*</span>
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className={`form-control select-control ${errors.currency ? 'has-error' : ''}`}
                    disabled={isSubmitting}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="CHF">CHF - Swiss Franc</option>
                    <option value="SGD">SGD - Singapore Dollar</option>
                  </select>
                  {errors.currency && (
                    <span className="field-error-text" role="alert">{errors.currency}</span>
                  )}
                </div>
              </div>
            </section>

            {/* Section 2: Sender and Receiver Details */}
            <section className="form-section" style={{ marginTop: '2rem' }}>
              <div className="section-header">
                <span className="section-number">2</span>
                <h3 className="section-title">Sender and Receiver Details</h3>
                <span className="section-subtitle">Routing Institutions</span>
              </div>

              <div className="grid-fields-2">
                {/* Sender Name */}
                <div className="input-group">
                  <label htmlFor="senderName" className="field-label">
                    Sender Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="senderName"
                    type="text"
                    name="senderName"
                    value={formData.senderName}
                    onChange={handleInputChange}
                    placeholder="e.g. Standard Commercial Bank New York"
                    className={`form-control ${errors.senderName ? 'has-error' : ''}`}
                    aria-invalid={errors.senderName ? 'true' : 'false'}
                    disabled={isSubmitting}
                  />
                  {errors.senderName && (
                    <span className="field-error-text" role="alert">{errors.senderName}</span>
                  )}
                </div>

                {/* Sender BIC */}
                <div className="input-group">
                  <label htmlFor="senderBic" className="field-label">
                    Sender BIC <span className="required-star">*</span>
                  </label>
                  <input
                    id="senderBic"
                    type="text"
                    name="senderBic"
                    value={formData.senderBic}
                    onChange={handleInputChange}
                    placeholder="e.g. SCBLUS33XXX (8 or 11 chars)"
                    maxLength={11}
                    className={`form-control form-control-mono ${errors.senderBic ? 'has-error' : ''}`}
                    aria-invalid={errors.senderBic ? 'true' : 'false'}
                    disabled={isSubmitting}
                  />
                  {errors.senderBic && (
                    <span className="field-error-text" role="alert">{errors.senderBic}</span>
                  )}
                </div>

                {/* Receiver Name */}
                <div className="input-group">
                  <label htmlFor="receiverName" className="field-label">
                    Receiver Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="receiverName"
                    type="text"
                    name="receiverName"
                    value={formData.receiverName}
                    onChange={handleInputChange}
                    placeholder="e.g. European Mercantile Bank Frankfurt"
                    className={`form-control ${errors.receiverName ? 'has-error' : ''}`}
                    aria-invalid={errors.receiverName ? 'true' : 'false'}
                    disabled={isSubmitting}
                  />
                  {errors.receiverName && (
                    <span className="field-error-text" role="alert">{errors.receiverName}</span>
                  )}
                </div>

                {/* Receiver BIC */}
                <div className="input-group">
                  <label htmlFor="receiverBic" className="field-label">
                    Receiver BIC <span className="required-star">*</span>
                  </label>
                  <input
                    id="receiverBic"
                    type="text"
                    name="receiverBic"
                    value={formData.receiverBic}
                    onChange={handleInputChange}
                    placeholder="e.g. EMBKDEFFXXX (8 or 11 chars)"
                    maxLength={11}
                    className={`form-control form-control-mono ${errors.receiverBic ? 'has-error' : ''}`}
                    aria-invalid={errors.receiverBic ? 'true' : 'false'}
                    disabled={isSubmitting}
                  />
                  {errors.receiverBic && (
                    <span className="field-error-text" role="alert">{errors.receiverBic}</span>
                  )}
                </div>
              </div>
            </section>

            {/* Section 3: Payment Details */}
            <section className="form-section" style={{ marginTop: '2rem' }}>
              <div className="section-header">
                <span className="section-number">3</span>
                <h3 className="section-title">Payment Details</h3>
                <span className="section-subtitle">Counterparties & Settlement</span>
              </div>

              <div className="grid-fields-2">
                {/* Debtor Name */}
                <div className="input-group">
                  <label htmlFor="debtorName" className="field-label">
                    Debtor Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="debtorName"
                    type="text"
                    name="debtorName"
                    value={formData.debtorName}
                    onChange={handleInputChange}
                    placeholder="e.g. Global Tech Solutions Corp"
                    className={`form-control ${errors.debtorName ? 'has-error' : ''}`}
                    aria-invalid={errors.debtorName ? 'true' : 'false'}
                    disabled={isSubmitting}
                  />
                  {errors.debtorName && (
                    <span className="field-error-text" role="alert">{errors.debtorName}</span>
                  )}
                </div>

                {/* Debtor Account / IBAN */}
                <div className="input-group">
                  <label htmlFor="debtorAccount" className="field-label">
                    Debtor Account / IBAN <span className="required-star">*</span>
                  </label>
                  <input
                    id="debtorAccount"
                    type="text"
                    name="debtorAccount"
                    value={formData.debtorAccount}
                    onChange={handleInputChange}
                    placeholder="e.g. US36SCBL12345678901234"
                    className={`form-control form-control-mono ${errors.debtorAccount ? 'has-error' : ''}`}
                    aria-invalid={errors.debtorAccount ? 'true' : 'false'}
                    disabled={isSubmitting}
                  />
                  {errors.debtorAccount && (
                    <span className="field-error-text" role="alert">{errors.debtorAccount}</span>
                  )}
                </div>

                {/* Creditor Name */}
                <div className="input-group">
                  <label htmlFor="creditorName" className="field-label">
                    Creditor Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="creditorName"
                    type="text"
                    name="creditorName"
                    value={formData.creditorName}
                    onChange={handleInputChange}
                    placeholder="e.g. Apex Industrial Supplies GmbH"
                    className={`form-control ${errors.creditorName ? 'has-error' : ''}`}
                    aria-invalid={errors.creditorName ? 'true' : 'false'}
                    disabled={isSubmitting}
                  />
                  {errors.creditorName && (
                    <span className="field-error-text" role="alert">{errors.creditorName}</span>
                  )}
                </div>

                {/* Creditor Account / IBAN */}
                <div className="input-group">
                  <label htmlFor="creditorAccount" className="field-label">
                    Creditor Account / IBAN <span className="required-star">*</span>
                  </label>
                  <input
                    id="creditorAccount"
                    type="text"
                    name="creditorAccount"
                    value={formData.creditorAccount}
                    onChange={handleInputChange}
                    placeholder="e.g. DE89370400440532013000"
                    className={`form-control form-control-mono ${errors.creditorAccount ? 'has-error' : ''}`}
                    aria-invalid={errors.creditorAccount ? 'true' : 'false'}
                    disabled={isSubmitting}
                  />
                  {errors.creditorAccount && (
                    <span className="field-error-text" role="alert">{errors.creditorAccount}</span>
                  )}
                </div>

                {/* Payment Amount */}
                <div className="input-group">
                  <label htmlFor="amount" className="field-label">
                    Payment Amount ({formData.currency}) <span className="required-star">*</span>
                  </label>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="e.g. 50000.00"
                    className={`form-control form-control-mono ${errors.amount ? 'has-error' : ''}`}
                    aria-invalid={errors.amount ? 'true' : 'false'}
                    disabled={isSubmitting}
                  />
                  {errors.amount && (
                    <span className="field-error-text" role="alert">{errors.amount}</span>
                  )}
                </div>

                {/* Remittance Information / Reference */}
                <div className="input-group">
                  <label htmlFor="remittanceInfo" className="field-label">
                    Remittance Information / Payment Reference <span className="required-star">*</span>
                  </label>
                  <input
                    id="remittanceInfo"
                    type="text"
                    name="remittanceInfo"
                    value={formData.remittanceInfo}
                    onChange={handleInputChange}
                    placeholder="e.g. INV-2026-9041 Commercial Settlement"
                    className={`form-control ${errors.remittanceInfo ? 'has-error' : ''}`}
                    aria-invalid={errors.remittanceInfo ? 'true' : 'false'}
                    disabled={isSubmitting}
                  />
                  {errors.remittanceInfo && (
                    <span className="field-error-text" role="alert">{errors.remittanceInfo}</span>
                  )}
                </div>
              </div>
            </section>

            {/* Action Buttons Row */}
            <div className="form-actions-row">
              <button
                type="button"
                onClick={handleClearForm}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Clear Form
              </button>
              <button
                type="button"
                onClick={handlePreviewDraftXml}
                className="btn-secondary"
                disabled={isSubmitting}
                title="Validate and preview ISO 20022 XML payload"
              >
                Preview Draft XML
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.75 : 1, cursor: isSubmitting ? 'wait' : 'pointer' }}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>

        {/* XML Preview Section */}
        <section className="xml-preview-section" ref={previewRef} id="xml-preview-section">
          {generatedXml ? (
            <div className="xml-preview-card" role="region" aria-label="Generated XML Preview">
              {/* Preview Header & Actions Toolbar */}
              <div className="xml-preview-header">
                <div className="xml-title-group">
                  <h3 className="xml-title">ISO 20022 XML Message Payload</h3>
                  <span className="xml-type-badge">{formData.messageType || 'pacs.008.001.08'}</span>
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
                  <button
                    type="button"
                    onClick={handleDownloadXml}
                    className="btn-action-sm btn-action-download"
                    title="Download message as .xml file"
                  >
                    Download XML
                  </button>
                  <button
                    type="button"
                    onClick={handleEditDetails}
                    className="btn-action-sm btn-action-edit"
                    title="Return to form inputs"
                  >
                    Edit Details
                  </button>
                </div>
              </div>

              {/* Regulatory Notice Banner */}
              <div className="xml-notice-bar">
                <span>
                  <strong>Server-Validated Notice:</strong> Well-formed ISO 20022 pacs.008 schema payload. Special characters escaped and saved to database. Not dispatched to live SWIFT network.
                </span>
              </div>

              {/* Syntax-Highlighted Code Viewport */}
              <div className="xml-viewport-wrapper">
                <pre className="xml-code-block">
                  <code
                    dangerouslySetInnerHTML={{
                      __html: highlightXml(generatedXml)
                    }}
                  />
                </pre>
              </div>
            </div>
          ) : (
            /* Empty State: XML Not Yet Generated */
            <div className="xml-empty-state-card">
              <div className="empty-state-icon">&lt;/&gt;</div>
              <h3 className="empty-state-title">XML Message Preview Pending</h3>
              <p className="empty-state-text">
                No XML payload has been generated yet. Complete the payment details above and click <strong>Save & Preview XML</strong> to validate and persist the formatted ISO 20022 message payload in MySQL.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Institutional Portal Footer */}
      <footer className="creation-footer">
        SWIFT MX Message Portal &bull; ISO 20022 Financial Messaging Engine &bull; Task 7 Complete
      </footer>
    </div>
  );
}

export default MessageCreation;
