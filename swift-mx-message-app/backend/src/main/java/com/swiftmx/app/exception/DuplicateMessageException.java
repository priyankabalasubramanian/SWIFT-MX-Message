package com.swiftmx.app.exception;

public class DuplicateMessageException extends RuntimeException {
    public DuplicateMessageException(String message) {
        super(message);
    }
}
