package com.couple.backend.anniversary;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnniversaryResponse {
    private long days;
    private String startDate;
    private String endDate;
    private String description;
}
