package com.certify.controller;

import com.certify.model.Certificate;
import com.certify.service.CertificateService;
import com.certify.service.FileStorageService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
public class StaffController {
    
    private final CertificateService certificateService;
    private final FileStorageService fileStorageService;
    
    public StaffController(CertificateService certificateService, FileStorageService fileStorageService) {
        this.certificateService = certificateService;
        this.fileStorageService = fileStorageService;
    }
    
    @GetMapping("/certificates")
    public ResponseEntity<List<Certificate>> getAllCertificates() {
        return ResponseEntity.ok(certificateService.getAllCertificates());
    }
    
    @GetMapping("/certificates/search")
    public ResponseEntity<List<Certificate>> searchCertificates(@RequestParam String studentName) {
        return ResponseEntity.ok(certificateService.searchCertificates(studentName));
    }
    
    @GetMapping("/certificates/status/{status}")
    public ResponseEntity<List<Certificate>> getCertificatesByStatus(@PathVariable Certificate.Status status) {
        return ResponseEntity.ok(certificateService.getCertificatesByStatus(status));
    }
    
    @PutMapping("/certificates/{id}/verify")
    public ResponseEntity<?> verifyCertificate(
            @PathVariable String id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            Certificate certificate = certificateService.verifyCertificate(
                id, authentication.getName(), request.get("remarks")
            );
            return ResponseEntity.ok(certificate);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/certificates/{id}/reject")
    public ResponseEntity<?> rejectCertificate(
            @PathVariable String id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            Certificate certificate = certificateService.rejectCertificate(
                id, authentication.getName(), request.get("remarks")
            );
            return ResponseEntity.ok(certificate);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/certificates/{id}/view")
    public ResponseEntity<?> viewCertificate(
            @PathVariable String id,
            @RequestParam(required = false) String token) {
        try {
            System.out.println("StaffController: Viewing certificate " + id);
            
            // Get all certificates and log them for debugging
            List<Certificate> allCertificates = certificateService.getAllCertificates();
            System.out.println("StaffController: Found " + allCertificates.size() + " total certificates");
            
            Certificate certificate = allCertificates.stream()
                .filter(c -> c.getCertificateId().equals(id))
                .findFirst()
                .orElse(null);
            
            if (certificate == null) {
                System.err.println("Certificate not found with ID: " + id);
                return ResponseEntity.status(404).body(Map.of(
                    "error", "Certificate not found",
                    "certificateId", id,
                    "availableIds", allCertificates.stream().map(Certificate::getCertificateId).toList()
                ));
            }
            
            System.out.println("StaffController: Found certificate: " + certificate.getCertificateName() + 
                             ", FileId: " + certificate.getFileId() + 
                             ", FileType: " + certificate.getFileType() +
                             ", FileName: " + certificate.getFileName());
            
            if (certificate.getFileId() == null || certificate.getFileId().isEmpty()) {
                System.err.println("Certificate has no file ID: " + certificate.getCertificateId());
                return ResponseEntity.status(404).body(Map.of(
                    "error", "Certificate file not found",
                    "certificateId", id
                ));
            }
            
            InputStream fileStream = fileStorageService.getFile(certificate.getFileId());
            if (fileStream == null) {
                System.err.println("File not found for fileId: " + certificate.getFileId());
                return ResponseEntity.status(404).body(Map.of(
                    "error", "File not found in storage",
                    "fileId", certificate.getFileId()
                ));
            }
            
            InputStreamResource resource = new InputStreamResource(fileStream);
            
            // Determine content type - handle null/empty file types
            String contentType = certificate.getFileType();
            if (contentType == null || contentType.isEmpty()) {
                contentType = "application/octet-stream";
            }
            
            System.out.println("StaffController: Returning file with content type: " + contentType);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + certificate.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
        } catch (Exception e) {
            System.err.println("Error viewing certificate " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Internal server error: " + e.getMessage(),
                "certificateId", id
            ));
        }
    }
    
    @GetMapping("/certificates/{id}/download")
    public ResponseEntity<InputStreamResource> downloadCertificate(
            @PathVariable String id,
            @RequestParam(required = false) String token) {
        try {
            System.out.println("StaffController: Downloading certificate " + id);
            
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
            System.err.println("Error downloading certificate " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
}
