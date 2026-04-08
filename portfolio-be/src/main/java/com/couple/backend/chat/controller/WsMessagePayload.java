package com.couple.backend.chat.controller;

public class WsMessagePayload {
    private Long receiverId;
    private String content;
    private String type; // "message" | "typing" | "online"

    public WsMessagePayload() {}

    public WsMessagePayload(Long receiverId, String content, String type) {
        this.receiverId = receiverId;
        this.content = content;
        this.type = type;
    }

    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getType() { return type != null ? type : "message"; }
    public void setType(String type) { this.type = type; }
}
