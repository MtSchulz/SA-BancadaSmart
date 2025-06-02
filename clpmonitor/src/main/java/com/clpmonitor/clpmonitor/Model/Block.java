package com.clpmonitor.clpmonitor.Model;

import com.mysql.cj.x.protobuf.MysqlxCrud.Order;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "block")
public class Block {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    private Integer position;
    private Integer color;
    
    @ManyToOne
    @JoinColumn(name = "storage_id")
    private Storage storage;
    
    @ManyToOne
    @JoinColumn(name = "production_order_id")
    private Order productionOrder;

    
    // getters e setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    public Integer getColor() {
        return color;
    }

    public void setColor(Integer color) {
        this.color = color;
    }

    public Storage getStorage() {
        return storage;
    }

    public void setStorage(Storage storage) {
        this.storage = storage;
    }

    public Order getProductionOrder() {
        return productionOrder;
    }

    public void setProductionOrder(Order productionOrder) {
        this.productionOrder = productionOrder;
    }    
}