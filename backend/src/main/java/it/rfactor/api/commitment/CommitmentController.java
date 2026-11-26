package it.rfactor.api.commitment;

import it.rfactor.api.common.Api;
import it.rfactor.api.ai.AiService;
import java.security.Principal;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import it.rfactor.api.model.*;
import it.rfactor.api.repo.Commitments;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/commitments")
class CommitmentController {
    record NewCommitment(@NotNull Space space, @NotBlank @Size(max = 200) String title, @Size(max = 100) String owner,
                         @Size(max = 100) String due, String status) {}
    record Patch(@Size(max = 200) String title, @Size(max = 100) String owner, @Size(max = 100) String due, String status, Boolean done) {}

    private final Commitments repo;

    CommitmentController(Commitments repo) { this.repo = repo; }

    @GetMapping
    List<Commitment> list(Principal p, @RequestParam(required = false) Space space) {
        return repo.findByUserIdAndSpaceIn(Api.uid(p), Space.scope(space), Sort.by("id"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    Commitment create(Principal p, @Valid @RequestBody NewCommitment r) {
        var c = new Commitment();
        c.userId = Api.uid(p); c.space = r.space(); c.title = r.title(); c.owner = r.owner(); c.due = r.due();
        c.source = Source.MANUAL;
        if (r.status() != null) c.status = status(r.status());
        return repo.save(c);
    }

    @PatchMapping("/{id}")
    Commitment patch(Principal p, @PathVariable Long id, @Valid @RequestBody Patch r) {
        var c = Api.found(repo.findByIdAndUserId(id, Api.uid(p)));
        if (r.title() != null) { if (r.title().isBlank()) throw Api.bad("title must not be blank"); c.title = r.title(); }
        if (r.owner() != null) c.owner = r.owner();
        if (r.due() != null) c.due = r.due();
        if (r.status() != null) c.status = status(r.status());
        if (r.done() != null) c.done = r.done();
        return repo.save(c);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void delete(Principal p, @PathVariable Long id) { repo.delete(Api.found(repo.findByIdAndUserId(id, Api.uid(p)))); }

    private static String status(String s) {
        if (!AiService.STATUSES.contains(s)) throw Api.bad("status must be one of " + AiService.STATUSES);
        return s;
    }
}
