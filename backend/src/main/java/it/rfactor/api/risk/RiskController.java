package it.rfactor.api.risk;

import it.rfactor.api.common.Api;
import it.rfactor.api.action.ActionService;
import java.security.Principal;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import it.rfactor.api.model.*;
import it.rfactor.api.repo.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/risks")
class RiskController {
    record Detail(Risk risk, List<Email> evidence) {}
    record Resolve(@Size(max = 2000) String note) {}

    private final Risks risks; private final Emails emails; private final Commitments commitments; private final Logs logs; private final ActionService actions;

    RiskController(Risks risks, Emails emails, Commitments commitments, Logs logs, ActionService actions) {
        this.risks = risks; this.emails = emails; this.commitments = commitments; this.logs = logs; this.actions = actions;
    }

    @GetMapping
    List<Risk> list(Principal p, @RequestParam(required = false) Space space, @RequestParam(required = false) RiskStatus status) {
        return risks.findByUserIdAndSpaceIn(Api.uid(p), Space.scope(space), Sort.by("id")).stream()
                .filter(r -> status == null || r.status == status).toList();
    }

    /** Risk with its source emails and dependency chain. */
    @GetMapping("/{id}")
    Detail get(Principal p, @PathVariable Long id) {
        var uid = Api.uid(p);
        var r = Api.found(risks.findByIdAndUserId(id, uid));
        return new Detail(r, emails.findByUserIdAndIdIn(uid, r.sourceIds));
    }

    /** Marks the risk mitigated and unblocks the commitments that depend on the same emails. */
    @PostMapping("/{id}/resolve")
    @Transactional
    Risk resolve(Principal p, @PathVariable Long id, @Valid @RequestBody(required = false) Resolve body) {
        var uid = Api.uid(p);
        var r = Api.found(risks.findByIdAndUserId(id, uid));
        r.status = RiskStatus.MITIGATED;
        r.resolution = body == null ? null : body.note();
        for (var c : commitments.findByUserIdAndSpaceIn(uid, Space.scope(r.space), Sort.unsorted())) {
            if (c.sourceIds.stream().anyMatch(r.sourceIds::contains) && ("Blocked".equals(c.status) || "Delayed".equals(c.status))) c.status = "On track";
        }
        logs.log(uid, r.space, "Risk mitigated: " + r.title);
        return r;
    }

    /** Creates a DRAFT escalation action. Nothing is sent. */
    @PostMapping("/{id}/escalation-draft")
    @ResponseStatus(HttpStatus.CREATED)
    AgentAction escalationDraft(Principal p, @PathVariable Long id) { return actions.escalation(Api.uid(p), id); }
}
