package com.certify.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "certificates")
public class Certificate {
    @Id
    private String certificateId;
    
    private String studentId;
    private String studentName;
    private String certificateName;
    private String fileUrl;
    private String fileId;
    private String fileName;
    private String fileType;
    private LocalDateTime uploadDate;
    private Status status;
    private String staffRemarks;
    private String verifiedBy;
    private LocalDateTime verifiedDate;
    private CertificateMetadata metadata;
    
    public enum Status {
        PENDING, VERIFIED, REJECTED
    }
    
    // Getters and Setters
    public String getCertificateId() { return certificateId; }
    public void setCertificateId(String certificateId) { this.certificateId = certificateId; }
    
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    
    public String getCertificateName() { return certificateName; }
    public void setCertificateName(String certificateName) { this.certificateName = certificateName; }
    
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    
    public String getFileId() { return fileId; }
    public void setFileId(String fileId) { this.fileId = fileId; }
    
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    
    public LocalDateTime getUploadDate() { return uploadDate; }
    public void setUploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; }
    
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    
    public String getStaffRemarks() { return staffRemarks; }
    public void setStaffRemarks(String staffRemarks) { this.staffRemarks = staffRemarks; }
    
    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }
    
    public LocalDateTime getVerifiedDate() { return verifiedDate; }
    public void setVerifiedDate(LocalDateTime verifiedDate) { this.verifiedDate = verifiedDate; }
    
    public CertificateMetadata getMetadata() { return metadata; }
    public void setMetadata(CertificateMetadata metadata) { this.metadata = metadata; }
}
