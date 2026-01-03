package com.certify.config;

import com.certify.model.User;
import com.certify.model.Certificate;
import com.certify.repository.UserRepository;
import com.certify.repository.CertificateRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final CertificateRepository certificateRepository;
    private final PasswordEncoder passwordEncoder;
    
    public DataLoader(UserRepository userRepository, CertificateRepository certificateRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.certificateRepository = certificateRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Override
    public void run(String... args) throws Exception {
        // Create sample users if they don't exist
        if (!userRepository.existsByUsername("student1")) {
            User student = new User();
            student.setUsername("student1");
            student.setPassword(passwordEncoder.encode("password123"));
            student.setFullName("John Student");
            student.setEmail("student1@example.com");
            student.setRole(User.Role.STUDENT);
            userRepository.save(student);
            System.out.println("Created sample student: student1");
        }
        
        if (!userRepository.existsByUsername("unni")) {
            User unni = new User();
            unni.setUsername("unni");
            unni.setPassword(passwordEncoder.encode("password123"));
            unni.setFullName("Unni Krishnan");
            unni.setEmail("unni@example.com");
            unni.setRole(User.Role.STUDENT);
            userRepository.save(unni);
            System.out.println("Created sample student: unni");
        }
        
        if (!userRepository.existsByUsername("staff1")) {
            User staff = new User();
            staff.setUsername("staff1");
            staff.setPassword(passwordEncoder.encode("password123"));
            staff.setFullName("Jane Staff");
            staff.setEmail("staff1@example.com");
            staff.setRole(User.Role.STAFF);
            userRepository.save(staff);
            System.out.println("Created sample staff: staff1");
        }
        
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("Admin User");
            admin.setEmail("admin@example.com");
            admin.setRole(User.Role.STAFF);
            userRepository.save(admin);
            System.out.println("Created admin user: admin");
        }
        
        // Create sample certificates if none exist
        if (certificateRepository.count() == 0) {
            System.out.println("Creating sample certificates...");
            
            // Note: These are placeholder certificates without actual files
            // In a real application, you would upload actual certificate files
            Certificate cert1 = new Certificate();
            cert1.setCertificateId("sample-cert-1");
            cert1.setCertificateName("Java Programming Certificate");
            cert1.setStudentName("John Student");
            cert1.setStaffRemarks("Certificate of completion for Java Programming course");
            cert1.setStatus(Certificate.Status.VERIFIED);
            cert1.setFileName("java-cert.pdf");
            cert1.setFileType("application/pdf");
            cert1.setUploadDate(java.time.LocalDateTime.now().minusDays(5));
            // Note: fileId is null - this will cause the 404 error we're seeing
            certificateRepository.save(cert1);
            
            Certificate cert2 = new Certificate();
            cert2.setCertificateId("sample-cert-2");
            cert2.setCertificateName("Web Development Certificate");
            cert2.setStudentName("Unni Krishnan");
            cert2.setStaffRemarks("Certificate of completion for Web Development course");
            cert2.setStatus(Certificate.Status.PENDING);
            cert2.setFileName("web-dev-cert.pdf");
            cert2.setFileType("application/pdf");
            cert2.setUploadDate(java.time.LocalDateTime.now().minusDays(2));
            // Note: fileId is null - this will cause the 404 error we're seeing
            certificateRepository.save(cert2);
            
            System.out.println("Created sample certificates (without files)");
            System.out.println("Note: Certificate files are not available - upload real certificates to view them");
        }
        
        System.out.println("Data initialization completed");
        System.out.println("Data seeding completed. Test users available:");
        System.out.println("Student: student1 / password123");
        System.out.println("Student: unni / password123");
        System.out.println("Staff: staff1 / password123");
    }
}