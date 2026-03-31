package com.couple.backend.settings;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CoupleSettingsRepository extends JpaRepository<CoupleSettings, Long> {
}
