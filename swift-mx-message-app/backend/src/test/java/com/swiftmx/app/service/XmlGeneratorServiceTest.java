package com.swiftmx.app.service;

import com.swiftmx.app.dto.MessageCreateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("XmlGeneratorService Test Suite")
class XmlGeneratorServiceTest {

    private XmlGeneratorService xmlGeneratorService;

    @BeforeEach
    void setUp() {
        xmlGeneratorService = new XmlGeneratorService();
    }

    private MessageCreateRequest createSampleRequest(String messageType) {
        MessageCreateRequest req = new MessageCreateRequest();
        req.setMessageId("MSG-2026-UNIT01");
        req.setMessageType(messageType);
        req.setCreationDate(LocalDate.of(2026, 10, 10));
        req.setCurrency("USD");
        req.setAmount(new BigDecimal("99500.50"));
        req.setSenderName("Bank of America New York & London");
        req.setSenderBic("BOFAUS3NXXX");
        req.setReceiverName("BNP Paribas <Paris Branch>");
        req.setReceiverBic("BNPAFR22XXX");
        req.setDebtorName("Apex Tech \"Corp\"");
        req.setDebtorAccount("US36BOFA12345678901234");
        req.setCreditorName("Global Supplies 'Ltd'");
        req.setCreditorAccount("FR7630006000011234567890189");
        req.setRemittanceInfo("Payment for Machinery & Software License <INV-900>");
        return req;
    }

    @Test
    @DisplayName("Special character escaping should replace &, <, >, \", and '")
    void testEscapeXml() {
        String input = "Tom & Jerry <cartoon> \"classic\" '1940'";
        String escaped = xmlGeneratorService.escapeXml(input);
        assertEquals("Tom &amp; Jerry &lt;cartoon&gt; &quot;classic&quot; &apos;1940&apos;", escaped);
    }

    @Test
    @DisplayName("Should detect IBAN pattern correctly")
    void testIsIban() {
        assertTrue(xmlGeneratorService.isIban("US36BOFA12345678901234"));
        assertTrue(xmlGeneratorService.isIban("FR7630006000011234567890189"));
        assertTrue(xmlGeneratorService.isIban("DE89 3704 0044 0532 0130 00"));
        assertFalse(xmlGeneratorService.isIban("123456789"));
        assertFalse(xmlGeneratorService.isIban("ACCT-9001"));
    }

    @Test
    @DisplayName("Should generate valid pacs.008 XML payload with customer credit transfer root")
    void testGeneratePacs008Xml() {
        MessageCreateRequest req = createSampleRequest("pacs.008");
        String xml = xmlGeneratorService.generateXml(req);

        assertNotNull(xml);
        assertTrue(xml.contains("<Document xmlns=\"urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08\""));
        assertTrue(xml.contains("<FIToFICstmrCdtTrf>"));
        assertTrue(xml.contains("<MsgId>MSG-2026-UNIT01</MsgId>"));
        assertTrue(xml.contains("<IntrBkSttlmAmt Ccy=\"USD\">99500.50</IntrBkSttlmAmt>"));
        assertTrue(xml.contains("<BICFI>BOFAUS3NXXX</BICFI>"));
        assertTrue(xml.contains("<BICFI>BNPAFR22XXX</BICFI>"));
        assertTrue(xml.contains("<IBAN>US36BOFA12345678901234</IBAN>"));
        assertTrue(xml.contains("<IBAN>FR7630006000011234567890189</IBAN>"));
        // Check escaping of special chars
        assertTrue(xml.contains("Bank of America New York &amp; London"));
        assertTrue(xml.contains("BNP Paribas &lt;Paris Branch&gt;"));
        assertTrue(xml.contains("Apex Tech &quot;Corp&quot;"));
        assertTrue(xml.contains("Global Supplies &apos;Ltd&apos;"));
    }

    @Test
    @DisplayName("Should generate valid pacs.009 XML payload with interbank transfer root")
    void testGeneratePacs009Xml() {
        MessageCreateRequest req = createSampleRequest("pacs.009");
        String xml = xmlGeneratorService.generateXml(req);

        assertNotNull(xml);
        assertTrue(xml.contains("<Document xmlns=\"urn:iso:std:iso:20022:tech:xsd:pacs.009.001.08\""));
        assertTrue(xml.contains("<FICdtTrf>"));
        assertTrue(xml.contains("<MsgId>MSG-2026-UNIT01</MsgId>"));
        assertTrue(xml.contains("<IntrBkSttlmAmt Ccy=\"USD\">99500.50</IntrBkSttlmAmt>"));
    }

    @Test
    @DisplayName("Should generate valid pacs.004 XML payload with payment return root")
    void testGeneratePacs004Xml() {
        MessageCreateRequest req = createSampleRequest("pacs.004");
        String xml = xmlGeneratorService.generateXml(req);

        assertNotNull(xml);
        assertTrue(xml.contains("<Document xmlns=\"urn:iso:std:iso:20022:tech:xsd:pacs.004.001.09\""));
        assertTrue(xml.contains("<PmtRtr>"));
        assertTrue(xml.contains("<RtrId>MSG-2026-UNIT01-RTR01</RtrId>"));
        assertTrue(xml.contains("<Cd>AC04</Cd>"));
    }

    @Test
    @DisplayName("Should generate valid camt.053 XML payload with account statement root")
    void testGenerateCamt053Xml() {
        MessageCreateRequest req = createSampleRequest("camt.053");
        String xml = xmlGeneratorService.generateXml(req);

        assertNotNull(xml);
        assertTrue(xml.contains("<Document xmlns=\"urn:iso:std:iso:20022:tech:xsd:camt.053.001.08\""));
        assertTrue(xml.contains("<BkToCstmrStmt>"));
        assertTrue(xml.contains("<Id>MSG-2026-UNIT01-STMT01</Id>"));
        assertTrue(xml.contains("<Cd>OPBD</Cd>"));
        assertTrue(xml.contains("<Cd>CLBD</Cd>"));
    }
}
