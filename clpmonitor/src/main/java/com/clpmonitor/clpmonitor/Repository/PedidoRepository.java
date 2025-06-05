package com.clpmonitor.clpmonitor.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clpmonitor.clpmonitor.Model.Pedido;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
}
