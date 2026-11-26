package it.rfactor.api.activity;

import java.security.Principal;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import it.rfactor.api.common.Api;
import it.rfactor.api.model.ActivityLog;
import it.rfactor.api.model.Space;
import it.rfactor.api.repo.Logs;

@RestController
@RequestMapping("/api/activity")
class ActivityController {
    private final Logs logs;

    ActivityController(Logs logs) { this.logs = logs; }

    /** Agent activity log, newest first. */
    @GetMapping
    List<ActivityLog> list(Principal p, @RequestParam(required = false) Space space) {
        return logs.findByUserIdAndSpaceIn(Api.uid(p), Space.scope(space), Sort.by(Sort.Direction.DESC, "id"));
    }
}
