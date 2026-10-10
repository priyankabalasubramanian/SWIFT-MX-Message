package com.swiftmx.app.service;

import com.swiftmx.app.dto.MessageCreateRequest;
import com.swiftmx.app.dto.MessageResponse;
import com.swiftmx.app.exception.DuplicateMessageException;
import com.swiftmx.app.exception.ResourceNotFoundException;
import com.swiftmx.app.model.Message;
import com.swiftmx.app.repository.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final XmlGeneratorService xmlGeneratorService;

    public MessageService(MessageRepository messageRepository, XmlGeneratorService xmlGeneratorService) {
        this.messageRepository = messageRepository;
        this.xmlGeneratorService = xmlGeneratorService;
    }

    @Transactional
    public MessageResponse createMessage(MessageCreateRequest req) {
        String cleanMsgId = req.getMessageId().trim();

        if (messageRepository.existsByMessageId(cleanMsgId)) {
            throw new DuplicateMessageException("A message with ID '" + cleanMsgId + "' already exists in the system.");
        }

        // Server-side XML generation and entity validation
        String xml = xmlGeneratorService.generateXml(req);

        Message message = new Message();
        message.setMessageId(cleanMsgId);
        message.setMessageType(req.getMessageType().trim());
        message.setCreationDate(req.getCreationDate());
        message.setCurrency(req.getCurrency().trim().toUpperCase());
        message.setAmount(req.getAmount());
        message.setSenderName(req.getSenderName().trim());
        message.setSenderBic(req.getSenderBic().trim().toUpperCase());
        message.setReceiverName(req.getReceiverName().trim());
        message.setReceiverBic(req.getReceiverBic().trim().toUpperCase());
        message.setDebtorName(req.getDebtorName().trim());
        message.setDebtorAccount(req.getDebtorAccount().trim());
        message.setCreditorName(req.getCreditorName().trim());
        message.setCreditorAccount(req.getCreditorAccount().trim());
        message.setRemittanceInfo(req.getRemittanceInfo().trim());
        message.setGeneratedXml(xml);
        message.setStatus("CREATED");

        Message saved = messageRepository.save(message);
        return MessageResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getAllMessages() {
        return messageRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(MessageResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public MessageResponse getMessageById(String identifier) {
        // Try looking up by numeric primary key first
        try {
            Long numericId = Long.parseLong(identifier);
            return messageRepository.findById(numericId)
                    .map(MessageResponse::fromEntity)
                    .orElseGet(() -> getByMessageIdString(identifier));
        } catch (NumberFormatException e) {
            return getByMessageIdString(identifier);
        }
    }

    private MessageResponse getByMessageIdString(String messageId) {
        return messageRepository.findByMessageId(messageId)
                .map(MessageResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("SWIFT MX Message with identifier '" + messageId + "' was not found."));
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> searchMessages(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllMessages();
        }
        return messageRepository.searchMessages(query.trim())
                .stream()
                .map(MessageResponse::fromEntity)
                .toList();
    }
}
