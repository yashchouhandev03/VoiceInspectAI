
package com.voiceinspect;

import jakarta.persistence.*;

@Entity
@Table(name = "inspections")
public class Inspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String location;
    private String equipment;
    private String issue;
    private String condition;
    private String priority;

    public Inspection() {
    }

    public Inspection(String location, String equipment,
            String issue, String condition) {
        this.location = location;
        this.equipment = equipment;
        this.issue = issue;
        this.condition = condition;
        this.priority = calculatePriority(condition);
    }

    private String calculatePriority(String condition) {
        if (condition == null) {
            return "MEDIUM";
        }

        switch (condition.toUpperCase()) {
            case "FAULTY":
                return "CRITICAL";
            case "NEEDS_REPAIR":
                return "HIGH";
            case "WARNING":
                return "MEDIUM";
            case "GOOD":
                return "LOW";
            default:
                return "MEDIUM";
        }
    }

    public Long getId() {
        return id;
    }

    public String getLocation() {
        return location;
    }

    public String getEquipment() {
        return equipment;
    }

    public String getIssue() {
        return issue;
    }

    public String getCondition() {
        return condition;
    }

    public String getPriority() {
        return priority;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setEquipment(String equipment) {
        this.equipment = equipment;
    }

    public void setIssue(String issue) {
        this.issue = issue;
    }

    public void setCondition(String condition) {
        this.condition = condition;
        this.priority = calculatePriority(condition);
    }
}
