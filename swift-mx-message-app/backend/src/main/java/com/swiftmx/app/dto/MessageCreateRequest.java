package com.swiftmx.app.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public class MessageCreateRequest {

    @NotBlank(message = "Message ID is required")
    @Size(min = 4, max = 64, message = "Message ID must be between 4 and 64 characters")
    private String messageId;

    @NotBlank(message = "Message type is required")
    private String messageType = "pacs.008";

    @NotNull(message = "Creation date is required")
    private LocalDate creationDate;

    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency must be a 3-character ISO code")
    private String currency;

    @NotNull(message = "Payment amount is required")
    @DecimalMin(value = "0.01", message = "Payment amount must be greater than 0")
    private BigDecimal amount;

    @NotBlank(message = "Sender institution name is required")
    @Size(max = 150)
    private String senderName;

    @NotBlank(message = "Sender BIC is required")
    @Pattern(regexp = "^[A-Z0-9]{8}([A-Z0-9]{3})?$", message = "Sender BIC must be 8 or 11 alphanumeric characters")
    private String senderBic;

    @NotBlank(message = "Receiver institution name is required")
    @Size(max = 150)
    private String receiverName;

    @NotBlank(message = "Receiver BIC is required")
    @Pattern(regexp = "^[A-Z0-9]{8}([A-Z0-9]{3})?$", message = "Receiver BIC must be 8 or 11 alphanumeric characters")
    private String receiverBic;

    @NotBlank(message = "Debtor name is required")
    @Size(max = 150)
    private String debtorName;

    @NotBlank(message = "Debtor account or IBAN is required")
    @Size(max = 34)
    private String debtorAccount;

    @NotBlank(message = "Creditor name is required")
    @Size(max = 150)
    private String creditorName;

    @NotBlank(message = "Creditor account or IBAN is required")
    @Size(max = 34)
    private String creditorAccount;

    @NotBlank(message = "Remittance information is required")
    @Size(max = 500)
    private String remittanceInfo;

    public MessageCreateRequest() {}

    // Getters and Setters
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
}
