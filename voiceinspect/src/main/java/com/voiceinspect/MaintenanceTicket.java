
package com.voiceinspect;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_tickets")
public class MaintenanceTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long inspectionId;
    private String equipment;
    private String location;
    private String issue;
    private String priority;
    private String status;
    private String assignedTechnician;
    private LocalDateTime deadline;

    public MaintenanceTicket() {
    }

    public MaintenanceTicket(Inspection inspection) {
        this.inspectionId = inspection.getId();
        this.equipment = inspection.getEquipment();
        this.location = inspection.getLocation();
        this.issue = inspection.getIssue();
        this.priority = inspection.getPriority();
        this.status = "OPEN";
        this.assignedTechnician = assignTechnician(priority);

        int hours = switch (priority) {
            case "CRITICAL" -> 2;
            case "HIGH" -> 8;
            case "MEDIUM" -> 24;
            default -> 72;
        };

        this.deadline = LocalDateTime.now().plusHours(hours);
    }

    public Long getId() {
        return id;
    }

    public Long getInspectionId() {
        return inspectionId;
    }

    public String getEquipment() {
        return equipment;
    }

    public String getLocation() {
        return location;
    }

    public String getIssue() {
        return issue;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public String getAssignedTechnician() {
        return assignedTechnician;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setAssignedTechnician(String assignedTechnician) {
        this.assignedTechnician = assignedTechnician;
    }

    private String assignTechnician(String priority) {
        return switch (priority) {
            case "CRITICAL" -> "Senior Technician";
            case "HIGH" -> "Maintenance Technician";
            case "MEDIUM" -> "General Technician";
            default -> "Junior Technician";
        };
    }
}
