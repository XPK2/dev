package com.couple.backend.common.health;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Scheduled health check — runs every 5 minutes.
 * Purpose:
 *   1. Keep-alive for Render.com free tier (prevents sleep after 15 min idle)
 *   2. Verify DB connection is alive
 *   3. Log system memory stats
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HealthCheckScheduler {

    private final JdbcTemplate jdbcTemplate;
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Runs every 5 minutes (300,000 ms).
     * fixedDelay = waits 5 min after previous run COMPLETES before running again.
     * initialDelay = waits 30 s after app startup before first run.
     */
    @Scheduled(fixedDelay = 300_000, initialDelay = 30_000)
    public void runHealthCheck() {
        String time = LocalDateTime.now().format(FMT);
        try {
            // Ping database
            Integer dbResult = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            boolean dbOk = Integer.valueOf(1).equals(dbResult);

            // JVM memory stats
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
