
package com.voiceinspect;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InspectionRepository
        extends JpaRepository<Inspection, Long> {
}
