package it.rfactor.api.workspace;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Random;

import it.rfactor.api.model.Email;
import it.rfactor.api.model.Space;

/** Synthetic mailbox generator: deterministic per seed, spread over the last 30 days. No real data. */
final class DemoMail {
    private DemoMail() {}

    private record T(String from, String subject, String body, String priority) {}

    private static final String[] PEOPLE = {"Elena", "Marco", "Luca", "Giulia", "Sara", "Davide", "Chiara", "Paolo", "Anna", "Matteo", "Francesca", "Andrea"};
    private static final String[] CLIENTS = {"Acme", "Globex", "Initech", "Umbrella", "Hooli", "Stark Industries", "Wayne Corp", "Soylent"};
    private static final String[] PROJECTS = {"Atlas", "Helios", "Orion", "Phoenix", "Nova", "Zephyr"};
    private static final String[] TEAMS = {"Engineering", "IT", "Finance", "Legal", "HR", "Sales", "Marketing", "Procurement"};
    private static final String[] ROOMS = {"Sala Duomo", "Sala Navigli", "Sala Brera", "Zoom"};

    private static final List<String[]> WORK = List.of(
            // {fromKind, subject, body, priority}; %1$s person, %2$s client, %3$s project, %4$s team, %5$s amount, %6$s date, %7$s room, %8$s day-of-week
            new String[] {"P · %2$s", "Quote request for %3$s", "Could you send us an updated quote for %3$s? We need it before our board meeting on %6$s.", "Action required"},
            new String[] {"P · %2$s", "Contract renewal %3$s", "Our contract renews on %6$s. Please confirm the €%5$s annual fee and send the signed copy by Friday.", "Critical"},
            new String[] {"P · %4$s", "Weekly sync notes", "Notes from today's sync: %3$s is on track, two open questions on scope. Please review and comment.", "Normal"},
            new String[] {"P · %4$s", "Meeting moved to %8$s", "The %3$s review is now on %8$s at 11:00 in %7$s. Sorry for the short notice.", "Normal"},
            new String[] {"Finance", "Invoice #%9$s overdue", "Invoice #%9$s for €%5$s is overdue. Please approve payment by %6$s.", "Due today"},
            new String[] {"Finance", "Expense report approval", "Your expense report (€%5$s) is waiting for approval. Deadline is %6$s.", "Action required"},
            new String[] {"P · %4$s", "Security audit findings", "The audit of %3$s found 3 medium issues. Release cannot proceed until they are fixed.", "Risk signal"},
            new String[] {"P · %4$s", "Budget review %3$s", "We need to cut €%5$s from the %3$s budget before %6$s. Can you propose where?", "Action required"},
            new String[] {"P · %2$s", "Feedback on the demo", "Thanks for the demo yesterday. The team liked it, but we have concerns about integration timelines.", "Normal"},
            new String[] {"P · %4$s", "Interview schedule", "Candidate interviews for the %3$s team are on %6$s. Please confirm your availability.", "Reminder"},
            new String[] {"IT helpdesk", "Scheduled maintenance", "VPN and mail will be unavailable on %6$s from 22:00 to 24:00.", "Reminder"},
            new String[] {"P · %4$s", "Re: %3$s requirements", "Attaching the updated requirements. Two items changed; please check section 4 before the sprint planning.", "Normal"},
            new String[] {"CEO office", "Company update", "A short update on Q4 results and priorities for next quarter. Town hall on %6$s.", "Low priority"},
            new String[] {"P · %2$s", "Payment confirmation", "We have wired €%5$s for the %3$s milestone. Please confirm receipt.", "Normal"},
            new String[] {"P · %4$s", "Vendor delay on %3$s", "Our vendor says hardware for %3$s will slip two weeks. This may affect the delivery date for %2$s.", "Risk signal"},
            new String[] {"Newsletter", "Industry weekly digest", "Top stories this week: cloud costs, AI regulation, and what's next for enterprise software.", "Low priority"},
            new String[] {"P · %4$s", "Please review before EOD", "Can you review the attached policy draft before end of day? Legal needs sign-off.", "Due today"},
            new String[] {"P · %2$s", "Kick-off for %3$s", "Excited to start! Kick-off is on %6$s in %7$s. Agenda attached.", "Normal"},
            new String[] {"Facilities", "Office closed on %6$s", "The office will be closed on %6$s for maintenance. Remote work as usual.", "Low priority"},
            new String[] {"P · %4$s", "Approval needed: €%5$s", "We need your approval for a €%5$s purchase related to %3$s by %6$s.", "Action required"});

