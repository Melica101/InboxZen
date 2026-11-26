package it.rfactor.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

/** Every row belongs to one user and one space; userId is never serialized or read from clients. */
@MappedSuperclass
public abstract class Owned {
    @Id @GeneratedValue public Long id;
    @JsonIgnore @Column(nullable = false) public Long userId;
    @Enumerated(EnumType.STRING) @Column(nullable = false) public Space space;
}
