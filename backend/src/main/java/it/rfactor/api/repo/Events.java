package it.rfactor.api.repo;

import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Sort;
import it.rfactor.api.model.CalendarEvent;

public interface Events extends OwnedRepo<CalendarEvent> {
    /** events overlapping [from, to) */
    List<CalendarEvent> findByUserIdAndStartAtLessThanAndEndAtGreaterThan(Long userId, Instant to, Instant from, Sort sort);
}
