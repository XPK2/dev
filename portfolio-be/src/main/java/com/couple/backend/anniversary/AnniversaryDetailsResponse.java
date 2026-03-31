package com.couple.backend.anniversary;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnniversaryDetailsResponse {
    private long days;
    private long hours;
    private long minutes;
    private long totalHours;
    private long totalMinutes;
    private String startDate;
    private String endDate;
    private String timestamp;
}
