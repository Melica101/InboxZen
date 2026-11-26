package it.rfactor.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity @Table(name = "app_user")
public class User {
    @Id @GeneratedValue public Long id;
    @Column(unique = true, nullable = false) public String email;
    public String name;
    @JsonIgnore public String passwordHash;
    // permissions (mock "Privacy center")
    public boolean analyzeWork = true;
    public boolean analyzePersonal = true;
    public boolean crossCalendar = true;
    @Enumerated(EnumType.STRING) public Autonomy autonomy = Autonomy.APPROVAL_REQUIRED;

    public boolean canAnalyze(Space s) { return s == Space.WORK ? analyzeWork : analyzePersonal; }
}
