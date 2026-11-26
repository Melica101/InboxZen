package it.rfactor.api.briefing;

import java.security.Principal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import it.rfactor.api.calendar.CalendarService;
import it.rfactor.api.common.Api;
import it.rfactor.api.model.ActionStatus;
import it.rfactor.api.model.AgentAction;
import it.rfactor.api.model.CalendarEvent;
import it.rfactor.api.model.Commitment;
import it.rfactor.api.model.Risk;
import it.rfactor.api.model.RiskStatus;
import it.rfactor.api.model.Space;
import it.rfactor.api.repo.Actions;
import it.rfactor.api.repo.Commitments;
import it.rfactor.api.repo.Risks;
import it.rfactor.api.repo.Runs;
import it.rfactor.api.repo.Users;

@RestController
@RequestMapping("/api/briefing")
class BriefingController {
    record Metrics(long openCommitments, long activeRisks, long pendingActions) {}
    record Briefing(String name, LocalDate date, Metrics metrics, Risk topRisk, List<Commitment> commitments, List<CalendarEvent> schedule,
                    List<CalendarService.Conflict> conflicts, List<AgentAction> pendingActions, Map<Space, String> summaries) {}

    private static final List<String> SEVERITY_ORDER = List.of("High", "Medium", "Low");

    private final Users users; private final Commitments commitments; private final Risks risks; private final Actions actions;
    private final Runs runs; private final CalendarService calendar;

    BriefingController(Users users, Commitments commitments, Risks risks, Actions actions, Runs runs, CalendarService calendar) {
        this.users = users; this.commitments = commitments; this.risks = risks; this.actions = actions;
        this.runs = runs; this.calendar = calendar;
    }

    /** Everything the "Daily briefing" screen shows, in one call. `space` omitted = "My day". */
    @GetMapping
    Briefing get(Principal p, @RequestParam(required = false) Space space) {
        var u = Api.found(users.findById(Api.uid(p)));
        var spaces = Space.scope(space);
        var open = commitments.findByUserIdAndSpaceIn(u.id, spaces, Sort.by("id")).stream().filter(c -> !c.done).toList();
        var activeRisks = risks.findByUserIdAndSpaceIn(u.id, spaces, Sort.by("id")).stream().filter(r -> r.status == RiskStatus.OPEN)
                .sorted(Comparator.comparingInt(r -> SEVERITY_ORDER.indexOf(r.severity))).toList();
        var pending = actions.findByUserIdAndSpaceIn(u.id, spaces, Sort.by("id")).stream().filter(a -> a.status == ActionStatus.DRAFT).toList();
        var today = calendar.today();
        var summaries = new EnumMap<Space, String>(Space.class);
        for (var s : spaces) runs.findFirstByUserIdAndSpaceOrderByIdDesc(u.id, s).ifPresent(r -> summaries.put(s, r.summary));
        var conflicts = space == null && u.crossCalendar ? calendar.conflicts(u.id, today) : List.<CalendarService.Conflict>of();
        return new Briefing(u.name, today, new Metrics(open.size(), activeRisks.size(), pending.size()),
                activeRisks.isEmpty() ? null : activeRisks.get(0), open, calendar.day(u.id, today, space), conflicts, pending, summaries);
    }
}
