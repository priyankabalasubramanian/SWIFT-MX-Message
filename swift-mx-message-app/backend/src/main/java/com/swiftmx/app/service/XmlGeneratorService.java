package com.swiftmx.app.service;

import com.swiftmx.app.dto.MessageCreateRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.regex.Pattern;

/**
 * Service for generating ISO 20022 XML documents on the backend.
 * Sanitizes input entities and enforces server-side XML validity.
 *
 * Supported ISO 20022 Schemas:
 * - pacs.008.001.08: Financial Institution to Customer Credit Transfer
 * - pacs.009.001.08: Financial Institution Credit Transfer (Interbank)
 * - pacs.004.001.09: Payment Return / Settlement Reversal
 * - camt.053.001.08: Bank-to-Customer Account Statement
 *
 * NOTE: Generated XML is formatted according to standard ISO 20022 schemas
 * for demonstration and evaluation. It is not connected to a live SWIFT clearing network.
 */
@Service
public class XmlGeneratorService {

    private static final Pattern IBAN_PATTERN = Pattern.compile("^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$");

    /**
     * Escapes XML special characters in user inputs to prevent injection and XML malformation.
     */
    public String escapeXml(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&apos;");
    }

    public boolean isIban(String account) {
        if (account == null) return false;
        String clean = account.replaceAll("\\s+", "").toUpperCase();
        return IBAN_PATTERN.matcher(clean).matches();
    }

    /**
     * Delegates XML generation to the appropriate schema generator based on messageType.
     */
    public String generateXml(MessageCreateRequest req) {
        String type = req.getMessageType() != null ? req.getMessageType().trim().toLowerCase() : "pacs.008";
        if (type.contains("pacs.009")) {
            return generatePacs009Xml(req);
        } else if (type.contains("pacs.004")) {
            return generatePacs004Xml(req);
        } else if (type.contains("camt.053")) {
            return generateCamt053Xml(req);
        } else {
            return generatePacs008Xml(req);
        }
    }

