package it.rfactor.api.model;

import jakarta.persistence.*;

@Embeddable
public record ChainNode(String title, String detail) {}
