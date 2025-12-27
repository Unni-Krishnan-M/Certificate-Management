package com.certify.config;

import com.certify.model.User;
import com.certify.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Override
    public void run(String... args) throws Exception {
        // Create test student if doesn't exist
        if (userRepository.findByUsername("student1").isEmpty()) {
            User student = new User();
            student.setUsername("student1");
            student.setPassword(passwordEncoder.encode("password123"));
            student.setFullName("John Student");
            student.setEmail("student1@example.com");
            student.setRole(User.Role.STUDENT);
            userRepository.save(student);
            System.out.println("Created test student: student1 / password123");
        }
        
        // Create test staff if doesn't exist
        if (userRepository.findByUsername("staff1").isEmpty()) {
            User staff = new User();
            staff.setUsername("staff1");
            staff.setPassword(passwordEncoder.encode("password123"));
            staff.setFullName("Jane Staff");
            staff.setEmail("staff1@example.com");
            staff.setRole(User.Role.STAFF);
            userRepository.save(staff);
            System.out.println("Created test staff: staff1 / password123");
        }
        
        System.out.println("Data seeding completed. Test users available:");
        System.out.println("Student: student1 / password123");
        System.out.println("Staff: staff1 / password123");
    }
}