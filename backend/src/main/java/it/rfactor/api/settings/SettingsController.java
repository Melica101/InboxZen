package it.rfactor.api.settings;

import java.security.Principal;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import it.rfactor.api.common.Api;
import it.rfactor.api.model.Autonomy;
import it.rfactor.api.model.User;
import it.rfactor.api.repo.Users;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

/** Privacy center: which spaces the AI may analyze, cross-calendar coordination, autonomy level. */
@RestController
@RequestMapping("/api/settings")
class SettingsController {
    record SettingsDto(@NotNull Boolean analyzeWork, @NotNull Boolean analyzePersonal, @NotNull Boolean crossCalendar, @NotNull Autonomy autonomy) {}

    private final Users users;

    SettingsController(Users users) { this.users = users; }

    @GetMapping
    SettingsDto get(Principal p) { return dto(user(p)); }

    @PutMapping
    SettingsDto update(Principal p, @Valid @RequestBody SettingsDto r) {
        var u = user(p);
        u.analyzeWork = r.analyzeWork(); u.analyzePersonal = r.analyzePersonal(); u.crossCalendar = r.crossCalendar(); u.autonomy = r.autonomy();
        return dto(users.save(u));
    }

    private User user(Principal p) { return Api.found(users.findById(Api.uid(p))); }

    private static SettingsDto dto(User u) { return new SettingsDto(u.analyzeWork, u.analyzePersonal, u.crossCalendar, u.autonomy); }
}