    /**
     * Generates a well-formed ISO 20022 pacs.008.001.08 customer credit transfer payload.
     */
    public String generatePacs008Xml(MessageCreateRequest req) {
        String msgId = escapeXml(req.getMessageId().trim());
        String msgType = escapeXml(req.getMessageType().trim());
        LocalDate date = req.getCreationDate() != null ? req.getCreationDate() : LocalDate.now();
        String creationDt = date.format(DateTimeFormatter.ISO_LOCAL_DATE);
        String creDtTm = creationDt + "T12:00:00Z";
        String currency = escapeXml(req.getCurrency().trim().toUpperCase());
        BigDecimal amt = req.getAmount() != null ? req.getAmount() : BigDecimal.ZERO;
        String formattedAmt = amt.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString();

        String senderBic = escapeXml(req.getSenderBic().trim().toUpperCase());
        String senderName = escapeXml(req.getSenderName().trim());
        String receiverBic = escapeXml(req.getReceiverBic().trim().toUpperCase());
        String receiverName = escapeXml(req.getReceiverName().trim());

        String debtorName = escapeXml(req.getDebtorName().trim());
        String debtorAcc = req.getDebtorAccount().trim();
        String creditorName = escapeXml(req.getCreditorName().trim());
        String creditorAcc = req.getCreditorAccount().trim();
        String remittance = escapeXml(req.getRemittanceInfo().trim());

        String debtorAccXml = isIban(debtorAcc)
            ? "            <IBAN>" + escapeXml(debtorAcc.replaceAll("\\s+", "")) + "</IBAN>"
            : "            <Othr>\n              <Id>" + escapeXml(debtorAcc) + "</Id>\n            </Othr>";

        String creditorAccXml = isIban(creditorAcc)
            ? "            <IBAN>" + escapeXml(creditorAcc.replaceAll("\\s+", "")) + "</IBAN>"
            : "            <Othr>\n              <Id>" + escapeXml(creditorAcc) + "</Id>\n            </Othr>";

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
               "<!--\n" +
               "  SWIFT MX Message Payload (ISO 20022 Demonstration)\n" +
               "  Type: " + msgType + " - Financial Institution to Customer Credit Transfer\n" +
               "  Notice: Generated and validated by Spring Boot backend. Not transmitted to live SWIFT network.\n" +
               "-->\n" +
               "<Document xmlns=\"urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n" +
               "  <FIToFICstmrCdtTrf>\n" +
               "    <GrpHdr>\n" +
               "      <MsgId>" + msgId + "</MsgId>\n" +
               "      <CreDtTm>" + creDtTm + "</CreDtTm>\n" +
               "      <NbOfTxs>1</NbOfTxs>\n" +
               "      <SttlmInf>\n" +
               "        <SttlmMtd>CLRG</SttlmMtd>\n" +
               "      </SttlmInf>\n" +
               "      <InstgAgt>\n" +
               "        <FinInstnId>\n" +
               "          <BICFI>" + senderBic + "</BICFI>\n" +
               "          <Nm>" + senderName + "</Nm>\n" +
               "        </FinInstnId>\n" +
               "      </InstgAgt>\n" +
               "      <InstdAgt>\n" +
               "        <FinInstnId>\n" +
               "          <BICFI>" + receiverBic + "</BICFI>\n" +
               "          <Nm>" + receiverName + "</Nm>\n" +
               "        </FinInstnId>\n" +
               "      </InstdAgt>\n" +
               "    </GrpHdr>\n" +
               "    <CdtTrfTxInf>\n" +
               "      <PmtId>\n" +
               "        <EndToEndId>" + msgId + "-E2E</EndToEndId>\n" +
               "        <TxId>" + msgId + "-TX01</TxId>\n" +
               "      </PmtId>\n" +
               "      <IntrBkSttlmAmt Ccy=\"" + currency + "\">" + formattedAmt + "</IntrBkSttlmAmt>\n" +
               "      <IntrBkSttlmDt>" + creationDt + "</IntrBkSttlmDt>\n" +
               "      <Dbtr>\n" +
               "        <Nm>" + debtorName + "</Nm>\n" +
               "      </Dbtr>\n" +
               "      <DbtrAcct>\n" +
               "        <Id>\n" +
               debtorAccXml + "\n" +
               "        </Id>\n" +
               "      </DbtrAcct>\n" +
               "      <DbtrAgt>\n" +
               "        <FinInstnId>\n" +
               "          <BICFI>" + senderBic + "</BICFI>\n" +
               "        </FinInstnId>\n" +
               "      </DbtrAgt>\n" +
               "      <CdtrAgt>\n" +
               "        <FinInstnId>\n" +
               "          <BICFI>" + receiverBic + "</BICFI>\n" +
               "        </FinInstnId>\n" +
               "      </CdtrAgt>\n" +
               "      <Cdtr>\n" +
               "        <Nm>" + creditorName + "</Nm>\n" +
               "      </Cdtr>\n" +
               "      <CdtrAcct>\n" +
               "        <Id>\n" +
               creditorAccXml + "\n" +
               "        </Id>\n" +
               "      </CdtrAcct>\n" +
               "      <RmtInf>\n" +
               "        <Ustrd>" + remittance + "</Ustrd>\n" +
               "      </RmtInf>\n" +
               "    </CdtTrfTxInf>\n" +
               "  </FIToFICstmrCdtTrf>\n" +
               "</Document>";
    }

