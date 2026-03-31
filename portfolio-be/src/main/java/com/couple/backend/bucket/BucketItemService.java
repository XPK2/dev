package com.couple.backend.bucket;

import com.couple.backend.common.exception.AppException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BucketItemService {

    @Autowired
    private BucketItemRepository repository;

    public List<BucketItem> getAll() {
        return repository.findAllByOrderByCreatedAtAsc();
    }

    public BucketItem create(String text, Long userId) {
        BucketItem item = new BucketItem();
        item.setText(text);
        item.setCreatedBy(userId);
        return repository.save(item);
    }

    public BucketItem toggle(Long id) {
        BucketItem item = repository.findById(id)
                .orElseThrow(() -> new AppException("NOT_FOUND", "Bucket item not found", 404));
        item.setCompleted(!item.isCompleted());
        return repository.save(item);
    }

    public BucketItem update(Long id, String text) {
        BucketItem item = repository.findById(id)
                .orElseThrow(() -> new AppException("NOT_FOUND", "Bucket item not found", 404));
        item.setText(text);
        return repository.save(item);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new AppException("NOT_FOUND", "Bucket item not found", 404);
        }
        repository.deleteById(id);
    }
}
