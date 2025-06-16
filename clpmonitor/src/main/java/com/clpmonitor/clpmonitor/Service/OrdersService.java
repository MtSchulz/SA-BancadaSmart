package com.clpmonitor.clpmonitor.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import com.clpmonitor.clpmonitor.Model.Orders;
import com.clpmonitor.clpmonitor.Repository.OrdersRepository;

public class OrdersService {
    @Autowired
    private OrdersRepository ordersRepository;

    public Orders saveOrders(Orders orders) {
        return ordersRepository.save(orders);
    }

    public List<Orders> lisOrders() {
        return ordersRepository.findAll();
    }

    public Orders findById(Long id) {
        Optional<Orders> orders = ordersRepository.findById(id);
        return orders.orElseThrow(() -> new RuntimeException("Order Não Encontrada"));
    }

    public void deleteById(Long id) {
        ordersRepository.deleteById(id);
    }
}
