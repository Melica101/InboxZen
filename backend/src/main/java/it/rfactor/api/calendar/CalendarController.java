package it.rfactor.api.calendar;

import it.rfactor.api.common.Api;
import it.rfactor.api.action.ActionService;
import java.security.Principal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import it.rfactor.api.model.*;
import it.rfactor.api.repo.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/calendar")
class CalendarController {
    record NewEvent(@NotNull Space space, @NotBlank @Size(max = 200) String title, @NotNull Instant startAt, @NotNull Instant endAt) {}

    private final CalendarService calendar; private final ActionService actions; private final Events events; private final Users users;

    CalendarController(CalendarService calendar, ActionService actions, Events events, Users users) {
        this.calendar = calendar; this.actions = actions; this.events = events; this.users = users;
    }

    /** Events of one local day (default today). */
    @GetMapping("/events")
    List<CalendarEvent> day(Principal p, @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                            @RequestParam(required = false) Space space) {
        return calendar.day(Api.uid(p), date != null ? date : calendar.today(), space);
    }

    @PostMapping("/events")
    @ResponseStatus(HttpStatus.CREATED)
    CalendarEvent create(Principal p, @Valid @RequestBody NewEvent r) {
        if (!r.endAt().isAfter(r.startAt())) throw Api.bad("endAt must be after startAt");
        var e = new CalendarEvent();
        e.userId = Api.uid(p); e.space = r.space(); e.title = r.title(); e.startAt = r.startAt(); e.endAt = r.endAt();
        return events.save(e);
    }

    /** Work events overlapping personal ones. Empty when cross-calendar coordination is off. */
    @GetMapping("/conflicts")
    List<CalendarService.Conflict> conflicts(Principal p, @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        var uid = Api.uid(p);
        if (!users.findById(uid).orElseThrow().crossCalendar) return List.of();
        return calendar.conflicts(uid, date != null ? date : calendar.today());
    }

    /** DRAFT reschedule built from free/busy only (no personal details reach the model). */
    @PostMapping("/events/{id}/reschedule-draft")
    @ResponseStatus(HttpStatus.CREATED)
    AgentAction rescheduleDraft(Principal p, @PathVariable Long id) { return actions.reschedule(Api.uid(p), id); }
}
