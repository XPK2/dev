package com.couple.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@SpringBootApplication
@EnableScheduling
public class CoupleBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(CoupleBackendApplication.class, args);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Read from ALLOWED_ORIGINS env var (production) or fall back to localhost defaults
        String allowedOriginsEnv = System.getenv("ALLOWED_ORIGINS");
        List<String> origins;
        if (allowedOriginsEnv != null && !allowedOriginsEnv.isBlank()) {
            origins = Arrays.asList(allowedOriginsEnv.split(","));
        } else {
            origins = Arrays.asList(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174"
            );
        }

        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
