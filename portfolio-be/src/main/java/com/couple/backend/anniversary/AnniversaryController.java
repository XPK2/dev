package com.couple.backend.anniversary;

import com.couple.backend.common.dto.ApiResponse;
import com.couple.backend.settings.CoupleSettings;
import com.couple.backend.settings.CoupleSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping("/api/v1/anniversary")
public class AnniversaryController {

    @Autowired
    private CoupleSettingsRepository settingsRepository;

    private LocalDate getStartDate() {
        return settingsRepository.findById(1L)
                .map(CoupleSettings::getStartDate)
                .orElse(LocalDate.of(2025, 12, 24));
    }

    @GetMapping("/days")
    public ApiResponse<AnniversaryResponse> getDaysCount() {
        LocalDate startDate = getStartDate();
        LocalDate today = LocalDate.now();
        long daysCount = ChronoUnit.DAYS.between(startDate, today);

        AnniversaryResponse response = new AnniversaryResponse(
            daysCount,
            startDate.toString(),
            today.toString(),
            "Đếm từ " + startDate + " đến nay"
        );

        return ApiResponse.success("Days count calculated", response);
    }

    @GetMapping("/details")
    public ApiResponse<AnniversaryDetailsResponse> getDetails() {
        LocalDate startDate = getStartDate();
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        long totalDays = ChronoUnit.DAYS.between(startDate, today);
        long totalHours = ChronoUnit.HOURS.between(startDate.atStartOfDay(), now);
        long totalMinutes = ChronoUnit.MINUTES.between(startDate.atStartOfDay(), now);

        long hours = (totalHours % 24);
        long minutes = (totalMinutes % 60);

        AnniversaryDetailsResponse response = new AnniversaryDetailsResponse(
            totalDays, hours, minutes, totalHours, totalMinutes,
            startDate.toString(), today.toString(), now.toString()
        );

        return ApiResponse.success("Anniversary details calculated", response);
    }

    @GetMapping("/settings")
    public ApiResponse<CoupleSettings> getSettings() {
        CoupleSettings settings = settingsRepository.findById(1L)
                .orElseGet(() -> {
                    CoupleSettings s = new CoupleSettings();
                    s.setId(1L);
                    s.setStartDate(LocalDate.of(2025, 12, 24));
                    s.setUser1Nickname("Huy");
                    s.setUser2Nickname("Hà");
                    return settingsRepository.save(s);
                });
        return ApiResponse.success("Settings retrieved", settings);
    }

    @PutMapping("/settings")
    public ApiResponse<CoupleSettings> updateSettings(@RequestBody UpdateSettingsRequest request) {
        CoupleSettings settings = settingsRepository.findById(1L).orElse(new CoupleSettings());
        settings.setId(1L);
        if (request.getStartDate() != null) settings.setStartDate(LocalDate.parse(request.getStartDate()));
        if (request.getUser1Nickname() != null) settings.setUser1Nickname(request.getUser1Nickname());
        if (request.getUser2Nickname() != null) settings.setUser2Nickname(request.getUser2Nickname());
        return ApiResponse.success("Settings updated", settingsRepository.save(settings));
    }
}
