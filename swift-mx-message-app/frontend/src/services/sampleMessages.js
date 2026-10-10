/**
 * Sample mock data repository for SWIFT MX Message Inquiry.
 *
 * NOTE: This is an isolated client-side mock repository for demonstration and UI testing.
 * It is structured to be replaced with backend API calls in subsequent tasks.
 * No persistent database connection is used.
 */

export const SAMPLE_MESSAGES = [
  {
    id: 'MSG-2026-00189',
    messageType: 'pacs.008',
    messageTypeName: 'Customer Credit Transfer',
    creationDate: '2026-10-10',
    currency: 'USD',
    amount: '50000.00',
    senderName: 'Standard Commercial Bank New York',
    senderBic: 'SCBLUS33XXX',
    receiverName: 'European Mercantile Bank Frankfurt',
    receiverBic: 'EMBKDEFFXXX',
    debtorName: 'Global Tech Solutions Corp',
    debtorAccount: 'US36SCBL12345678901234',
    creditorName: 'Apex Industrial Supplies GmbH',
    creditorAccount: 'DE89370400440532013000',
    remittanceInfo: 'INV-2026-9041 Commercial Settlement',
    status: 'Settled',
    hasXml: true
  },
  {
    id: 'MSG-2026-00190',
    messageType: 'pacs.008',
    messageTypeName: 'Customer Credit Transfer',
    creationDate: '2026-10-09',
    currency: 'EUR',
    amount: '125400.00',
    senderName: 'BNP Paribas Paris',
    senderBic: 'BNPAFR22XXX',
    receiverName: 'Deutsche Bank Frankfurt',
    receiverBic: 'DEUTDEFFXXX',
    debtorName: 'Lumiere Logistics SARL',
    debtorAccount: 'FR7630006000011234567890189',
    creditorName: 'Bavaria Motor Components AG',
    creditorAccount: 'DE12500700100123456789',
    remittanceInfo: 'PO-7882 Automotive Component Deliveries',
    status: 'Processed',
    hasXml: true
  },
  {
    id: 'MSG-2026-00191',
    messageType: 'pacs.009',
    messageTypeName: 'Financial Institution Transfer',
    creationDate: '2026-10-08',
    currency: 'GBP',
    amount: '850000.00',
    senderName: 'Barclays Bank London',
    senderBic: 'BARCGB22XXX',
    receiverName: 'JPMorgan Chase New York',
    receiverBic: 'CHASUS33XXX',
    debtorName: 'Barclays Treasury Desk London',
    debtorAccount: 'GB29BARC20000098765432',
    creditorName: 'JPMorgan Liquidity Operations',
    creditorAccount: 'US99CHAS98765432100012',
    remittanceInfo: 'Interbank Overnight Liquidity Rebalancing',
    status: 'Settled',
    hasXml: true
  },
  {
    id: 'MSG-2026-00192',
    messageType: 'pacs.008',
    messageTypeName: 'Customer Credit Transfer',
    creationDate: '2026-10-07',
    currency: 'INR',
    amount: '4500000.00',
    senderName: 'State Bank of India Mumbai',
    senderBic: 'SBININBBXXX',
    receiverName: 'Standard Chartered Singapore',
    receiverBic: 'SCBLSG22XXX',
    debtorName: 'Hindustan Global Exports Ltd',
    debtorAccount: 'IN02SBIN00012345678901',
    creditorName: 'Pacific Maritime Logistics Pte',
    creditorAccount: 'SG44SCBL000987654321',
    remittanceInfo: 'Export Bill Settlement LC-2026-091',
    status: 'Pending Verification',
    hasXml: true
  },
  {
    id: 'MSG-2026-00193',
    messageType: 'camt.053',
    messageTypeName: 'Bank-to-Customer Statement',
    creationDate: '2026-10-06',
    currency: 'EUR',
    amount: '0.00',
    senderName: 'Nordea Bank Stockholm',
    senderBic: 'NDEASEMMXXX',
    receiverName: 'European Central Clearing',
    receiverBic: 'ECCCDEFFXXX',
    debtorName: 'Nordea Custody Operations',
    debtorAccount: 'SE55NDEA12345678901234',
    creditorName: 'European Central Clearing',
    creditorAccount: 'DE00ECCC999988887777',
    remittanceInfo: 'Daily End-of-Day Reconciliation Statement',
    status: 'Archived',
    hasXml: false // Specifically provided to test message with no XML payload
  }
];
