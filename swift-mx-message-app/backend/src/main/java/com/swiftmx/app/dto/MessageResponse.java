package com.swiftmx.app.dto;

import com.swiftmx.app.model.Message;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MessageResponse {

    private Long id;
    private String messageId;
    private String messageType;
    private LocalDate creationDate;
    private String currency;
    private BigDecimal amount;
    private String senderName;
    private String senderBic;
    private String receiverName;
    private String receiverBic;
    private String debtorName;
    private String debtorAccount;
    private String creditorName;
    private String creditorAccount;
    private String remittanceInfo;
    private String generatedXml;
    private String status;
    private LocalDateTime createdAt;

    public MessageResponse() {}

    public static MessageResponse fromEntity(Message msg) {
        MessageResponse dto = new MessageResponse();
        dto.setId(msg.getId());
        dto.setMessageId(msg.getMessageId());
        dto.setMessageType(msg.getMessageType());
        dto.setCreationDate(msg.getCreationDate());
        dto.setCurrency(msg.getCurrency());
        dto.setAmount(msg.getAmount());
        dto.setSenderName(msg.getSenderName());
        dto.setSenderBic(msg.getSenderBic());
        dto.setReceiverName(msg.getReceiverName());
        dto.setReceiverBic(msg.getReceiverBic());
        dto.setDebtorName(msg.getDebtorName());
        dto.setDebtorAccount(msg.getDebtorAccount());
        dto.setCreditorName(msg.getCreditorName());
        dto.setCreditorAccount(msg.getCreditorAccount());
        dto.setRemittanceInfo(msg.getRemittanceInfo());
        dto.setGeneratedXml(msg.getGeneratedXml());
        dto.setStatus(msg.getStatus());
        dto.setCreatedAt(msg.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMessageId() { return messageId; }
    public void setMessageId(String messageId) { this.messageId = messageId; }

    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }

    public LocalDate getCreationDate() { return creationDate; }
    public void setCreationDate(LocalDate creationDate) { this.creationDate = creationDate; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderBic() { return senderBic; }
    public void setSenderBic(String senderBic) { this.senderBic = senderBic; }

    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }

    public String getReceiverBic() { return receiverBic; }
    public void setReceiverBic(String receiverBic) { this.receiverBic = receiverBic; }

    public String getDebtorName() { return debtorName; }
    public void setDebtorName(String debtorName) { this.debtorName = debtorName; }

    public String getDebtorAccount() { return debtorAccount; }
    public void setDebtorAccount(String debtorAccount) { this.debtorAccount = debtorAccount; }

    public String getCreditorName() { return creditorName; }
    public void setCreditorName(String creditorName) { this.creditorName = creditorName; }

    public String getCreditorAccount() { return creditorAccount; }
    public void setCreditorAccount(String creditorAccount) { this.creditorAccount = creditorAccount; }

    public String getRemittanceInfo() { return remittanceInfo; }
    public void setRemittanceInfo(String remittanceInfo) { this.remittanceInfo = remittanceInfo; }

    public String getGeneratedXml() { return generatedXml; }
    public void setGeneratedXml(String generatedXml) { this.generatedXml = generatedXml; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
