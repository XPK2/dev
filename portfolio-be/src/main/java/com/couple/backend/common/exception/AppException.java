package com.couple.backend.common.exception;

public class AppException extends RuntimeException {
    private String code;
    private int httpStatus;

    public AppException(String code, String message, int httpStatus) {
        super(message);
        this.code = code;
        this.httpStatus = httpStatus;
    }

    public AppException(String message, int httpStatus) {
        super(message);
        this.code = "ERROR";
        this.httpStatus = httpStatus;
    }

    public String getCode() {
        return code;
    }

    public int getHttpStatus() {
        return httpStatus;
    }
}
