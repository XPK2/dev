package com.couple.backend.rules;

import com.couple.backend.common.exception.AppException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FamilyRuleService {

    @Autowired
    private FamilyRuleRepository repository;

    public List<FamilyRule> getAll() {
        return repository.findAllByOrderByDisplayOrderAsc();
    }

    public FamilyRule create(String content, Long userId) {
        int nextOrder = repository.findAllByOrderByDisplayOrderAsc().size() + 1;
        FamilyRule rule = new FamilyRule();
        rule.setContent(content);
        rule.setDisplayOrder(nextOrder);
        rule.setCreatedBy(userId);
        return repository.save(rule);
    }

    public FamilyRule update(Long id, String content) {
        FamilyRule rule = repository.findById(id)
                .orElseThrow(() -> new AppException("NOT_FOUND", "Rule not found", 404));
        rule.setContent(content);
        return repository.save(rule);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new AppException("NOT_FOUND", "Rule not found", 404);
        }
        repository.deleteById(id);
    }
}
