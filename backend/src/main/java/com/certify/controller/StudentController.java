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
import org.springframework.web.multipart.MultipartFile;
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
    
    @PostMapping("/certificates/upload")
    public ResponseEntity<?> uploadCertificate(
            @RequestParam("certificateName") String certificateName,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            Certificate certificate = certificateService.uploadCertificate(
                authentication.getName(), certificateName, file
            );
            return ResponseEntity.ok(certificate);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/certificates")
    public ResponseEntity<List<Certificate>> getMyCertificates(Authentication authentication) {
        return ResponseEntity.ok(certificateService.getStudentCertificates(authentication.getName()));
    }
    
    @GetMapping("/certificates/{id}/download")
    public ResponseEntity<InputStreamResource> downloadCertificate(@PathVariable String id) {
        try {
            Certificate certificate = certificateService.getAllCertificates().stream()
                .filter(c -> c.getCertificateId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
            
            InputStreamResource resource = new InputStreamResource(
                fileStorageService.getFile(certificate.getFileId())
            );
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + certificate.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(certificate.getFileType()))
                .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/certificates/{id}/view")
    public ResponseEntity<InputStreamResource> viewCertificate(@PathVariable String id, Authentication authentication) {
        try {
            Certificate certificate = certificateService.getStudentCertificates(authentication.getName()).stream()
                .filter(c -> c.getCertificateId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Certificate not found or access denied"));
            
            InputStream fileStream = fileStorageService.getFile(certificate.getFileId());
            InputStreamResource resource = new InputStreamResource(fileStream);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + certificate.getFileName() + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .header("X-Content-Type-Options", "nosniff")
                .contentType(MediaType.parseMediaType(certificate.getFileType()))
                .body(resource);
        } catch (Exception e) {
            System.err.println("Error viewing certificate " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/certificates/{id}")
    public ResponseEntity<?> deleteCertificate(@PathVariable String id, Authentication authentication) {
        try {
            certificateService.deleteCertificate(id, authentication.getName());
            return ResponseEntity.ok(Map.of("message", "Certificate deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
