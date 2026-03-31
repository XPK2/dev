package com.couple.backend.rules;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FamilyRuleRepository extends JpaRepository<FamilyRule, Long> {
    List<FamilyRule> findAllByOrderByDisplayOrderAsc();
}