    /**
     * Generates a well-formed ISO 20022 pacs.009.001.08 Financial Institution Credit Transfer payload.
     */
    public String generatePacs009Xml(MessageCreateRequest req) {
        String msgId = escapeXml(req.getMessageId().trim());
        String msgType = escapeXml(req.getMessageType().trim());
        LocalDate date = req.getCreationDate() != null ? req.getCreationDate() : LocalDate.now();
        String creationDt = date.format(DateTimeFormatter.ISO_LOCAL_DATE);
        String creDtTm = creationDt + "T12:00:00Z";
        String currency = escapeXml(req.getCurrency().trim().toUpperCase());
        BigDecimal amt = req.getAmount() != null ? req.getAmount() : BigDecimal.ZERO;
        String formattedAmt = amt.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString();

        String senderBic = escapeXml(req.getSenderBic().trim().toUpperCase());
        String senderName = escapeXml(req.getSenderName().trim());
        String receiverBic = escapeXml(req.getReceiverBic().trim().toUpperCase());
        String receiverName = escapeXml(req.getReceiverName().trim());

        String debtorName = escapeXml(req.getDebtorName().trim());
        String debtorAcc = req.getDebtorAccount().trim();
        String creditorName = escapeXml(req.getCreditorName().trim());
        String creditorAcc = req.getCreditorAccount().trim();
        String remittance = escapeXml(req.getRemittanceInfo().trim());

        String debtorAccXml = isIban(debtorAcc)
            ? "            <IBAN>" + escapeXml(debtorAcc.replaceAll("\\s+", "")) + "</IBAN>"
            : "            <Othr>\n              <Id>" + escapeXml(debtorAcc) + "</Id>\n            </Othr>";

        String creditorAccXml = isIban(creditorAcc)
            ? "            <IBAN>" + escapeXml(creditorAcc.replaceAll("\\s+", "")) + "</IBAN>"
            : "            <Othr>\n              <Id>" + escapeXml(creditorAcc) + "</Id>\n            </Othr>";

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
               "<!--\n" +
               "  SWIFT MX Message Payload (ISO 20022 Demonstration)\n" +
               "  Type: " + msgType + " - Financial Institution Credit Transfer (Interbank)\n" +
               "  Notice: Generated and validated by Spring Boot backend. Not transmitted to live SWIFT network.\n" +
               "-->\n" +
               "<Document xmlns=\"urn:iso:std:iso:20022:tech:xsd:pacs.009.001.08\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n" +
               "  <FICdtTrf>\n" +
               "    <GrpHdr>\n" +
               "      <MsgId>" + msgId + "</MsgId>\n" +
               "      <CreDtTm>" + creDtTm + "</CreDtTm>\n" +
               "      <NbOfTxs>1</NbOfTxs>\n" +
               "      <SttlmInf>\n" +
               "        <SttlmMtd>CLRG</SttlmMtd>\n" +
               "      </SttlmInf>\n" +
               "      <InstgAgt>\n" +
               "        <FinInstnId>\n" +
               "          <BICFI>" + senderBic + "</BICFI>\n" +
               "          <Nm>" + senderName + "</Nm>\n" +
               "        </FinInstnId>\n" +
               "      </InstgAgt>\n" +
               "      <InstdAgt>\n" +
               "        <FinInstnId>\n" +
               "          <BICFI>" + receiverBic + "</BICFI>\n" +
               "          <Nm>" + receiverName + "</Nm>\n" +
               "        </FinInstnId>\n" +
               "      </InstdAgt>\n" +
               "    </GrpHdr>\n" +
               "    <CdtTrfTxInf>\n" +
               "      <PmtId>\n" +
               "        <EndToEndId>" + msgId + "-E2E</EndToEndId>\n" +
               "        <TxId>" + msgId + "-TX01</TxId>\n" +
               "      </PmtId>\n" +
               "      <IntrBkSttlmAmt Ccy=\"" + currency + "\">" + formattedAmt + "</IntrBkSttlmAmt>\n" +
               "      <IntrBkSttlmDt>" + creationDt + "</IntrBkSttlmDt>\n" +
               "      <Dbtr>\n" +
               "        <FinInstnId>\n" +
               "          <BICFI>" + senderBic + "</BICFI>\n" +
               "          <Nm>" + (debtorName.isEmpty() ? senderName : debtorName) + "</Nm>\n" +
               "        </FinInstnId>\n" +
               "      </Dbtr>\n" +
               "      <DbtrAcct>\n" +
               "        <Id>\n" +
               debtorAccXml + "\n" +
               "        </Id>\n" +
               "      </DbtrAcct>\n" +
               "      <CdtrAgt>\n" +
               "        <FinInstnId>\n" +
               "          <BICFI>" + receiverBic + "</BICFI>\n" +
               "        </FinInstnId>\n" +
               "      </CdtrAgt>\n" +
               "      <Cdtr>\n" +
               "        <FinInstnId>\n" +
               "          <BICFI>" + receiverBic + "</BICFI>\n" +
               "          <Nm>" + (creditorName.isEmpty() ? receiverName : creditorName) + "</Nm>\n" +
               "        </FinInstnId>\n" +
               "      </Cdtr>\n" +
               "      <CdtrAcct>\n" +
               "        <Id>\n" +
               creditorAccXml + "\n" +
               "        </Id>\n" +
               "      </CdtrAcct>\n" +
               "      <RmtInf>\n" +
               "        <Ustrd>" + (remittance.isEmpty() ? "Interbank Liquidity Settlement" : remittance) + "</Ustrd>\n" +
               "      </RmtInf>\n" +
               "    </CdtTrfTxInf>\n" +
               "  </FICdtTrf>\n" +
               "</Document>";
    }

