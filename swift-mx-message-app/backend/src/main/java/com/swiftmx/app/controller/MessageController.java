package com.swiftmx.app.controller;

import com.swiftmx.app.dto.ApiResponse;
import com.swiftmx.app.dto.MessageCreateRequest;
import com.swiftmx.app.dto.MessageResponse;
import com.swiftmx.app.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    /**
     * POST /api/messages
     * Validates input, generates server-validated ISO 20022 XML, and saves to database.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MessageResponse>> createMessage(@Valid @RequestBody MessageCreateRequest request) {
        MessageResponse created = messageService.createMessage(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("SWIFT MX Message created and saved successfully to database", created));
    }

    /**
     * GET /api/messages
     * Retrieves all saved messages ordered by creation date descending.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getAllMessages() {
        List<MessageResponse> list = messageService.getAllMessages();
        return ResponseEntity.ok(ApiResponse.success("Messages retrieved successfully", list));
    }

    /**
     * GET /api/messages/{id}
     * Retrieves a single message and its XML payload by numeric ID or message ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MessageResponse>> getMessageById(@PathVariable String id) {
        MessageResponse msg = messageService.getMessageById(id);
        return ResponseEntity.ok(ApiResponse.success("Message retrieved successfully", msg));
    }

    /**
     * GET /api/messages/search
     * Searches saved messages across message ID, sender, receiver, counterparty, or message type.
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> searchMessages(
            @RequestParam(value = "q", required = false, defaultValue = "") String query) {
        List<MessageResponse> results = messageService.searchMessages(query);
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved", results));
    }
}
