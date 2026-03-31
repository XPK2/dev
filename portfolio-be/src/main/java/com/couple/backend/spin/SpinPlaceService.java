package com.couple.backend.spin;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SpinPlaceService {

    private final SpinPlaceRepository repo;

    public List<SpinPlace> getByCategory(String category) {
        return repo.findByCategoryOrderByCreatedAtAsc(category);
    }

    public List<SpinPlace> getAll() {
        return repo.findAllByOrderByCategoryAscCreatedAtAsc();
    }

    public SpinPlace create(Map<String, String> body, Long userId) {
        SpinPlace place = new SpinPlace();
        place.setName(body.get("name").trim());
        place.setCategory(body.getOrDefault("category", "food"));
        String address = body.get("address");
        place.setAddress(address != null ? address.trim() : null);
        place.setCreatedBy(userId);
        return repo.save(place);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
