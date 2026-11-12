
package com.voiceinspect;

import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TicketAutomationService {

    private final MaintenanceTicketRepository repository;

    public TicketAutomationService(
            MaintenanceTicketRepository repository) {
        this.repository = repository;
    }

    @Scheduled(fixedRate = 60000)
    public void checkOverdueTickets() {

        List<MaintenanceTicket> tickets = repository.findAll();

        for (MaintenanceTicket ticket : tickets) {

            if (!"CLOSED".equals(ticket.getStatus())
                    && ticket.getDeadline().isBefore(LocalDateTime.now())) {

                ticket.setStatus("OVERDUE");

                if ("CRITICAL".equals(ticket.getPriority())) {
                    ticket.setPriority("ESCALATED");
                    ticket.setAssignedTechnician("Airport Maintenance Supervisor");
                }

                repository.save(ticket);
            }
        }
    }
}
