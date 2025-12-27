package com.certify.model;

public class CertificateMetadata {
    private String certificateType;
    private String issuingOrganization;
    private String issueYear;
    private String department;
    
    // Getters and Setters
    public String getCertificateType() { return certificateType; }
    public void setCertificateType(String certificateType) { this.certificateType = certificateType; }
    
    public String getIssuingOrganization() { return issuingOrganization; }
    public void setIssuingOrganization(String issuingOrganization) { this.issuingOrganization = issuingOrganization; }
    
    public String getIssueYear() { return issueYear; }
    public void setIssueYear(String issueYear) { this.issueYear = issueYear; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}