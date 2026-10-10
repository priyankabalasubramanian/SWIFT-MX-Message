package com.swiftmx.app.service;

import com.swiftmx.app.dto.MessageCreateRequest;
import com.swiftmx.app.dto.MessageResponse;
import com.swiftmx.app.exception.DuplicateMessageException;
import com.swiftmx.app.exception.ResourceNotFoundException;
import com.swiftmx.app.model.Message;
import com.swiftmx.app.repository.MessageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MessageService Unit Test Suite")
class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private XmlGeneratorService xmlGeneratorService;

    @InjectMocks
    private MessageService messageService;

    private MessageCreateRequest sampleRequest;

    @BeforeEach
    void setUp() {
        sampleRequest = new MessageCreateRequest();
        sampleRequest.setMessageId("MSG-2026-SRV01");
        sampleRequest.setMessageType("pacs.008");
        sampleRequest.setCreationDate(LocalDate.now());
        sampleRequest.setCurrency("EUR");
        sampleRequest.setAmount(new BigDecimal("15000.00"));
        sampleRequest.setSenderName("Deutsche Bank");
        sampleRequest.setSenderBic("DEUTDEFFXXX");
        sampleRequest.setReceiverName("BNP Paribas");
        sampleRequest.setReceiverBic("BNPAFR22XXX");
        sampleRequest.setDebtorName("Siemens AG");
        sampleRequest.setDebtorAccount("DE89370400440532013000");
        sampleRequest.setCreditorName("Alstom SA");
        sampleRequest.setCreditorAccount("FR7630006000011234567890189");
        sampleRequest.setRemittanceInfo("Invoice 2026-991");
    }

    @Test
    @DisplayName("Should successfully create and persist a new message")
    void testCreateMessageSuccess() {
        when(messageRepository.existsByMessageId("MSG-2026-SRV01")).thenReturn(false);
        when(xmlGeneratorService.generateXml(any())).thenReturn("<Document></Document>");

        Message savedMessage = new Message();
        savedMessage.setId(10L);
        savedMessage.setMessageId("MSG-2026-SRV01");
        savedMessage.setMessageType("pacs.008");
        savedMessage.setCreationDate(LocalDate.now());
        savedMessage.setCurrency("EUR");
        savedMessage.setAmount(new BigDecimal("15000.00"));
        savedMessage.setSenderName("Deutsche Bank");
        savedMessage.setSenderBic("DEUTDEFFXXX");
        savedMessage.setReceiverName("BNP Paribas");
        savedMessage.setReceiverBic("BNPAFR22XXX");
        savedMessage.setDebtorName("Siemens AG");
        savedMessage.setDebtorAccount("DE89370400440532013000");
        savedMessage.setCreditorName("Alstom SA");
        savedMessage.setCreditorAccount("FR7630006000011234567890189");
        savedMessage.setRemittanceInfo("Invoice 2026-991");
        savedMessage.setGeneratedXml("<Document></Document>");
        savedMessage.setStatus("CREATED");

        when(messageRepository.save(any(Message.class))).thenReturn(savedMessage);

        MessageResponse response = messageService.createMessage(sampleRequest);

        assertNotNull(response);
        assertEquals("MSG-2026-SRV01", response.getMessageId());
        assertEquals("EUR", response.getCurrency());
        verify(messageRepository, times(1)).save(any(Message.class));
    }

    @Test
    @DisplayName("Should throw DuplicateMessageException when messageId already exists")
    void testCreateMessageDuplicateThrowsException() {
        when(messageRepository.existsByMessageId("MSG-2026-SRV01")).thenReturn(true);

        assertThrows(DuplicateMessageException.class, () -> {
            messageService.createMessage(sampleRequest);
        });

        verify(messageRepository, never()).save(any(Message.class));
    }

    @Test
    @DisplayName("Should retrieve message by string messageId")
    void testGetMessageByStringId() {
        Message msg = new Message();
        msg.setId(5L);
        msg.setMessageId("MSG-2026-SRV01");
        msg.setMessageType("pacs.008");
        msg.setGeneratedXml("<Document></Document>");

        when(messageRepository.findByMessageId("MSG-2026-SRV01")).thenReturn(Optional.of(msg));

        MessageResponse response = messageService.getMessageById("MSG-2026-SRV01");
        assertNotNull(response);
        assertEquals("MSG-2026-SRV01", response.getMessageId());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException if message not found")
    void testGetMessageNotFound() {
        when(messageRepository.findByMessageId("UNKNOWN-ID")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            messageService.getMessageById("UNKNOWN-ID");
        });
    }

    @Test
    @DisplayName("Should search messages using query")
    void testSearchMessages() {
        Message msg = new Message();
        msg.setId(1L);
        msg.setMessageId("MSG-2026-SRV01");
        msg.setGeneratedXml("<Document></Document>");

        when(messageRepository.searchMessages("Siemens")).thenReturn(List.of(msg));

        List<MessageResponse> results = messageService.searchMessages("Siemens");
        assertEquals(1, results.size());
        assertEquals("MSG-2026-SRV01", results.get(0).getMessageId());
    }
}
