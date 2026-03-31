package com.couple.backend.common.health;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Scheduled health check — runs every 2 minutes.
 * Purpose:
 *   1. Self HTTP ping to prevent Render.com free tier from sleeping
 *   2. Verify DB connection is alive
 *   3. Log JVM memory stats
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HealthCheckScheduler {

    private final JdbcTemplate jdbcTemplate;

    // Render injects this automatically as RENDER_EXTERNAL_URL
    @Value("${RENDER_EXTERNAL_URL:}")
    private String renderExternalUrl;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Runs every 2 minutes (120,000 ms).
     * initialDelay = 60s to wait for app fully ready before first self-ping.
     */
    @Scheduled(fixedDelay = 120_000, initialDelay = 60_000)
    public void runHealthCheck() {
        String time = LocalDateTime.now().format(FMT);

        // 1. Ping DB
        boolean dbOk = false;
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            dbOk = Integer.valueOf(1).equals(result);
        } catch (Exception e) {
            log.error("[HealthCheck] {} | DB=FAIL | {}", time, e.getMessage());
        }

        // 2. Self HTTP ping — keeps Render free tier awake
        String httpStatus = "SKIP";
        if (renderExternalUrl != null && !renderExternalUrl.isBlank()) {
            try {
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(renderExternalUrl + "/actuator/health"))
                        .timeout(Duration.ofSeconds(10))
                        .GET()
                        .build();
                HttpResponse<Void> response = HTTP_CLIENT.send(
                        request, HttpResponse.BodyHandlers.discarding());
                httpStatus = response.statusCode() == 200 ? "OK" : "FAIL(" + response.statusCode() + ")";
            } catch (Exception e) {
                httpStatus = "FAIL(" + e.getMessage() + ")";
            }
        }

        // 3. JVM memory stats
        Runtime rt = Runtime.getRuntime();
        long usedMb  = (rt.totalMemory() - rt.freeMemory()) / 1_048_576;
        long totalMb = rt.totalMemory() / 1_048_576;
        long maxMb   = rt.maxMemory()   / 1_048_576;

        log.info("[HealthCheck] {} | DB={} | HTTP={} | Mem={}MB/{}MB (max {}MB)",
                time, dbOk ? "OK" : "FAIL", httpStatus, usedMb, totalMb, maxMb);
    }
}
