
package com.voiceinspect;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inspections")
public class InspectionController {

    private final InspectionRepository repository;
    private final MaintenanceTicketRepository ticketRepository;

    public InspectionController(
            InspectionRepository repository,
            MaintenanceTicketRepository ticketRepository) {
        this.repository = repository;
        this.ticketRepository = ticketRepository;
    }

    @PostMapping
    public Inspection createInspection(
            @RequestBody InspectionRequest request) {

        Inspection inspection = new Inspection(
                request.getLocation(),
                request.getEquipment(),
                request.getIssue(),
                request.getCondition());

        Inspection savedInspection = repository.save(inspection);

        if ("CRITICAL".equals(savedInspection.getPriority())
                || "HIGH".equals(savedInspection.getPriority())) {

            MaintenanceTicket ticket = new MaintenanceTicket(savedInspection);

            ticketRepository.save(ticket);
        }

        return savedInspection;
    }

    @GetMapping
    public List<Inspection> getAllInspections() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Inspection getInspectionById(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }
}
