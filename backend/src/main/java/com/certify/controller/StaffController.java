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
    public ResponseEntity<InputStreamResource> viewCertificate(@PathVariable String id) {
        try {
            Certificate certificate = certificateService.getAllCertificates().stream()
                .filter(c -> c.getCertificateId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
            
            InputStreamResource resource = new InputStreamResource(
                fileStorageService.getFile(certificate.getFileId())
            );
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + certificate.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(certificate.getFileType()))
                .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
