package com.clpmonitor.clpmonitor.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clpmonitor.clpmonitor.Model.Orders;

public interface OrdersRepository extends JpaRepository<Orders, Long> {

}
