package it.rfactor.api.workspace;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import it.rfactor.api.model.*;
import it.rfactor.api.repo.*;

/** Loads the synthetic demo workspace (the old frontend mock) for a user, with dates relative to today. */
@Service
public class Seeder {
    private static final Locale EN = Locale.ENGLISH;
    private final Users users; private final Emails emails; private final Commitments commitments; private final Risks risks;
    private final Events events; private final Actions actions; private final Runs runs; private final Logs logs;
    private final ZoneId zone;
    private final int volume;

    Seeder(Users users, Emails emails, Commitments commitments, Risks risks, Events events, Actions actions, Runs runs, Logs logs,
           @Value("${app.zone}") String zone, @Value("${app.seed-volume:0}") int volume) {
        this.volume = volume;
        this.users = users; this.emails = emails; this.commitments = commitments; this.risks = risks;
        this.events = events; this.actions = actions; this.runs = runs; this.logs = logs;
        this.zone = ZoneId.of(zone);
    }

    /** Wipes the user's data and settings, then reloads the demo set. Also backs POST /api/demo/reset. */
    @Transactional
    public void seed(Long uid) {
        for (var r : List.of(emails, commitments, risks, events, actions, runs, logs)) r.deleteByUserId(uid);
        var u = users.findById(uid).orElseThrow();
        u.analyzeWork = true; u.analyzePersonal = true; u.crossCalendar = true; u.autonomy = Autonomy.APPROVAL_REQUIRED;

        var today = LocalDate.now(zone);
        var tomorrow = today.plusDays(1);
        var delay = today.plusDays(4);
        var longDay = DateTimeFormatter.ofPattern("MMMM d", EN);
        var shortDay = DateTimeFormatter.ofPattern("MMM d", EN);

        var w1 = email(uid, Space.WORK, "Elena · Acme", "Final proposal due tomorrow",
                "Please deliver the final proposal by %s to proceed with the €150,000 opportunity.".formatted(tomorrow.format(longDay)), "Critical", 8, 5);
        var w2 = email(uid, Space.WORK, "Marco · Engineering", "Proposal dependency",
                "We cannot finish the proposal until IT delivers infrastructure specifications.", "Action required", 8, 40);
        var w3 = email(uid, Space.WORK, "Luca · IT", "Infrastructure delay",
                "Specifications will not be available until %s.".formatted(delay.format(DateTimeFormatter.ofPattern("EEEE, MMMM d", EN))), "Risk signal", 9, 10);
        var w4 = email(uid, Space.WORK, "Finance", "Budget approval", "Please approve the €25,000 budget by 17:00 today.", "Due today", 9, 30);
        email(uid, Space.WORK, "CEO office", "Annual company dinner", "Join us for our annual celebration next month.", "Low priority", 7, 50);
        email(uid, Space.PERSONAL, "Private clinic", "Appointment confirmation", "Your private appointment is today from 15:00 to 15:30.", "Appointment", 7, 20);
        var p2 = email(uid, Space.PERSONAL, "Energy provider", "Electricity bill", "Your bill is due %s.".formatted(tomorrow.format(longDay)), "Reminder", 7, 30);

        // extra background mailbox (mostly noise + a few risk stories), prioritized but not analyzed
        if (volume > 0) emails.saveAll(DemoMail.generate(uid, volume, uid, zone, today));

        commitment(uid, Space.WORK, "Deliver Acme proposal", "Marco", tomorrow.format(shortDay), "Blocked", w1, w2);
        commitment(uid, Space.WORK, "Approve project budget", "You", "Today", "Due today", w4);
        commitment(uid, Space.WORK, "Deliver IT specifications", "Luca", delay.format(shortDay), "Delayed", w3);
        commitment(uid, Space.PERSONAL, "Pay electricity bill", "You", tomorrow.format(shortDay), "Upcoming", p2);

        var r = new Risk();
        r.userId = uid; r.space = Space.WORK; r.source = Source.SEED; r.severity = "High";
        r.title = "Acme contract at risk";
        r.explanation = "IT specifications are delayed beyond the client deadline.";
        r.exposure = "€150,000 opportunity exposed";
        r.sourceIds = Set.of(w1.id, w2.id, w3.id);
        r.chain = List.of(new ChainNode("IT specifications", "Delayed until " + delay.format(longDay)),
                new ChainNode("Engineering proposal", "Blocked by IT"),
                new ChainNode("Acme client submission", tomorrow.format(longDay) + " · €150,000 opportunity"));
        risks.save(r);

        event(uid, Space.WORK, "Product alignment", today, 10, 0, 10, 30);
        event(uid, Space.WORK, "Acme presentation", today, 15, 0, 16, 0);
        event(uid, Space.PERSONAL, "Private appointment", today, 15, 0, 15, 30);

        logs.log(uid, Space.WORK, "Detected proposal dependency across three messages");
        logs.log(uid, Space.PERSONAL, "Extracted private appointment");
    }

    private Email email(Long uid, Space s, String from, String subject, String body, String priority, int h, int m) {
        var e = new Email();
        e.userId = uid; e.space = s; e.sender = from; e.subject = subject; e.body = body; e.priority = priority;
        e.receivedAt = LocalDate.now(zone).atTime(h, m).atZone(zone).toInstant();
        return emails.save(e);
    }

    private void commitment(Long uid, Space s, String title, String owner, String due, String status, Email... src) {
        var c = new Commitment();
        c.userId = uid; c.space = s; c.title = title; c.owner = owner; c.due = due; c.status = status; c.source = Source.SEED;
        for (var e : src) c.sourceIds.add(e.id);
        commitments.save(c);
    }

    private void event(Long uid, Space s, String title, LocalDate d, int h1, int m1, int h2, int m2) {
        var e = new CalendarEvent();
        e.userId = uid; e.space = s; e.title = title;
        e.startAt = d.atTime(LocalTime.of(h1, m1)).atZone(zone).toInstant();
        e.endAt = d.atTime(LocalTime.of(h2, m2)).atZone(zone).toInstant();
        events.save(e);
    }
}
