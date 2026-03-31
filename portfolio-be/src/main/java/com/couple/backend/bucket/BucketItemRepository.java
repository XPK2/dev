package com.couple.backend.bucket;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BucketItemRepository extends JpaRepository<BucketItem, Long> {
    List<BucketItem> findAllByOrderByCreatedAtAsc();
}
