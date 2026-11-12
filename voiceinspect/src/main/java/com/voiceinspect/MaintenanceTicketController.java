
package com.voiceinspect;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class MaintenanceTicketController {

    private final MaintenanceTicketRepository repository;

    public MaintenanceTicketController(
            MaintenanceTicketRepository repository) {
        this.repository = repository;
    }

    // Get all tickets
    @GetMapping
    public List<MaintenanceTicket> getAllTickets() {
        return repository.findAll();
    }

    // Get ticket by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update ticket status
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        MaintenanceTicket ticket = repository.findById(id).orElse(null);

        if (ticket == null) {
            return ResponseEntity.notFound().build();
        }

        String status = request.get("status");

        if (status == null ||
                !List.of("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED")
                        .contains(status.toUpperCase())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid ticket status"));
        }

        ticket.setStatus(status.toUpperCase());

        return ResponseEntity.ok(repository.save(ticket));
    }

    // Assign technician
    @PatchMapping("/{id}/technician")
    public ResponseEntity<?> assignTechnician(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        MaintenanceTicket ticket = repository.findById(id).orElse(null);

        if (ticket == null) {
            return ResponseEntity.notFound().build();
        }

        String technician = request.get("technician");

        if (technician == null || technician.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Technician name is required"));
        }

        ticket.setAssignedTechnician(technician.trim());

        return ResponseEntity.ok(repository.save(ticket));
    }

    // Close ticket
    @PatchMapping("/{id}/close")
    public ResponseEntity<?> closeTicket(@PathVariable Long id) {

        MaintenanceTicket ticket = repository.findById(id).orElse(null);

        if (ticket == null) {
            return ResponseEntity.notFound().build();
        }

        ticket.setStatus("RESOLVED");

        return ResponseEntity.ok(repository.save(ticket));
    }
}
