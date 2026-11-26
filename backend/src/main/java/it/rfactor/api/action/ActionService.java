package it.rfactor.api.action;

import it.rfactor.api.common.Api;
import it.rfactor.api.ai.AiService;
import it.rfactor.api.calendar.CalendarService;
import java.time.Instant;
import java.util.Comparator;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import it.rfactor.api.model.*;
import it.rfactor.api.repo.*;

/** Agent proposals. Drafting is free; approving is gated by the user's autonomy setting and never sends anything. */
@Service
public class ActionService {
    private final AiService ai; private final CalendarService calendar;
    private final Users users; private final Risks risks; private final Emails emails; private final Events events;
    private final Actions actions; private final Logs logs;

    ActionService(AiService ai, CalendarService calendar, Users users, Risks risks, Emails emails, Events events, Actions actions, Logs logs) {
        this.ai = ai; this.calendar = calendar; this.users = users; this.risks = risks; this.emails = emails;
        this.events = events; this.actions = actions; this.logs = logs;
    }

    public AgentAction escalation(Long uid, Long riskId) {
        var risk = Api.found(risks.findByIdAndUserId(riskId, uid));
        var pending = actions.findFirstByUserIdAndRiskIdAndStatus(uid, riskId, ActionStatus.DRAFT);
        if (pending.isPresent()) return pending.get(); // double click = same draft
        var d = ai.escalationDraft(risk, emails.findByUserIdAndIdIn(uid, risk.sourceIds));
        var a = draft(uid, risk.space, ActionType.ESCALATION, d);
        a.riskId = risk.id;
        return actions.save(a);
    }

    public AgentAction reschedule(Long uid, Long eventId) {
        var user = users.findById(uid).orElseThrow();
        if (!user.crossCalendar) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cross-calendar coordination is disabled in settings");
        var ev = Api.found(events.findByIdAndUserId(eventId, uid));
        var pending = actions.findFirstByUserIdAndEventIdAndStatus(uid, eventId, ActionStatus.DRAFT);
        if (pending.isPresent()) {
            var p = pending.get();
            if (calendar.isFree(uid, p.newStart, p.newEnd, ev.id)) return p;
            p.status = ActionStatus.REJECTED; p.decidedAt = Instant.now(); // slot taken meanwhile: replace the stale draft
            actions.save(p);
        }
        if (ev.space != Space.WORK) throw Api.bad("Only work events can be rescheduled");
        var busyEnd = calendar.personalOverlaps(uid, ev).stream().map(p -> p.endAt).max(Comparator.naturalOrder())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "No conflict for this event"));
        var slot = calendar.proposeSlot(uid, ev, busyEnd);
        var a = draft(uid, Space.WORK, ActionType.RESCHEDULE, ai.rescheduleDraft(ev, slot[0], slot[1]));
        a.eventId = ev.id; a.newStart = slot[0]; a.newEnd = slot[1];
        return actions.save(a);
    }

    @Transactional
    public AgentAction approve(Long uid, Long id) {
        var a = pending(uid, id);
        if (users.findById(uid).orElseThrow().autonomy == Autonomy.RECOMMENDATIONS_ONLY) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Autonomy is 'recommendations only': enable approval mode to execute actions");
        }
        if (a.type == ActionType.RESCHEDULE) {
            var ev = Api.found(events.findByIdAndUserId(a.eventId, uid));
            if (!calendar.isFree(uid, a.newStart, a.newEnd, ev.id)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Proposed slot is no longer free: reject and draft again");
            ev.startAt = a.newStart; ev.endAt = a.newEnd;
        }
        a.status = ActionStatus.APPROVED; a.decidedAt = Instant.now();
        logs.log(uid, a.space, a.type == ActionType.RESCHEDULE ? "Approved simulated reschedule" : "Approved simulated escalation");
        return a;
    }

    @Transactional
    public AgentAction reject(Long uid, Long id) {
        var a = pending(uid, id);
        a.status = ActionStatus.REJECTED; a.decidedAt = Instant.now();
        logs.log(uid, a.space, "Rejected " + a.type.name().toLowerCase() + " draft");
        return a;
    }

    private AgentAction pending(Long uid, Long id) {
        var a = Api.found(actions.findByIdAndUserId(id, uid));
        if (a.status != ActionStatus.DRAFT) throw new ResponseStatusException(HttpStatus.CONFLICT, "Action already " + a.status);
        return a;
    }

    private AgentAction draft(Long uid, Space space, ActionType type, AiService.Draft d) {
        var a = new AgentAction();
        a.userId = uid; a.space = space; a.type = type;
        a.recipients = d.to(); a.subject = d.subject(); a.body = d.body();
        return a;
    }
}
