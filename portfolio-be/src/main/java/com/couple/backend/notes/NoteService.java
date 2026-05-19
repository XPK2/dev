package com.couple.backend.notes;

import com.couple.backend.common.exception.AppException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoteService {

    @Autowired
    private NoteRepository repository;

    public List<Note> getAll() {
        return repository.findAllByOrderByPinnedDescUpdatedAtDesc();
    }

    public Note create(String title, String content, String color, Long userId) {
        Note note = new Note();
        note.setTitle(title);
        note.setContent(content);
        note.setColor(color);
        note.setCreatedBy(userId);
        return repository.save(note);
    }

    public Note update(Long id, String title, String content, String color) {
        Note note = repository.findById(id)
                .orElseThrow(() -> new AppException("NOT_FOUND", "Note not found", 404));
        note.setTitle(title);
        note.setContent(content);
        note.setColor(color);
        return repository.save(note);
    }

    public Note togglePin(Long id) {
        Note note = repository.findById(id)
                .orElseThrow(() -> new AppException("NOT_FOUND", "Note not found", 404));
        note.setPinned(!note.isPinned());
        return repository.save(note);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new AppException("NOT_FOUND", "Note not found", 404);
        }
        repository.deleteById(id);
    }
}