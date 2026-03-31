package com.couple.backend.anniversary;

public class UpdateSettingsRequest {
    private String startDate;
    private String user1Nickname;
    private String user2Nickname;

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getUser1Nickname() { return user1Nickname; }
    public void setUser1Nickname(String user1Nickname) { this.user1Nickname = user1Nickname; }

    public String getUser2Nickname() { return user2Nickname; }
    public void setUser2Nickname(String user2Nickname) { this.user2Nickname = user2Nickname; }
}
