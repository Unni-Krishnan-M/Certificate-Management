package com.certify.controller;

import com.certify.service.CertificateService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    
    private final CertificateService certificateService;
    
    public AnalyticsController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }
    
    @GetMapping("/student/dashboard")
    public ResponseEntity<Map<String, Object>> getStudentAnalytics(Authentication authentication) {
        Map<String, Object> analytics = certificateService.getStudentAnalytics(authentication.getName());
        return ResponseEntity.ok(analytics);
    }
    
    @GetMapping("/staff/dashboard")
    public ResponseEntity<Map<String, Object>> getStaffAnalytics() {
        Map<String, Object> analytics = certificateService.getStaffAnalytics();
        return ResponseEntity.ok(analytics);
    }
}