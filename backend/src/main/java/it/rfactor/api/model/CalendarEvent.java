package it.rfactor.api.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class CalendarEvent extends Owned {
    public String title;
    public Instant startAt;
    public Instant endAt;
}
