package it.rfactor.api.calendar;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import it.rfactor.api.model.*;
import it.rfactor.api.repo.Events;

@Service
public class CalendarService {
    public record Conflict(CalendarEvent workEvent, CalendarEvent personalEvent) {}

    private static final Sort BY_START = Sort.by("startAt");
    private final Events events;
    private final ZoneId zone;

    CalendarService(Events events, @Value("${app.zone}") String zone) {
        this.events = events;
        this.zone = ZoneId.of(zone);
    }

    public ZoneId zone() { return zone; }

    public LocalDate today() { return LocalDate.now(zone); }

    /** Events overlapping the given local day. */
    public List<CalendarEvent> day(Long uid, LocalDate d, Space space) {
        var from = d.atStartOfDay(zone).toInstant();
        var to = d.plusDays(1).atStartOfDay(zone).toInstant();
        return events.findByUserIdAndStartAtLessThanAndEndAtGreaterThan(uid, to, from, BY_START).stream()
                .filter(e -> space == null || e.space == space).toList();
    }

    /** Personal events overlapping a work event: free/busy only, deterministic, no AI. */
    public List<CalendarEvent> personalOverlaps(Long uid, CalendarEvent work) {
        return events.findByUserIdAndStartAtLessThanAndEndAtGreaterThan(uid, work.endAt, work.startAt, BY_START).stream()
                .filter(e -> e.space == Space.PERSONAL).toList();
    }

    public List<Conflict> conflicts(Long uid, LocalDate d) {
        return day(uid, d, Space.WORK).stream()
                .flatMap(w -> personalOverlaps(uid, w).stream().map(p -> new Conflict(w, p))).toList();
    }

    /** First slot for `ev` that starts one hour after the busy slot ends (30-min grid) and collides with nothing else. */
    public Instant[] proposeSlot(Long uid, CalendarEvent ev, Instant busyEnd) {
        var len = Duration.between(ev.startAt, ev.endAt);
        var start = busyEnd.plus(1, ChronoUnit.HOURS);
        for (int i = 0; i < 48; i++, start = start.plus(30, ChronoUnit.MINUTES)) {
            var end = start.plus(len);
            var s = start;
            var free = events.findByUserIdAndStartAtLessThanAndEndAtGreaterThan(uid, end, s, BY_START).stream().allMatch(o -> o.id.equals(ev.id));
            if (free) return new Instant[] {start, end};
        }
        throw new IllegalStateException("no free slot");
    }
}
