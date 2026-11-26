package it.rfactor.api.workspace;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import it.rfactor.api.calendar.CalendarService;
import it.rfactor.api.common.Api;
import it.rfactor.api.model.Space;
import it.rfactor.api.repo.Emails;
import it.rfactor.api.repo.Logs;

/** Synthetic-data helpers for demos and development. */
@RestController
@RequestMapping("/api/demo")
class DemoController {
    private final Seeder seeder; private final Emails emails; private final Logs logs; private final CalendarService calendar;

    DemoController(Seeder seeder, Emails emails, Logs logs, CalendarService calendar) {
        this.seeder = seeder; this.emails = emails; this.logs = logs; this.calendar = calendar;
    }

    /** Wipes the user's data and settings and reloads the synthetic demo workspace. */
    @PostMapping("/reset")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void reset(Principal p) { seeder.seed(Api.uid(p)); }

    /** Appends `count` synthetic emails (default 100, max 1000) to the caller's mailbox. Existing data is untouched. */
    @PostMapping("/emails")
    @ResponseStatus(HttpStatus.CREATED)
    Map<String, Integer> addEmails(Principal p, @RequestParam(defaultValue = "100") int count) {
        if (count < 1 || count > 1000) throw Api.bad("count must be between 1 and 1000");
        var uid = Api.uid(p);
        emails.saveAll(DemoMail.generate(uid, count, System.nanoTime(), calendar.zone(), calendar.today()));
        logs.log(uid, Space.WORK, "Loaded %d synthetic emails".formatted(count));
        return Map.of("added", count, "total", (int) emails.countByUserId(uid));
    }
}
