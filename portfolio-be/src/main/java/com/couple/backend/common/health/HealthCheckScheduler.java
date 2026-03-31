package com.couple.backend.common.health;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Scheduled health check — chạy mỗi 5 phút.
 * Mục đích:
 *   1. Keep-alive cho Render.com free tier (tránh sleep sau 15 phút idle)
 *   2. Kiểm tra DB connection còn sống
 *   3. Log trạng thái hệ thống
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HealthCheckScheduler {

    private final JdbcTemplate jdbcTemplate;
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Chạy mỗi 5 phút (300,000ms).
     * fixedDelay = chờ 5 phút sau khi lần trước XONG mới chạy tiếp.
     * initialDelay = chờ 30 giây sau khi app start mới chạy lần đầu.
     */
    @Scheduled(fixedDelay = 300_000, initialDelay = 30_000)
    public void runHealthCheck() {
        String time = LocalDateTime.now().format(FMT);
        try {
            // Ping database
            Integer dbResult = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            boolean dbOk = Integer.valueOf(1).equals(dbResult);

            // Kiểm tra bộ nhớ JVM
            Runtime rt = Runtime.getRuntime();
            long usedMb  = (rt.totalMemory() - rt.freeMemory()) / 1_048_576;
            long totalMb = rt.totalMemory() / 1_048_576;
            long maxMb   = rt.maxMemory() / 1_048_576;

            log.info("[HealthCheck] {} | DB={} | Mem={}MB/{}MB (max {}MB)",
                    time,
                    dbOk ? "OK" : "FAIL",
                    usedMb, totalMb, maxMb);

        } catch (Exception e) {
            log.error("[HealthCheck] {} | DB=FAIL | error={}", time, e.getMessage());
        }
    }
}
