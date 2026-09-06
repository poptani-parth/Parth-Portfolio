package com.parth.portfolio.common.exception;

/** Indicates that the reset message could not be delivered; its cause is logged server-side only. */
public class PasswordResetDeliveryException extends RuntimeException {
    public PasswordResetDeliveryException(Throwable cause) {
        super("Password reset delivery failed", cause);
    }
}
