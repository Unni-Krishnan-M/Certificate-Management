package com.certify.service;

import com.mongodb.client.gridfs.model.GridFSFile;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;

@Service
public class FileStorageService {
    
    private final GridFsTemplate gridFsTemplate;
    
    public FileStorageService(GridFsTemplate gridFsTemplate) {
        this.gridFsTemplate = gridFsTemplate;
    }
    
    public String storeFile(MultipartFile file) throws IOException {
        return gridFsTemplate.store(
            file.getInputStream(),
            file.getOriginalFilename(),
            file.getContentType()
        ).toString();
    }
    
    public InputStream getFile(String fileId) {
        try {
            GridFSFile file = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(fileId)));
            if (file == null) {
                System.out.println("FileStorageService: File not found with ID: " + fileId);
                return null;
            }
            return gridFsTemplate.getResource(file).getInputStream();
        } catch (Exception e) {
            System.err.println("FileStorageService: Error retrieving file " + fileId + ": " + e.getMessage());
            return null;
        }
    }
    
    public void deleteFile(String fileId) {
        gridFsTemplate.delete(new Query(Criteria.where("_id").is(fileId)));
    }
}