    /**
     * Generates a well-formed ISO 20022 pacs.004.001.09 Payment Return payload.
     */
    public String generatePacs004Xml(MessageCreateRequest req) {
        String msgId = escapeXml(req.getMessageId().trim());
        String msgType = escapeXml(req.getMessageType().trim());
        LocalDate date = req.getCreationDate() != null ? req.getCreationDate() : LocalDate.now();
        String creationDt = date.format(DateTimeFormatter.ISO_LOCAL_DATE);
        String creDtTm = creationDt + "T12:00:00Z";
        String currency = escapeXml(req.getCurrency().trim().toUpperCase());
        BigDecimal amt = req.getAmount() != null ? req.getAmount() : BigDecimal.ZERO;
        String formattedAmt = amt.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString();

        String senderBic = escapeXml(req.getSenderBic().trim().toUpperCase());
        String senderName = escapeXml(req.getSenderName().trim());
        String receiverBic = escapeXml(req.getReceiverBic().trim().toUpperCase());
        String receiverName = escapeXml(req.getReceiverName().trim());

        String debtorName = escapeXml(req.getDebtorName().trim());
        String debtorAcc = req.getDebtorAccount().trim();
        String creditorName = escapeXml(req.getCreditorName().trim());
        String creditorAcc = req.getCreditorAccount().trim();
        String remittance = escapeXml(req.getRemittanceInfo().trim());

        String debtorAccXml = isIban(debtorAcc)
            ? "              <IBAN>" + escapeXml(debtorAcc.replaceAll("\\s+", "")) + "</IBAN>"
            : "              <Othr>\n                <Id>" + escapeXml(debtorAcc) + "</Id>\n              </Othr>";

        String creditorAccXml = isIban(creditorAcc)
            ? "              <IBAN>" + escapeXml(creditorAcc.replaceAll("\\s+", "")) + "</IBAN>"
            : "              <Othr>\n                <Id>" + escapeXml(creditorAcc) + "</Id>\n              </Othr>";

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
               "<!--\n" +
               "  SWIFT MX Message Payload (ISO 20022 Demonstration)\n" +
               "  Type: " + msgType + " - Payment Return / Settlement Reversal\n" +
               "  Notice: Generated and validated by Spring Boot backend. Not transmitted to live SWIFT network.\n" +
               "-->\n" +
               "<Document xmlns=\"urn:iso:std:iso:20022:tech:xsd:pacs.004.001.09\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n" +
               "  <PmtRtr>\n" +
               "    <GrpHdr>\n" +
               "      <MsgId>" + msgId + "</MsgId>\n" +
               "      <CreDtTm>" + creDtTm + "</CreDtTm>\n" +
               "      <NbOfTxs>1</NbOfTxs>\n" +
               "      <SttlmInf>\n" +
               "        <SttlmMtd>CLRG</SttlmMtd>\n" +
               "      </SttlmInf>\n" +
               "      <InstgAgt>\n" +
               "        <FinInstnId>\n" +
               "          <BICFI>" + senderBic + "</BICFI>\n" +
               "          <Nm>" + senderName + "</Nm>\n" +
               "        </FinInstnId>\n" +
               "      </InstgAgt>\n" +
               "      <InstdAgt>\n" +
               "        <FinInstnId>\n" +
               "          <BICFI>" + receiverBic + "</BICFI>\n" +
               "          <Nm>" + receiverName + "</Nm>\n" +
               "        </FinInstnId>\n" +
               "      </InstdAgt>\n" +
               "    </GrpHdr>\n" +
               "    <TxInf>\n" +
               "      <RtrId>" + msgId + "-RTR01</RtrId>\n" +
               "      <OrgnlEndToEndId>" + msgId + "-E2E</OrgnlEndToEndId>\n" +
               "      <OrgnlTxId>" + msgId + "-TX01</OrgnlTxId>\n" +
               "      <RtrdIntrBkSttlmAmt Ccy=\"" + currency + "\">" + formattedAmt + "</RtrdIntrBkSttlmAmt>\n" +
               "      <IntrBkSttlmDt>" + creationDt + "</IntrBkSttlmDt>\n" +
               "      <RtrRsnInf>\n" +
               "        <Rsn>\n" +
               "          <Cd>AC04</Cd>\n" +
               "        </Rsn>\n" +
               "        <AddtlInf>" + (remittance.isEmpty() ? "Payment return: Account Closed or Beneficiary Request" : remittance) + "</AddtlInf>\n" +
               "      </RtrRsnInf>\n" +
               "      <OrgnlTxRef>\n" +
               "        <IntrBkSttlmAmt Ccy=\"" + currency + "\">" + formattedAmt + "</IntrBkSttlmAmt>\n" +
               "        <Dbtr>\n" +
               "          <Nm>" + debtorName + "</Nm>\n" +
               "        </Dbtr>\n" +
               "        <DbtrAcct>\n" +
               "          <Id>\n" +
               debtorAccXml + "\n" +
               "          </Id>\n" +
               "        </DbtrAcct>\n" +
               "        <Cdtr>\n" +
               "          <Nm>" + creditorName + "</Nm>\n" +
               "        </Cdtr>\n" +
               "        <CdtrAcct>\n" +
               "          <Id>\n" +
               creditorAccXml + "\n" +
               "          </Id>\n" +
               "        </CdtrAcct>\n" +
               "      </OrgnlTxRef>\n" +
               "    </TxInf>\n" +
               "  </PmtRtr>\n" +
               "</Document>";
    }

