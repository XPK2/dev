package com.couple.backend.auth.dto;

public class UserResponse {
    private Long id;
    private String code;
    private String name;
    private String avatar;

    public UserResponse() {}

    public UserResponse(Long id, String code, String name, String avatar) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.avatar = avatar;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
}
