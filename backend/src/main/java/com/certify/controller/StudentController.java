package com.certify.controller;

import com.certify.model.Certificate;
import com.certify.model.CertificateMetadata;
import com.certify.service.CertificateService;
import com.certify.service.FileStorageService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
public class StudentController {
    
    private final CertificateService certificateService;
    private final FileStorageService fileStorageService;
    
    public StudentController(CertificateService certificateService, FileStorageService fileStorageService) {
        this.certificateService = certificateService;
        this.fileStorageService = fileStorageService;
    }
    
    @GetMapping("/certificates")
    public ResponseEntity<List<Certificate>> getAllCertificates() {
        // Students can now view all certificates, just like staff
        return ResponseEntity.ok(certificateService.getAllCertificates());
    }
    
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testEndpoint() {
        return ResponseEntity.ok(Map.of(
            "message", "Student controller is working", 
            "timestamp", java.time.LocalDateTime.now().toString(),
            "status", "OK"
        ));
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        try {
            int certificateCount = certificateService.getAllCertificates().size();
            return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "certificateCount", certificateCount,
                "timestamp", java.time.LocalDateTime.now().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "status", "unhealthy",
                "error", e.getMessage(),
                "timestamp", java.time.LocalDateTime.now().toString()
            ));
        }
    }
    
    @GetMapping("/certificates/search")
    public ResponseEntity<List<Certificate>> searchCertificates(@RequestParam String studentName) {
        return ResponseEntity.ok(certificateService.searchCertificates(studentName));
    }
    
    @GetMapping("/certificates/status/{status}")
    public ResponseEntity<List<Certificate>> getCertificatesByStatus(@PathVariable Certificate.Status status) {
        return ResponseEntity.ok(certificateService.getCertificatesByStatus(status));
    }
    
    @GetMapping("/certificates/my")
    public ResponseEntity<List<Certificate>> getMyOwnCertificates(Authentication authentication) {
        // Endpoint to get only the student's own certificates if needed
        return ResponseEntity.ok(certificateService.getStudentCertificates(authentication.getName()));
    }
    
    @PostMapping("/certificates/upload")
    public ResponseEntity<?> uploadCertificate(
            @RequestParam("file") MultipartFile file,
            @RequestParam("certificateName") String certificateName,
            @RequestParam(value = "certificateType", required = false) String certificateType,
            @RequestParam(value = "issuingOrganization", required = false) String issuingOrganization,
            @RequestParam(value = "issueYear", required = false) String issueYear,
            @RequestParam(value = "department", required = false) String department,
            Authentication authentication) {
        try {
            System.out.println("StudentController: Upload request received");
            System.out.println("StudentController: File name: " + file.getOriginalFilename());
            System.out.println("StudentController: File size: " + file.getSize());
            System.out.println("StudentController: Certificate name: " + certificateName);
            System.out.println("StudentController: Certificate type: " + certificateType);
            System.out.println("StudentController: Issuing organization: " + issuingOrganization);
            System.out.println("StudentController: User: " + authentication.getName());
            
            Certificate certificate = certificateService.uploadCertificate(
                authentication.getName(), certificateName, file
            );
            
            // Set additional metadata if provided
            if (certificateType != null || issuingOrganization != null || issueYear != null || department != null) {
                CertificateMetadata metadata = new CertificateMetadata();
                metadata.setCertificateType(certificateType);
                metadata.setIssuingOrganization(issuingOrganization);
                metadata.setIssueYear(issueYear);
                metadata.setDepartment(department);
                certificate.setMetadata(metadata);
                
                // Save the certificate again with metadata
                certificate = certificateService.saveCertificate(certificate);
            }
            
            System.out.println("StudentController: Upload successful, certificate ID: " + certificate.getCertificateId());
            return ResponseEntity.ok(certificate);
        } catch (Exception e) {
            System.err.println("StudentController: Upload failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/certificates/{id}/view")
    public ResponseEntity<?> viewCertificate(@PathVariable String id, Authentication authentication) {
        System.out.println("StudentController: viewCertificate called with ID: " + id);
        
        try {
            if (id == null || id.trim().isEmpty()) {
                System.out.println("StudentController: Empty certificate ID provided");
                return ResponseEntity.badRequest().body(Map.of("error", "Certificate ID is required"));
            }
            
            List<Certificate> allCertificates = certificateService.getAllCertificates();
            System.out.println("StudentController: Total certificates: " + allCertificates.size());
            
            // Log all certificate IDs for debugging
            allCertificates.forEach(cert -> 
                System.out.println("StudentController: Available certificate ID: " + cert.getCertificateId())
            );
            
            Certificate certificate = allCertificates.stream()
                .filter(c -> id.equals(c.getCertificateId()))
                .findFirst()
                .orElse(null);
            
            if (certificate == null) {
                System.out.println("StudentController: Certificate not found: " + id);
                return ResponseEntity.status(404).body(Map.of("error", "Certificate not found"));
            }
            
            System.out.println("StudentController: Found certificate: " + certificate.getCertificateName());
            System.out.println("StudentController: Certificate file ID: " + certificate.getFileId());
            
            if (certificate.getFileId() == null || certificate.getFileId().trim().isEmpty()) {
                System.out.println("StudentController: No file ID for certificate: " + id);
                return ResponseEntity.status(404).body(Map.of(
                    "error", "File not found", 
                    "message", "This certificate does not have an associated file. It may be a sample certificate."
                ));
            }
            
            InputStream fileStream = fileStorageService.getFile(certificate.getFileId());
            if (fileStream == null) {
                System.out.println("StudentController: File stream is null for: " + certificate.getFileId());
                return ResponseEntity.status(404).body(Map.of("error", "File not accessible"));
            }
            
            InputStreamResource resource = new InputStreamResource(fileStream);
            String contentType = certificate.getFileType() != null ? certificate.getFileType() : "application/octet-stream";
            
            System.out.println("StudentController: Returning file with content type: " + contentType);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + certificate.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
                
        } catch (Exception e) {
            System.err.println("StudentController: Error in viewCertificate: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }
    
    @GetMapping("/certificates/{id}/download")
    public ResponseEntity<InputStreamResource> downloadCertificate(
            @PathVariable String id,
            Authentication authentication) {
        try {
            System.out.println("StudentController: Downloading certificate " + id + " for student " + authentication.getName());
            
            Certificate certificate = certificateService.getAllCertificates().stream()
                .filter(c -> c.getCertificateId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
            
            InputStream fileStream = fileStorageService.getFile(certificate.getFileId());
            InputStreamResource resource = new InputStreamResource(fileStream);
            
            String contentType = certificate.getFileType();
            if (contentType == null || contentType.isEmpty()) {
                contentType = "application/octet-stream";
            }
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + certificate.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
        } catch (Exception e) {
            System.err.println("StudentController: Error downloading certificate " + id + " for student " + authentication.getName() + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/certificates/{id}")
    public ResponseEntity<?> deleteCertificate(
            @PathVariable String id,
            Authentication authentication) {
        try {
            // Students can only delete their own certificates
            certificateService.deleteCertificate(id, authentication.getName());
            return ResponseEntity.ok(Map.of("message", "Certificate deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}