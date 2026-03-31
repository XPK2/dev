package com.couple.backend;

import com.couple.backend.auth.entity.User;
import com.couple.backend.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import jakarta.annotation.PostConstruct;

@TestConfiguration
public class TestDataSetup {
    
    @Bean
    public TestDataInitializer testDataInitializer(UserRepository userRepository) {
        return new TestDataInitializer(userRepository);
    }
    
    public static class TestDataInitializer {
        private final UserRepository userRepository;
        
        public TestDataInitializer(UserRepository userRepository) {
            this.userRepository = userRepository;
        }
        
        @PostConstruct
        public void setupTestData() {
            // Create test users if they don't exist
            if (userRepository.count() == 0) {
                User user1 = new User();
                user1.setId(1L);
                user1.setCode("101203");
                user1.setName("Huy");
                userRepository.save(user1);
                
                User user2 = new User();
                user2.setId(2L);
                user2.setCode("030403");
                user2.setName("Hà");
                userRepository.save(user2);
            }
        }
    }
}
