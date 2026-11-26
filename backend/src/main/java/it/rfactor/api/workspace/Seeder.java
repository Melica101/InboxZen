package it.rfactor.api.workspace;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import it.rfactor.api.model.*;
import it.rfactor.api.repo.*;

/** Loads the synthetic demo workspace (the old frontend mock) for a user, with dates relative to today. */
@Service
public class Seeder {
    private static final Locale EN = Locale.ENGLISH;
    // story emails, looked up by subject when the demo analysis is applied
    private static final String W1 = "Final proposal due tomorrow", W2 = "Proposal dependency", W3 = "Infrastructure delay", W4 = "Budget approval", P2 = "Electricity bill";
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

    /** Wipes the user's data and settings, then reloads the full demo set (mailbox + analysis). Also backs POST /api/demo/reset. */
    @Transactional
    public void seed(Long uid) {
        seedMailbox(uid);
        rows(uid, Space.WORK);
        rows(uid, Space.PERSONAL);
    }

    /** Wipes the user's data and settings, then loads only the raw mailbox + calendar: what the demo shows before "Analyze". */
    @Transactional
    public void seedMailbox(Long uid) {
        for (var r : List.of(emails, commitments, risks, events, actions, runs, logs)) r.deleteByUserId(uid);
        var u = users.findById(uid).orElseThrow();
        u.analyzeWork = true; u.analyzePersonal = true; u.crossCalendar = true; u.autonomy = Autonomy.APPROVAL_REQUIRED;

        var today = LocalDate.now(zone);
        var tomorrow = today.plusDays(1);
        var delay = today.plusDays(4);
        var longDay = DateTimeFormatter.ofPattern("MMMM d", EN);

        email(uid, Space.WORK, "Elena · Acme", W1, "Please deliver the final proposal by %s to proceed with the €150,000 opportunity.".formatted(tomorrow.format(longDay)), "Critical", 8, 5);
        email(uid, Space.WORK, "Marco · Engineering", W2, "We cannot finish the proposal until IT delivers infrastructure specifications.", "Action required", 8, 40);
        email(uid, Space.WORK, "Luca · IT", W3, "Specifications will not be available until %s.".formatted(delay.format(DateTimeFormatter.ofPattern("EEEE, MMMM d", EN))), "Risk signal", 9, 10);
        email(uid, Space.WORK, "Finance", W4, "Please approve the €25,000 budget by 17:00 today.", "Due today", 9, 30);
        email(uid, Space.WORK, "CEO office", "Annual company dinner", "Join us for our annual celebration next month.", "Low priority", 7, 50);
        email(uid, Space.PERSONAL, "Private clinic", "Appointment confirmation", "Your private appointment is today from 15:00 to 15:30.", "Appointment", 7, 20);
        email(uid, Space.PERSONAL, "Energy provider", P2, "Your bill is due %s.".formatted(tomorrow.format(longDay)), "Reminder", 7, 30);

        // extra background mailbox (mostly noise + a few risk stories), prioritized but not analyzed
        if (volume > 0) emails.saveAll(DemoMail.generate(uid, volume, uid, zone, today));

        event(uid, Space.WORK, "Product alignment", today, 10, 0, 10, 30);
        event(uid, Space.WORK, "Acme presentation", today, 15, 0, 16, 0);
        event(uid, Space.PERSONAL, "Private appointment", today, 15, 0, 15, 30);
    }

    /** Hardcoded "AI result" for the demo: what Analyze shows when no real model is called. Idempotent per space. */
    @Transactional
    public void demoAnalyze(Long uid, Space space) {
        rows(uid, space);
        var run = new AnalysisRun();
        run.userId = uid; run.space = space; run.mode = "demo";
        var delay = LocalDate.now(zone).plusDays(4).format(DateTimeFormatter.ofPattern("MMMM d", EN));
        run.summary = space == Space.WORK
                ? "The Acme proposal (€150,000) is due tomorrow but blocked: IT specifications slip to %s. Approve the €25,000 budget by 17:00 today.".formatted(delay)
                : "Private appointment today 15:00–15:30, overlapping the Acme presentation. Electricity bill due tomorrow.";
        runs.save(run);
    }

    /** Commitments, risk and activity log for one space, built from the story emails. Replaces non-manual rows. */
    private void rows(Long uid, Space space) {
        commitments.deleteAll(commitments.findByUserIdAndSpaceIn(uid, Space.scope(space), Sort.unsorted()).stream().filter(c -> c.source != Source.MANUAL).toList());
        risks.deleteAll(risks.findByUserIdAndSpaceIn(uid, Space.scope(space), Sort.unsorted()).stream().filter(r -> r.source != Source.MANUAL).toList());
        runs.deleteAll(runs.findByUserIdAndSpaceIn(uid, Space.scope(space), Sort.unsorted()));

        var today = LocalDate.now(zone);
        var tomorrow = today.plusDays(1);
        var delay = today.plusDays(4);
        var longDay = DateTimeFormatter.ofPattern("MMMM d", EN);
        var shortDay = DateTimeFormatter.ofPattern("MMM d", EN);

        if (space == Space.WORK) {
            var w1 = story(uid, space, W1); var w2 = story(uid, space, W2); var w3 = story(uid, space, W3); var w4 = story(uid, space, W4);
            commitment(uid, space, "Deliver Acme proposal", "Marco", tomorrow.format(shortDay), "Blocked", w1, w2);
            commitment(uid, space, "Approve project budget", "You", "Today", "Due today", w4);
            commitment(uid, space, "Deliver IT specifications", "Luca", delay.format(shortDay), "Delayed", w3);

            var r = new Risk();
            r.userId = uid; r.space = space; r.source = Source.SEED; r.severity = "High";
            r.title = "Acme contract at risk";
            r.explanation = "IT specifications are delayed beyond the client deadline.";
            r.exposure = "€150,000 opportunity exposed";
            r.sourceIds = Set.of(w1.id, w2.id, w3.id);
            r.chain = List.of(new ChainNode("IT specifications", "Delayed until " + delay.format(longDay)),
                    new ChainNode("Engineering proposal", "Blocked by IT"),
                    new ChainNode("Acme client submission", tomorrow.format(longDay) + " · €150,000 opportunity"));
            risks.save(r);
            logs.log(uid, space, "Detected proposal dependency across three messages");
        } else {
            commitment(uid, space, "Pay electricity bill", "You", tomorrow.format(shortDay), "Upcoming", story(uid, space, P2));
            logs.log(uid, space, "Extracted private appointment");
        }
    }

    private Email story(Long uid, Space space, String subject) {
        return emails.findByUserIdAndSpaceIn(uid, Space.scope(space), Sort.by("id")).stream().filter(e -> subject.equals(e.subject)).findFirst().orElseThrow();
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
