package it.rfactor.api.action;

import it.rfactor.api.common.Api;
import java.security.Principal;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import it.rfactor.api.model.*;
import it.rfactor.api.repo.Actions;

@RestController
@RequestMapping("/api/actions")
class ActionController {
    private final Actions repo; private final ActionService service;

    ActionController(Actions repo, ActionService service) { this.repo = repo; this.service = service; }

    @GetMapping
    List<AgentAction> list(Principal p, @RequestParam(required = false) Space space, @RequestParam(required = false) ActionStatus status) {
        return repo.findByUserIdAndSpaceIn(Api.uid(p), Space.scope(space), Sort.by(Sort.Direction.DESC, "id")).stream()
                .filter(a -> status == null || a.status == status).toList();
    }

    @GetMapping("/{id}")
    AgentAction get(Principal p, @PathVariable Long id) { return Api.found(repo.findByIdAndUserId(id, Api.uid(p))); }

    /** 409 when autonomy is "recommendations only" or the action was already decided. */
    @PostMapping("/{id}/approve")
    AgentAction approve(Principal p, @PathVariable Long id) { return service.approve(Api.uid(p), id); }

    @PostMapping("/{id}/reject")
    AgentAction reject(Principal p, @PathVariable Long id) { return service.reject(Api.uid(p), id); }
}
