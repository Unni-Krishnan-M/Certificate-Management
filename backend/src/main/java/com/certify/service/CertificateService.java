package com.certify.service;

import com.certify.model.Certificate;
import com.certify.model.User;
import com.certify.repository.CertificateRepository;
import com.certify.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class CertificateService {
    
    private final CertificateRepository certificateRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    
    public CertificateService(CertificateRepository certificateRepository, 
                            UserRepository userRepository,
                            FileStorageService fileStorageService) {
        this.certificateRepository = certificateRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }
    
    public Certificate uploadCertificate(String username, String certificateName, MultipartFile file) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        try {
            String fileId = fileStorageService.storeFile(file);
            
            Certificate certificate = new Certificate();
            certificate.setStudentId(user.getId());
            certificate.setStudentName(user.getFullName());
            certificate.setCertificateName(certificateName);
            certificate.setFileId(fileId);
            certificate.setFileName(file.getOriginalFilename());
            certificate.setFileType(file.getContentType());
            certificate.setUploadDate(LocalDateTime.now());
            certificate.setStatus(Certificate.Status.PENDING);
            
            return certificateRepository.save(certificate);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload certificate: " + e.getMessage());
        }
    }
    
    public List<Certificate> getStudentCertificates(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return certificateRepository.findByStudentId(user.getId());
    }
    
    public List<Certificate> getAllCertificates() {
        return certificateRepository.findAll();
    }
    
    public List<Certificate> searchCertificates(String studentName) {
        return certificateRepository.findByStudentNameContainingIgnoreCase(studentName);
    }
    
    public List<Certificate> getCertificatesByStatus(Certificate.Status status) {
        return certificateRepository.findByStatus(status);
    }
    
    public Certificate verifyCertificate(String certificateId, String staffUsername, String remarks) {
        Certificate certificate = certificateRepository.findById(certificateId)
            .orElseThrow(() -> new RuntimeException("Certificate not found"));
        
        certificate.setStatus(Certificate.Status.VERIFIED);
        certificate.setStaffRemarks(remarks);
        certificate.setVerifiedBy(staffUsername);
        certificate.setVerifiedDate(LocalDateTime.now());
        
        return certificateRepository.save(certificate);
    }
    
    public Certificate rejectCertificate(String certificateId, String staffUsername, String remarks) {
        Certificate certificate = certificateRepository.findById(certificateId)
            .orElseThrow(() -> new RuntimeException("Certificate not found"));
        
        certificate.setStatus(Certificate.Status.REJECTED);
        certificate.setStaffRemarks(remarks);
        certificate.setVerifiedBy(staffUsername);
        certificate.setVerifiedDate(LocalDateTime.now());
        
        return certificateRepository.save(certificate);
    }
    
    public void deleteCertificate(String certificateId, String username) {
        Certificate certificate = certificateRepository.findById(certificateId)
            .orElseThrow(() -> new RuntimeException("Certificate not found"));
        
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!certificate.getStudentId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this certificate");
        }
        
        fileStorageService.deleteFile(certificate.getFileId());
        certificateRepository.deleteById(certificateId);
    }
    
    public Map<String, Object> getStudentAnalytics(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Certificate> certificates = certificateRepository.findByStudentId(user.getId());
        
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalUploaded", certificates.size());
        analytics.put("verified", certificates.stream().mapToInt(c -> c.getStatus() == Certificate.Status.VERIFIED ? 1 : 0).sum());
        analytics.put("pending", certificates.stream().mapToInt(c -> c.getStatus() == Certificate.Status.PENDING ? 1 : 0).sum());
        analytics.put("rejected", certificates.stream().mapToInt(c -> c.getStatus() == Certificate.Status.REJECTED ? 1 : 0).sum());
        analytics.put("recentUploads", certificates.stream()
            .sorted((a, b) -> b.getUploadDate().compareTo(a.getUploadDate()))
            .limit(5)
            .toList());
        
        return analytics;
    }
    
    public Map<String, Object> getStaffAnalytics() {
        List<Certificate> allCertificates = certificateRepository.findAll();
        
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalCertificates", allCertificates.size());
        analytics.put("pendingReview", allCertificates.stream().mapToInt(c -> c.getStatus() == Certificate.Status.PENDING ? 1 : 0).sum());
        analytics.put("verified", allCertificates.stream().mapToInt(c -> c.getStatus() == Certificate.Status.VERIFIED ? 1 : 0).sum());
        analytics.put("rejected", allCertificates.stream().mapToInt(c -> c.getStatus() == Certificate.Status.REJECTED ? 1 : 0).sum());
        analytics.put("recentActivity", allCertificates.stream()
            .sorted((a, b) -> b.getUploadDate().compareTo(a.getUploadDate()))
            .limit(10)
            .toList());
        
        return analytics;
    }
}