    private static final List<String[]> PERSONAL = List.of(
            new String[] {"Energy provider", "Your bill is ready", "Your electricity bill of €%5$s is due on %6$s.", "Reminder"},
            new String[] {"Bank", "Card payment alert", "A payment of €%5$s was made with your card ending 4821.", "Normal"},
            new String[] {"Bank", "Monthly statement", "Your statement is available. Balance and transactions are in the app.", "Low priority"},
            new String[] {"Courier", "Parcel out for delivery", "Your parcel will arrive today between 14:00 and 18:00.", "Reminder"},
            new String[] {"Dentist", "Appointment reminder", "Reminder: you have an appointment on %6$s at 09:30.", "Appointment"},
            new String[] {"P", "Dinner on Saturday?", "Are you free on Saturday evening? Thinking pizza at the usual place.", "Normal"},
            new String[] {"Streaming", "Your subscription renews soon", "Your plan renews on %6$s at €%5$s.", "Low priority"},
            new String[] {"Gym", "Class booking confirmed", "You are booked for the %8$s evening class.", "Reminder"},
            new String[] {"Landlord", "Rent due %6$s", "A reminder that this month's rent (€%5$s) is due on %6$s.", "Due today"},
            new String[] {"Insurance", "Policy renewal", "Your car insurance renews on %6$s. Premium: €%5$s. Reply to confirm or cancel.", "Action required"},
            new String[] {"Airline", "Check-in opens", "Online check-in for your flight is open. Departure on %6$s.", "Reminder"},
            new String[] {"P", "Photos from the weekend", "Here are the photos from the weekend, had a great time!", "Low priority"},
            new String[] {"Pharmacy", "Your prescription is ready", "Your prescription is ready for pick-up until %6$s.", "Reminder"},
            new String[] {"Shop", "Order shipped", "Your order #%9$s has shipped and will arrive within 3 days.", "Low priority"},
            new String[] {"City council", "Waste collection changes", "Collection days change from %6$s. See the attached calendar.", "Low priority"});

    // fixed threads: the AI can turn these into dependency chains / risks
    private static final String[][] STORIES = {
            // space, daysAgo, hour, from, subject, body, priority
            {"W", "6", "9", "Sara · Security", "Beta release go/no-go", "Beta release is planned for the 3rd. It depends on the security audit sign-off.", "Action required"},
            {"W", "4", "11", "Davide · Audit", "Audit delayed", "The external audit team can only start next week. Sign-off will not be ready before the 5th.", "Risk signal"},
            {"W", "3", "15", "Giulia · Sales", "Customer expects beta on the 3rd", "Globex was promised the beta on the 3rd; their pilot contract has a €40,000 penalty clause for late delivery.", "Critical"},
            {"P", "8", "10", "Airline", "Flight cancelled", "Your flight on the 12th was cancelled. Rebook before the 6th or request a refund.", "Critical"},
            {"P", "7", "18", "Hotel", "Booking is non-refundable", "Your reservation from the 12th is non-refundable after the 8th. Cancel before then to avoid a €220 fee.", "Risk signal"},
            {"P", "5", "20", "Conference", "Check-in closes on the 9th", "Badge pickup requires confirming your attendance by the 9th, otherwise your ticket is released.", "Action required"}};

    static List<Email> generate(Long uid, int n, long seed, ZoneId zone, LocalDate today) {
        var rnd = new Random(seed);
        var out = new ArrayList<Email>();
        var dow = DateTimeFormatter.ofPattern("EEEE", Locale.ENGLISH);
        var day = DateTimeFormatter.ofPattern("MMMM d", Locale.ENGLISH);
        for (var s : STORIES) {
            out.add(mail(uid, "W".equals(s[0]) ? Space.WORK : Space.PERSONAL, s[3], s[4], s[5], s[6],
                    today.minusDays(Long.parseLong(s[1])).atTime(Integer.parseInt(s[2]), rnd.nextInt(60)).atZone(zone).toInstant()));
        }
        while (out.size() < n) {
            var work = rnd.nextInt(100) < 65; // 65% work, 35% personal
            var pool = work ? WORK : PERSONAL;
            var t = pool.get(rnd.nextInt(pool.size()));
            var person = pick(rnd, PEOPLE);
            var when = today.minusDays(1 + rnd.nextInt(30)); // never today: no mail from the future
            if (when.getDayOfWeek().getValue() > 5 && work) when = when.minusDays(when.getDayOfWeek().getValue() - 5); // work mail on weekdays
            var args = new Object[] {person, pick(rnd, CLIENTS), pick(rnd, PROJECTS), pick(rnd, TEAMS), String.format(Locale.ENGLISH, "%,d", (1 + rnd.nextInt(80)) * 250L),
                    today.plusDays(1 + rnd.nextInt(14)).format(day), pick(rnd, ROOMS), dow.format(today.plusDays(1 + rnd.nextInt(7))), 1000 + rnd.nextInt(9000)};
            var from = t[0].equals("P") ? person : t[0].replace("P ·", person + " ·").formatted(args);
            out.add(mail(uid, work ? Space.WORK : Space.PERSONAL, from, t[1].formatted(args), t[2].formatted(args), t[3],
                    when.atTime(7 + rnd.nextInt(12), rnd.nextInt(60)).atZone(zone).toInstant()));
        }
        return out;
    }

    private static String pick(Random r, String[] a) { return a[r.nextInt(a.length)]; }

    private static Email mail(Long uid, Space s, String from, String subject, String body, String priority, java.time.Instant at) {
        var e = new Email();
        e.userId = uid; e.space = s; e.sender = from; e.subject = subject; e.body = body; e.priority = priority; e.receivedAt = at;
        return e;
    }
}
