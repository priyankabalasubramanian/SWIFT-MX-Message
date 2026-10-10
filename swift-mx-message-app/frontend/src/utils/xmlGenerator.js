/**
 * Utility for generating ISO 20022 SWIFT MX formatted XML payloads.
 * Includes character escaping, structure indentation, multi-message schemas,
 * live schema validation, and syntax highlighting.
 *
 * Supported ISO 20022 Schemas:
 * - pacs.008.001.08: Financial Institution to Customer Credit Transfer
 * - pacs.009.001.08: Financial Institution Credit Transfer (Interbank)
 * - pacs.004.001.09: Payment Return / Settlement Reversal
 * - camt.053.001.08: Bank-to-Customer Account Statement
 *
 * NOTE: This generated XML follows standard ISO 20022 schemas
 * for demonstration and assessment purposes. It does not initiate live financial clearing.
 */

/**
 * Escapes XML special characters in string values to prevent injection and malformed XML.
 * @param {string|number|null|undefined} value
 * @returns {string}
 */
export function escapeXml(value) {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Checks if an account looks like an IBAN (starts with 2 letters followed by 2 digits)
 * @param {string} acc
 * @returns {boolean}
 */
export function isPotentialIban(acc) {
  if (!acc) return false;
  const clean = acc.replace(/\s+/g, '').toUpperCase();
  return /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$/.test(clean);
}

/**
 * Formats a decimal number string to 2 decimal places.
 * @param {string|number} amount
 * @returns {string}
 */
export function formatAmount(amount) {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
}

/**
 * Generates an ISO 20022 pacs.008.001.08 Customer Credit Transfer XML document.
 * @param {Object} data
 * @returns {string}
 */
export function generatePacs008Xml(data) {
  const {
    messageType = 'pacs.008',
    messageId = '',
    creationDate = '',
    currency = 'USD',
    senderName = '',
    senderBic = '',
    receiverName = '',
    receiverBic = '',
    debtorName = '',
    debtorAccount = '',
    creditorName = '',
    creditorAccount = '',
    amount = '',
    remittanceInfo = ''
  } = data;

  const creDtTm = creationDate 
    ? `${creationDate}T12:00:00Z` 
    : new Date().toISOString().split('.')[0] + 'Z';
  const cleanDbtrAcc = (debtorAccount || '').trim();
  const cleanCdtrAcc = (creditorAccount || '').trim();
  const cleanSenderBic = (senderBic || '').trim().toUpperCase();
  const cleanReceiverBic = (receiverBic || '').trim().toUpperCase();
  const formattedAmt = formatAmount(amount);

  const debtorAccXml = isPotentialIban(cleanDbtrAcc)
    ? `            <IBAN>${escapeXml(cleanDbtrAcc.replace(/\s+/g, ''))}</IBAN>`
    : `            <Othr>\n              <Id>${escapeXml(cleanDbtrAcc)}</Id>\n            </Othr>`;

  const creditorAccXml = isPotentialIban(cleanCdtrAcc)
    ? `            <IBAN>${escapeXml(cleanCdtrAcc.replace(/\s+/g, ''))}</IBAN>`
    : `            <Othr>\n              <Id>${escapeXml(cleanCdtrAcc)}</Id>\n            </Othr>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<!--
  SWIFT MX Message Payload (ISO 20022 Demonstration)
  Type: ${escapeXml(messageType)} - Financial Institution to Customer Credit Transfer
  Notice: Prepared in simulated sandbox environment. Not dispatched to live SWIFT Alliance network.
-->
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>${escapeXml(messageId)}</MsgId>
      <CreDtTm>${escapeXml(creDtTm)}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
      </SttlmInf>
      <InstgAgt>
        <FinInstnId>
          <BICFI>${escapeXml(cleanSenderBic)}</BICFI>
          <Nm>${escapeXml(senderName)}</Nm>
        </FinInstnId>
      </InstgAgt>
      <InstdAgt>
        <FinInstnId>
          <BICFI>${escapeXml(cleanReceiverBic)}</BICFI>
          <Nm>${escapeXml(receiverName)}</Nm>
        </FinInstnId>
      </InstdAgt>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>${escapeXml(messageId)}-E2E</EndToEndId>
        <TxId>${escapeXml(messageId)}-TX01</TxId>
      </PmtId>
      <IntrBkSttlmAmt Ccy="${escapeXml(currency)}">${formattedAmt}</IntrBkSttlmAmt>
      <IntrBkSttlmDt>${escapeXml(creationDate)}</IntrBkSttlmDt>
      <Dbtr>
        <Nm>${escapeXml(debtorName)}</Nm>
      </Dbtr>
      <DbtrAcct>
        <Id>
${debtorAccXml}
        </Id>
      </DbtrAcct>
      <DbtrAgt>
        <FinInstnId>
          <BICFI>${escapeXml(cleanSenderBic)}</BICFI>
        </FinInstnId>
      </DbtrAgt>
      <CdtrAgt>
        <FinInstnId>
          <BICFI>${escapeXml(cleanReceiverBic)}</BICFI>
        </FinInstnId>
      </CdtrAgt>
      <Cdtr>
        <Nm>${escapeXml(creditorName)}</Nm>
      </Cdtr>
      <CdtrAcct>
        <Id>
${creditorAccXml}
        </Id>
      </CdtrAcct>
      <RmtInf>
        <Ustrd>${escapeXml(remittanceInfo)}</Ustrd>
      </RmtInf>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`;
}

/**
 * Generates an ISO 20022 pacs.009.001.08 Financial Institution Credit Transfer XML document.
 * @param {Object} data
 * @returns {string}
 */
export function generatePacs009Xml(data) {
  const {
    messageType = 'pacs.009',
    messageId = '',
    creationDate = '',
    currency = 'USD',
    senderName = '',
    senderBic = '',
    receiverName = '',
    receiverBic = '',
    debtorName = '',
    debtorAccount = '',
    creditorName = '',
    creditorAccount = '',
    amount = '',
    remittanceInfo = ''
  } = data;

  const creDtTm = creationDate 
    ? `${creationDate}T12:00:00Z` 
    : new Date().toISOString().split('.')[0] + 'Z';
  const cleanDbtrAcc = (debtorAccount || '').trim();
  const cleanCdtrAcc = (creditorAccount || '').trim();
  const cleanSenderBic = (senderBic || '').trim().toUpperCase();
  const cleanReceiverBic = (receiverBic || '').trim().toUpperCase();
  const formattedAmt = formatAmount(amount);

  const debtorAccXml = isPotentialIban(cleanDbtrAcc)
    ? `            <IBAN>${escapeXml(cleanDbtrAcc.replace(/\s+/g, ''))}</IBAN>`
    : `            <Othr>\n              <Id>${escapeXml(cleanDbtrAcc)}</Id>\n            </Othr>`;

  const creditorAccXml = isPotentialIban(cleanCdtrAcc)
    ? `            <IBAN>${escapeXml(cleanCdtrAcc.replace(/\s+/g, ''))}</IBAN>`
    : `            <Othr>\n              <Id>${escapeXml(cleanCdtrAcc)}</Id>\n            </Othr>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<!--
  SWIFT MX Message Payload (ISO 20022 Demonstration)
  Type: ${escapeXml(messageType)} - Financial Institution Credit Transfer (Interbank)
  Notice: Prepared in simulated sandbox environment. Not dispatched to live SWIFT Alliance network.
-->
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.009.001.08" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <FICdtTrf>
    <GrpHdr>
      <MsgId>${escapeXml(messageId)}</MsgId>
      <CreDtTm>${escapeXml(creDtTm)}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
      </SttlmInf>
      <InstgAgt>
        <FinInstnId>
          <BICFI>${escapeXml(cleanSenderBic)}</BICFI>
          <Nm>${escapeXml(senderName)}</Nm>
        </FinInstnId>
      </InstgAgt>
      <InstdAgt>
        <FinInstnId>
          <BICFI>${escapeXml(cleanReceiverBic)}</BICFI>
          <Nm>${escapeXml(receiverName)}</Nm>
        </FinInstnId>
      </InstdAgt>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>${escapeXml(messageId)}-E2E</EndToEndId>
        <TxId>${escapeXml(messageId)}-TX01</TxId>
      </PmtId>
      <IntrBkSttlmAmt Ccy="${escapeXml(currency)}">${formattedAmt}</IntrBkSttlmAmt>
      <IntrBkSttlmDt>${escapeXml(creationDate)}</IntrBkSttlmDt>
      <Dbtr>
        <FinInstnId>
          <BICFI>${escapeXml(cleanSenderBic)}</BICFI>
          <Nm>${escapeXml(debtorName || senderName)}</Nm>
        </FinInstnId>
      </Dbtr>
      <DbtrAcct>
        <Id>
${debtorAccXml}
        </Id>
      </DbtrAcct>
      <CdtrAgt>
        <FinInstnId>
          <BICFI>${escapeXml(cleanReceiverBic)}</BICFI>
        </FinInstnId>
      </CdtrAgt>
      <Cdtr>
        <FinInstnId>
          <BICFI>${escapeXml(cleanReceiverBic)}</BICFI>
          <Nm>${escapeXml(creditorName || receiverName)}</Nm>
        </FinInstnId>
      </Cdtr>
      <CdtrAcct>
        <Id>
${creditorAccXml}
        </Id>
      </CdtrAcct>
      <RmtInf>
        <Ustrd>${escapeXml(remittanceInfo || 'Interbank Treasury Settlement')}</Ustrd>
      </RmtInf>
    </CdtTrfTxInf>
  </FICdtTrf>
</Document>`;
}

/**
 * Generates an ISO 20022 pacs.004.001.09 Payment Return XML document.
 * @param {Object} data
 * @returns {string}
 */
export function generatePacs004Xml(data) {
  const {
    messageType = 'pacs.004',
    messageId = '',
    creationDate = '',
    currency = 'USD',
    senderName = '',
    senderBic = '',
    receiverName = '',
    receiverBic = '',
    debtorName = '',
    debtorAccount = '',
    creditorName = '',
    creditorAccount = '',
    amount = '',
    remittanceInfo = ''
  } = data;

  const creDtTm = creationDate 
    ? `${creationDate}T12:00:00Z` 
    : new Date().toISOString().split('.')[0] + 'Z';
  const cleanDbtrAcc = (debtorAccount || '').trim();
  const cleanCdtrAcc = (creditorAccount || '').trim();
  const cleanSenderBic = (senderBic || '').trim().toUpperCase();
  const cleanReceiverBic = (receiverBic || '').trim().toUpperCase();
  const formattedAmt = formatAmount(amount);

  const debtorAccXml = isPotentialIban(cleanDbtrAcc)
    ? `              <IBAN>${escapeXml(cleanDbtrAcc.replace(/\s+/g, ''))}</IBAN>`
    : `              <Othr>\n                <Id>${escapeXml(cleanDbtrAcc)}</Id>\n              </Othr>`;

  const creditorAccXml = isPotentialIban(cleanCdtrAcc)
    ? `              <IBAN>${escapeXml(cleanCdtrAcc.replace(/\s+/g, ''))}</IBAN>`
    : `              <Othr>\n                <Id>${escapeXml(cleanCdtrAcc)}</Id>\n              </Othr>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<!--
  SWIFT MX Message Payload (ISO 20022 Demonstration)
  Type: ${escapeXml(messageType)} - Payment Return / Settlement Reversal
  Notice: Prepared in simulated sandbox environment. Not dispatched to live SWIFT Alliance network.
-->
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.004.001.09" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <PmtRtr>
    <GrpHdr>
      <MsgId>${escapeXml(messageId)}</MsgId>
      <CreDtTm>${escapeXml(creDtTm)}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
      </SttlmInf>
      <InstgAgt>
        <FinInstnId>
          <BICFI>${escapeXml(cleanSenderBic)}</BICFI>
          <Nm>${escapeXml(senderName)}</Nm>
        </FinInstnId>
      </InstgAgt>
      <InstdAgt>
        <FinInstnId>
          <BICFI>${escapeXml(cleanReceiverBic)}</BICFI>
          <Nm>${escapeXml(receiverName)}</Nm>
        </FinInstnId>
      </InstdAgt>
    </GrpHdr>
    <TxInf>
      <RtrId>${escapeXml(messageId)}-RTR01</RtrId>
      <OrgnlEndToEndId>${escapeXml(messageId)}-E2E</OrgnlEndToEndId>
      <OrgnlTxId>${escapeXml(messageId)}-TX01</OrgnlTxId>
      <RtrdIntrBkSttlmAmt Ccy="${escapeXml(currency)}">${formattedAmt}</RtrdIntrBkSttlmAmt>
      <IntrBkSttlmDt>${escapeXml(creationDate)}</IntrBkSttlmDt>
      <RtrRsnInf>
        <Rsn>
          <Cd>AC04</Cd>
        </Rsn>
        <AddtlInf>${escapeXml(remittanceInfo || 'Payment return: Account Closed or Beneficiary Request')}</AddtlInf>
      </RtrRsnInf>
      <OrgnlTxRef>
        <IntrBkSttlmAmt Ccy="${escapeXml(currency)}">${formattedAmt}</IntrBkSttlmAmt>
        <Dbtr>
          <Nm>${escapeXml(debtorName)}</Nm>
        </Dbtr>
        <DbtrAcct>
          <Id>
${debtorAccXml}
          </Id>
        </DbtrAcct>
        <Cdtr>
          <Nm>${escapeXml(creditorName)}</Nm>
        </Cdtr>
        <CdtrAcct>
          <Id>
${creditorAccXml}
          </Id>
        </CdtrAcct>
      </OrgnlTxRef>
    </TxInf>
  </PmtRtr>
</Document>`;
}

/**
 * Generates an ISO 20022 camt.053.001.08 Bank-to-Customer Account Statement XML document.
 * @param {Object} data
 * @returns {string}
 */
export function generateCamt053Xml(data) {
  const {
    messageType = 'camt.053',
    messageId = '',
    creationDate = '',
    currency = 'USD',
    senderName = '',
    senderBic = '',
    receiverName = '',
    receiverBic = '',
    debtorName = '',
    debtorAccount = '',
    creditorName = '',
    creditorAccount = '',
    amount = '',
    remittanceInfo = ''
  } = data;

  const creDtTm = creationDate 
    ? `${creationDate}T12:00:00Z` 
    : new Date().toISOString().split('.')[0] + 'Z';
  const cleanDbtrAcc = (debtorAccount || '').trim();
  const cleanSenderBic = (senderBic || '').trim().toUpperCase();
  const cleanReceiverBic = (receiverBic || '').trim().toUpperCase();
  const formattedAmt = formatAmount(amount);

  const accountIdXml = isPotentialIban(cleanDbtrAcc)
    ? `          <IBAN>${escapeXml(cleanDbtrAcc.replace(/\s+/g, ''))}</IBAN>`
    : `          <Othr>\n            <Id>${escapeXml(cleanDbtrAcc)}</Id>\n          </Othr>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<!--
  SWIFT MX Message Payload (ISO 20022 Demonstration)
  Type: ${escapeXml(messageType)} - Bank-to-Customer Account Statement
  Notice: Prepared in simulated sandbox environment. Not dispatched to live SWIFT Alliance network.
-->
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.08" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <BkToCstmrStmt>
    <GrpHdr>
      <MsgId>${escapeXml(messageId)}</MsgId>
      <CreDtTm>${escapeXml(creDtTm)}</CreDtTm>
      <MsgRcpt>
        <Id>
          <OrgId>
            <AnyBIC>${escapeXml(cleanReceiverBic)}</AnyBIC>
          </OrgId>
        </Id>
      </MsgRcpt>
    </GrpHdr>
    <Stmt>
      <Id>${escapeXml(messageId)}-STMT01</Id>
      <ElctrncSeqNb>1</ElctrncSeqNb>
      <CreDtTm>${escapeXml(creDtTm)}</CreDtTm>
      <Acct>
        <Id>
${accountIdXml}
        </Id>
        <Ccy>${escapeXml(currency)}</Ccy>
        <Svcr>
          <FinInstnId>
            <BICFI>${escapeXml(cleanSenderBic)}</BICFI>
            <Nm>${escapeXml(senderName)}</Nm>
          </FinInstnId>
        </Svcr>
      </Acct>
      <Bal>
        <Tp>
          <CdOrPrtry>
            <Cd>OPBD</Cd>
          </CdOrPrtry>
        </Tp>
        <Amt Ccy="${escapeXml(currency)}">${formattedAmt}</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt>
          <Dt>${escapeXml(creationDate)}</Dt>
        </Dt>
      </Bal>
      <Bal>
        <Tp>
          <CdOrPrtry>
            <Cd>CLBD</Cd>
          </CdOrPrtry>
        </Tp>
        <Amt Ccy="${escapeXml(currency)}">${formattedAmt}</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Dt>
          <Dt>${escapeXml(creationDate)}</Dt>
        </Dt>
      </Bal>
      <Ntry>
        <Amt Ccy="${escapeXml(currency)}">${formattedAmt}</Amt>
        <CdtDbtInd>CRDT</CdtDbtInd>
        <Sts>BOOK</Sts>
        <BookgDt>
          <Dt>${escapeXml(creationDate)}</Dt>
        </BookgDt>
        <ValDt>
          <Dt>${escapeXml(creationDate)}</Dt>
        </ValDt>
        <AcctSvcrRef>${escapeXml(messageId)}-TX01</AcctSvcrRef>
        <NtryDtls>
          <TxDtls>
            <Refs>
              <EndToEndId>${escapeXml(messageId)}-E2E</EndToEndId>
            </Refs>
            <Amt Ccy="${escapeXml(currency)}">${formattedAmt}</Amt>
            <RltdPties>
              <Dbtr>
                <Nm>${escapeXml(debtorName)}</Nm>
              </Dbtr>
              <Cdtr>
                <Nm>${escapeXml(creditorName)}</Nm>
              </Cdtr>
            </RltdPties>
            <RmtInf>
              <Ustrd>${escapeXml(remittanceInfo || 'Commercial Settlement Statement Entry')}</Ustrd>
            </RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>
    </Stmt>
  </BkToCstmrStmt>
</Document>`;
}

/**
 * Generates the appropriate ISO 20022 XML document depending on the messageType field.
 * @param {Object} data - Form data containing payment fields.
 * @returns {string} Formatted XML string.
 */
export function generateSwiftMxXml(data) {
  const type = (data?.messageType || 'pacs.008').toLowerCase();
  if (type.includes('pacs.009')) {
    return generatePacs009Xml(data);
  } else if (type.includes('pacs.004')) {
    return generatePacs004Xml(data);
  } else if (type.includes('camt.053')) {
    return generateCamt053Xml(data);
  } else {
    return generatePacs008Xml(data);
  }
}

/**
 * Validates an ISO 20022 XML string for well-formedness, root document schema compliance,
 * and key required fields.
 * @param {string} rawXml
 * @returns {{ isValid: boolean, schemaType: string, errors: string[], warnings: string[] }}
 */
export function validateIso20022Xml(rawXml) {
  const result = {
    isValid: true,
    schemaType: 'Unknown',
    errors: [],
    warnings: []
  };

  if (!rawXml || typeof rawXml !== 'string' || !rawXml.trim()) {
    result.isValid = false;
    result.errors.push('Empty or undefined XML payload.');
    return result;
  }

  // Check XML Well-formedness via DOMParser if in browser environment
  if (typeof DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawXml, 'application/xml');
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        result.isValid = false;
        result.errors.push(`XML Syntax Error: ${parserError.textContent.slice(0, 160)}`);
        return result;
      }

      // Check root tag
      const root = doc.documentElement;
      if (root.tagName !== 'Document') {
        result.isValid = false;
        result.errors.push(`Root tag must be <Document>, found <${root.tagName}>.`);
      }

      // Detect schema namespace
      const ns = root.getAttribute('xmlns') || '';
      if (ns.includes('pacs.008')) {
        result.schemaType = 'pacs.008.001.08 (Customer Credit Transfer)';
      } else if (ns.includes('pacs.009')) {
        result.schemaType = 'pacs.009.001.08 (Financial Institution Credit Transfer)';
      } else if (ns.includes('pacs.004')) {
        result.schemaType = 'pacs.004.001.09 (Payment Return)';
      } else if (ns.includes('camt.053')) {
        result.schemaType = 'camt.053.001.08 (Bank-to-Customer Statement)';
      } else {
        result.warnings.push(`Unrecognized or non-standard ISO 20022 namespace: ${ns}`);
      }

      // Check GrpHdr and MsgId
      const msgIdEl = doc.querySelector('MsgId');
      if (!msgIdEl || !msgIdEl.textContent.trim()) {
        result.errors.push('Mandatory element <MsgId> missing or empty.');
      }

      const creDtTmEl = doc.querySelector('CreDtTm');
      if (!creDtTmEl || !creDtTmEl.textContent.trim()) {
        result.warnings.push('Element <CreDtTm> missing or empty.');
      }
    } catch (e) {
      result.isValid = false;
      result.errors.push(`XML Parsing exception: ${e.message}`);
    }
  } else {
    // Regex-based basic check for non-browser environments
    if (!rawXml.includes('<Document') || !rawXml.includes('</Document>')) {
      result.isValid = false;
      result.errors.push('Missing <Document> root element.');
    }
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Applies subtle HTML syntax styling to XML text for read-only preview.
 * Escapes characters first so it is completely safe for rendering.
 * @param {string} rawXml
 * @returns {string} HTML string with syntax highlight spans.
 */
export function highlightXml(rawXml) {
  if (!rawXml) return '';

  // 1. First escape basic entities for safe HTML output
  const safe = rawXml
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Wrap comments: &lt;!-- ... --&gt;
  let formatted = safe.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="xml-comment">$1</span>');

  // 3. Highlight XML declaration: &lt;\?xml ... \?&gt;
  formatted = formatted.replace(/(&lt;\?xml[\s\S]*?\?&gt;)/g, '<span class="xml-decl">$1</span>');

  // 4. Highlight tags and attributes: &lt;(/?)(\w+)(.*?)&gt;
  formatted = formatted.replace(
    /&lt;(\/?)([\w:.]+)([\s\S]*?)&gt;/g,
    (match, slash, tagName, attrs) => {
      // Highlight attributes inside the tag
      const highlightedAttrs = attrs.replace(
        /([\w:.-]+)=(&quot;.*?&quot;|&apos;.*?&apos;)/g,
        '<span class="xml-attr-name">$1</span>=<span class="xml-attr-val">$2</span>'
      );
      return `&lt;<span class="xml-tag-bracket">${slash}</span><span class="xml-tag-name">${tagName}</span>${highlightedAttrs}&gt;`;
    }
  );

  return formatted;
}
