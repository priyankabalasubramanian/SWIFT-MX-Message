package com.swiftmx.app.config;

import com.swiftmx.app.dto.MessageCreateRequest;
import com.swiftmx.app.model.Message;
import com.swiftmx.app.model.User;
import com.swiftmx.app.repository.MessageRepository;
import com.swiftmx.app.repository.UserRepository;
import com.swiftmx.app.service.XmlGeneratorService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final PasswordEncoder passwordEncoder;
    private final XmlGeneratorService xmlGeneratorService;

    public DataInitializer(UserRepository userRepository,
                           MessageRepository messageRepository,
                           PasswordEncoder passwordEncoder,
                           XmlGeneratorService xmlGeneratorService) {
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
        this.passwordEncoder = passwordEncoder;
        this.xmlGeneratorService = xmlGeneratorService;
    }

    @Override
    public void run(String... args) {
        // Pre-warm cryptographic hashing engine, SecureRandom entropy, and JPA query cache on startup
        try {
            passwordEncoder.matches("warmup", "$2a$10$wEkgm05cQkEwG8WzC1P7h.O7I5QW3J9GqN5Gk5B5l5V5B5l5V5B5l");
            userRepository.findByEmail("operator@swiftmx.bank");
        } catch (Exception ignored) {
            // Warm-up completed
        }

        // Seed default development users with email credentials if not present
        if (!userRepository.existsByEmailIgnoreCase("operator@swiftmx.bank")) {
            User operator = new User(
                "operator@swiftmx.bank",
                "OP-84920",
                passwordEncoder.encode("password123"),
                "Authorised Operations Specialist",
                "OPERATOR"
            );
            userRepository.save(operator);
        }

        if (!userRepository.existsByEmailIgnoreCase("admin@swiftmx.bank")) {
            User admin = new User(
                "admin@swiftmx.bank",
                "admin",
                passwordEncoder.encode("password123"),
                "System Administrator",
                "ADMIN"
            );
            userRepository.save(admin);
        }

        // Seed initial demo messages if empty
        if (messageRepository.count() == 0) {
            seedSampleMessage(
                "MSG-2026-00189", "pacs.008", LocalDate.of(2026, 10, 10), "USD", new BigDecimal("50000.00"),
                "Standard Commercial Bank New York", "SCBLUS33XXX",
                "European Mercantile Bank Frankfurt", "EMBKDEFFXXX",
                "Global Tech Solutions Corp", "US36SCBL12345678901234",
                "Apex Industrial Supplies GmbH", "DE89370400440532013000",
                "INV-2026-9041 Commercial Settlement"
            );

            seedSampleMessage(
                "MSG-2026-00190", "pacs.008", LocalDate.of(2026, 10, 9), "EUR", new BigDecimal("125400.00"),
                "BNP Paribas Paris", "BNPAFR22XXX",
                "Deutsche Bank Frankfurt", "DEUTDEFFXXX",
                "Lumiere Logistics SARL", "FR7630006000011234567890189",
                "Bavaria Motor Components AG", "DE12500700100123456789",
                "PO-7882 Automotive Component Deliveries"
            );

            seedSampleMessage(
                "MSG-2026-00191", "pacs.009", LocalDate.of(2026, 10, 8), "GBP", new BigDecimal("850000.00"),
                "Barclays Bank London", "BARCGB22XXX",
                "JPMorgan Chase New York", "CHASUS33XXX",
                "Barclays Treasury Desk London", "GB29BARC20000098765432",
                "JPMorgan Liquidity Operations", "US99CHAS98765432100012",
                "Interbank Overnight Liquidity Rebalancing"
            );

            seedSampleMessage(
                "MSG-2026-00192", "pacs.004", LocalDate.of(2026, 10, 7), "EUR", new BigDecimal("14250.00"),
                "Deutsche Bank Frankfurt", "DEUTDEFFXXX",
                "BNP Paribas Paris", "BNPAFR22XXX",
                "Heidelberg MedTech GmbH", "DE44500105175467239012",
                "Saint-Gobain Distribution SAS", "FR1420041010050500013M026",
                "AC04 Account Closed - Beneficiary Return Request"
            );

            seedSampleMessage(
                "MSG-2026-00193", "camt.053", LocalDate.of(2026, 10, 6), "USD", new BigDecimal("1250000.00"),
                "Standard Commercial Bank New York", "SCBLUS33XXX",
                "Standard Commercial Client Services", "SCBLUS33XXX",
                "Global Tech Solutions Operating Acct", "US36SCBL12345678901234",
                "Operating Settlement Account", "US36SCBL12345678901234",
                "End of Day Commercial Statement EOD-20261006"
            );
        }
    }

    private void seedSampleMessage(String msgId, String type, LocalDate date, String ccy, BigDecimal amt,
                                   String senderName, String senderBic,
                                   String receiverName, String receiverBic,
                                   String debtorName, String debtorAcc,
                                   String creditorName, String creditorAcc,
                                   String remittance) {
        MessageCreateRequest req = new MessageCreateRequest();
        req.setMessageId(msgId);
        req.setMessageType(type);
        req.setCreationDate(date);
        req.setCurrency(ccy);
        req.setAmount(amt);
        req.setSenderName(senderName);
        req.setSenderBic(senderBic);
        req.setReceiverName(receiverName);
        req.setReceiverBic(receiverBic);
        req.setDebtorName(debtorName);
        req.setDebtorAccount(debtorAcc);
        req.setCreditorName(creditorName);
        req.setCreditorAccount(creditorAcc);
        req.setRemittanceInfo(remittance);

        String xml = xmlGeneratorService.generateXml(req);

        Message msg = new Message();
        msg.setMessageId(msgId);
        msg.setMessageType(type);
        msg.setCreationDate(date);
        msg.setCurrency(ccy);
        msg.setAmount(amt);
        msg.setSenderName(senderName);
        msg.setSenderBic(senderBic);
        msg.setReceiverName(receiverName);
        msg.setReceiverBic(receiverBic);
        msg.setDebtorName(debtorName);
        msg.setDebtorAccount(debtorAcc);
        msg.setCreditorName(creditorName);
        msg.setCreditorAccount(creditorAcc);
        msg.setRemittanceInfo(remittance);
        msg.setGeneratedXml(xml);
        msg.setStatus("SETTLED");

        messageRepository.save(msg);
    }
}
