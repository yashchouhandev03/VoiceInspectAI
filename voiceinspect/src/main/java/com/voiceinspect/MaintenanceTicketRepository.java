
package com.voiceinspect;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MaintenanceTicketRepository
        extends JpaRepository<MaintenanceTicket, Long> {
}
