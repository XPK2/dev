package com.couple.backend.events;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CoupleEventRepository extends JpaRepository<CoupleEvent, Long> {
    List<CoupleEvent> findByEventDateGreaterThanEqualOrderByEventDateAsc(LocalDate date);
}
