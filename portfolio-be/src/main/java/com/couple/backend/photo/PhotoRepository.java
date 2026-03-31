package com.couple.backend.photo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {

    // Fetch all photos sorted by taken_date DESC then created_at DESC
    List<Photo> findAllByOrderByTakenDateDescCreatedAtDesc();

    @Query("SELECT p FROM Photo p ORDER BY p.takenDate DESC, p.createdAt DESC")
    List<Photo> findAllSorted();
}
