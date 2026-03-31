package com.couple.backend.spin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpinPlaceRepository extends JpaRepository<SpinPlace, Long> {

    List<SpinPlace> findByCategoryOrderByCreatedAtAsc(String category);

    List<SpinPlace> findAllByOrderByCategoryAscCreatedAtAsc();
}