    /**
     * Generates a well-formed ISO 20022 camt.053.001.08 Bank-to-Customer Statement payload.
     */
    public String generateCamt053Xml(MessageCreateRequest req) {
        String msgId = escapeXml(req.getMessageId().trim());
        String msgType = escapeXml(req.getMessageType().trim());
        LocalDate date = req.getCreationDate() != null ? req.getCreationDate() : LocalDate.now();
        String creationDt = date.format(DateTimeFormatter.ISO_LOCAL_DATE);
        String creDtTm = creationDt + "T12:00:00Z";
        String currency = escapeXml(req.getCurrency().trim().toUpperCase());
        BigDecimal amt = req.getAmount() != null ? req.getAmount() : BigDecimal.ZERO;
        String formattedAmt = amt.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString();

        String senderBic = escapeXml(req.getSenderBic().trim().toUpperCase());
        String senderName = escapeXml(req.getSenderName().trim());
        String receiverBic = escapeXml(req.getReceiverBic().trim().toUpperCase());

        String debtorName = escapeXml(req.getDebtorName().trim());
        String debtorAcc = req.getDebtorAccount().trim();
        String creditorName = escapeXml(req.getCreditorName().trim());
        String remittance = escapeXml(req.getRemittanceInfo().trim());

        String accountIdXml = isIban(debtorAcc)
            ? "          <IBAN>" + escapeXml(debtorAcc.replaceAll("\\s+", "")) + "</IBAN>"
            : "          <Othr>\n            <Id>" + escapeXml(debtorAcc) + "</Id>\n          </Othr>";

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
               "<!--\n" +
               "  SWIFT MX Message Payload (ISO 20022 Demonstration)\n" +
               "  Type: " + msgType + " - Bank-to-Customer Account Statement\n" +
               "  Notice: Generated and validated by Spring Boot backend. Not transmitted to live SWIFT network.\n" +
               "-->\n" +
               "<Document xmlns=\"urn:iso:std:iso:20022:tech:xsd:camt.053.001.08\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n" +
               "  <BkToCstmrStmt>\n" +
               "    <GrpHdr>\n" +
               "      <MsgId>" + msgId + "</MsgId>\n" +
               "      <CreDtTm>" + creDtTm + "</CreDtTm>\n" +
               "      <MsgRcpt>\n" +
               "        <Id>\n" +
               "          <OrgId>\n" +
               "            <AnyBIC>" + receiverBic + "</AnyBIC>\n" +
               "          </OrgId>\n" +
               "        </Id>\n" +
               "      </MsgRcpt>\n" +
               "    </GrpHdr>\n" +
               "    <Stmt>\n" +
               "      <Id>" + msgId + "-STMT01</Id>\n" +
               "      <ElctrncSeqNb>1</ElctrncSeqNb>\n" +
               "      <CreDtTm>" + creDtTm + "</CreDtTm>\n" +
               "      <Acct>\n" +
               "        <Id>\n" +
               accountIdXml + "\n" +
               "        </Id>\n" +
               "        <Ccy>" + currency + "</Ccy>\n" +
               "        <Svcr>\n" +
               "          <FinInstnId>\n" +
               "            <BICFI>" + senderBic + "</BICFI>\n" +
               "            <Nm>" + senderName + "</Nm>\n" +
               "          </FinInstnId>\n" +
               "        </Svcr>\n" +
               "      </Acct>\n" +
               "      <Bal>\n" +
               "        <Tp>\n" +
               "          <CdOrPrtry>\n" +
               "            <Cd>OPBD</Cd>\n" +
               "          </CdOrPrtry>\n" +
               "        </Tp>\n" +
               "        <Amt Ccy=\"" + currency + "\">" + formattedAmt + "</Amt>\n" +
               "        <CdtDbtInd>CRDT</CdtDbtInd>\n" +
               "        <Dt>\n" +
               "          <Dt>" + creationDt + "</Dt>\n" +
               "        </Dt>\n" +
               "      </Bal>\n" +
               "      <Bal>\n" +
               "        <Tp>\n" +
               "          <CdOrPrtry>\n" +
               "            <Cd>CLBD</Cd>\n" +
               "          </CdOrPrtry>\n" +
               "        </Tp>\n" +
               "        <Amt Ccy=\"" + currency + "\">" + formattedAmt + "</Amt>\n" +
               "        <CdtDbtInd>CRDT</CdtDbtInd>\n" +
               "        <Dt>\n" +
               "          <Dt>" + creationDt + "</Dt>\n" +
               "        </Dt>\n" +
               "      </Bal>\n" +
               "      <Ntry>\n" +
               "        <Amt Ccy=\"" + currency + "\">" + formattedAmt + "</Amt>\n" +
               "        <CdtDbtInd>CRDT</CdtDbtInd>\n" +
               "        <Sts>BOOK</Sts>\n" +
               "        <BookgDt>\n" +
               "          <Dt>" + creationDt + "</Dt>\n" +
               "        </BookgDt>\n" +
               "        <ValDt>\n" +
               "          <Dt>" + creationDt + "</Dt>\n" +
               "        </ValDt>\n" +
               "        <AcctSvcrRef>" + msgId + "-TX01</AcctSvcrRef>\n" +
               "        <NtryDtls>\n" +
               "          <TxDtls>\n" +
               "            <Refs>\n" +
               "              <EndToEndId>" + msgId + "-E2E</EndToEndId>\n" +
               "            </Refs>\n" +
               "            <Amt Ccy=\"" + currency + "\">" + formattedAmt + "</Amt>\n" +
               "            <RltdPties>\n" +
               "              <Dbtr>\n" +
               "                <Nm>" + debtorName + "</Nm>\n" +
               "              </Dbtr>\n" +
               "              <Cdtr>\n" +
               "                <Nm>" + creditorName + "</Nm>\n" +
               "              </Cdtr>\n" +
               "            </RltdPties>\n" +
               "            <RmtInf>\n" +
               "              <Ustrd>" + (remittance.isEmpty() ? "Commercial Settlement Statement Entry" : remittance) + "</Ustrd>\n" +
               "            </RmtInf>\n" +
               "          </TxDtls>\n" +
               "        </NtryDtls>\n" +
               "      </Ntry>\n" +
               "    </Stmt>\n" +
               "  </BkToCstmrStmt>\n" +
               "</Document>";
    }
}
