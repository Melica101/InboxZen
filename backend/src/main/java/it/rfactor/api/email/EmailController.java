package it.rfactor.api.email;

import it.rfactor.api.common.Api;
import java.security.Principal;
import java.time.Instant;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import it.rfactor.api.model.*;
import it.rfactor.api.repo.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/emails")
class EmailController {
    record NewEmail(@NotNull Space space, @NotBlank @Size(max = 255) String sender, @Size(max = 255) String subject,
                    @NotBlank @Size(max = 10000) String body, Instant receivedAt) {}

    private final Emails emails; private final Logs logs;

    EmailController(Emails emails, Logs logs) { this.emails = emails; this.logs = logs; }

    @GetMapping
    List<Email> list(Principal p, @RequestParam(required = false) Space space) {
        return emails.findByUserIdAndSpaceIn(Api.uid(p), Space.scope(space), Sort.by(Sort.Direction.DESC, "receivedAt"));
    }

    @GetMapping("/{id}")
    Email get(Principal p, @PathVariable Long id) { return Api.found(emails.findByIdAndUserId(id, Api.uid(p))); }

    /** Ingest a message (the future connector entry point). Run POST /api/ai/analyze to extract from it. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    Email ingest(Principal p, @Valid @RequestBody NewEmail r) {
        var e = new Email();
        e.userId = Api.uid(p); e.space = r.space(); e.sender = r.sender(); e.subject = r.subject(); e.body = r.body();
        e.receivedAt = r.receivedAt() != null ? r.receivedAt() : Instant.now();
        emails.save(e);
        logs.log(e.userId, e.space, "Ingested email: " + (e.subject == null ? "(no subject)" : e.subject));
        return e;
    }
}
