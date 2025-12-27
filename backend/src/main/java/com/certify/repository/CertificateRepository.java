package com.certify.repository;

import com.certify.model.Certificate;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CertificateRepository extends MongoRepository<Certificate, String> {
    List<Certificate> findByStudentId(String studentId);
    List<Certificate> findByStatus(Certificate.Status status);
    List<Certificate> findByStudentNameContainingIgnoreCase(String studentName);
}
