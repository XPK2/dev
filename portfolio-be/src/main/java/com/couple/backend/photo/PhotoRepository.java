package com.couple.backend.photo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {

    // Lấy tất cả ảnh, sort theo taken_date DESC, createdAt DESC
    // Chỉ lấy metadata (không lấy data) cho list view — dùng projection
    List<Photo> findAllByOrderByTakenDateDescCreatedAtDesc();

    @Query("SELECT p FROM Photo p ORDER BY p.takenDate DESC, p.createdAt DESC")
    List<Photo> findAllSorted();
}
