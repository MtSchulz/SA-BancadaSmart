package com.clpmonitor.clpmonitor.Model;

import jakarta.persistence.*;

@Entity
public class Orders {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "production_order")
    private String productionOrder;

    // getters e setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProductionOrder() { return productionOrder; }
    public void setProductionOrder(String productionOrder) { this.productionOrder = productionOrder; }
}