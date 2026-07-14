package com.eushop.core.controller;

import com.eushop.core.dto.ApiResponse;
import com.eushop.core.entity.Dac7AnnualSnapshot;
import com.eushop.core.service.Dac7Service;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dac7")
public class Dac7Controller {

    private final Dac7Service dac7Service;

    public Dac7Controller(Dac7Service dac7Service) {
        this.dac7Service = dac7Service;
    }

    private boolean isNotAdmin(String role) {
        return !"ADMIN".equalsIgnoreCase(role);
    }

    @PostMapping("/calculate")
    public ResponseEntity<ApiResponse<List<Dac7AnnualSnapshot>>> calculateSnapshots(
            @RequestParam int year,
            @RequestHeader(value = "X-User-Role", required = false) String role) {

        if (isNotAdmin(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access Denied: Admin authorization required"));
        }

        List<Dac7AnnualSnapshot> snapshots = dac7Service.generateSnapshotsForYear(year);
        return ResponseEntity.ok(ApiResponse.success(snapshots, "DAC7 snapshots calculated successfully for " + year));
    }

    @GetMapping("/report")
    public ResponseEntity<ApiResponse<List<Dac7AnnualSnapshot>>> getDac7Report(
            @RequestParam int year,
            @RequestParam(defaultValue = "false") boolean reportableOnly,
            @RequestHeader(value = "X-User-Role", required = false) String role) {

        if (isNotAdmin(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access Denied: Admin authorization required"));
        }

        List<Dac7AnnualSnapshot> report = reportableOnly 
                ? dac7Service.getReportableSellers(year)
                : dac7Service.generateSnapshotsForYear(year); // Fetch and refresh
        
        return ResponseEntity.ok(ApiResponse.success(report, "DAC7 annual report retrieved successfully"));
    }

    @GetMapping("/export")
    public ResponseEntity<?> exportDac7Xml(
            @RequestParam int year,
            @RequestHeader(value = "X-User-Role", required = false) String role) {

        if (isNotAdmin(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access Denied: Admin authorization required"));
        }

        String xmlContent = dac7Service.exportXmlForYear(year);
        byte[] xmlBytes = xmlContent.getBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=dac7-report-" + year + ".xml")
                .contentType(MediaType.APPLICATION_XML)
                .contentLength(xmlBytes.length)
                .body(xmlBytes);
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<Void>> submitReport(
            @RequestBody Map<String, List<String>> request,
            @RequestHeader(value = "X-User-Role", required = false) String role) {

        if (isNotAdmin(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access Denied: Admin authorization required"));
        }

        List<String> snapshotIds = request.get("snapshotIds");
        if (snapshotIds == null || snapshotIds.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Missing required parameter: snapshotIds"));
        }

        dac7Service.markAsSubmitted(snapshotIds);
        return ResponseEntity.ok(ApiResponse.success(null, "Selected snapshots successfully marked as submitted"));
    }
}
