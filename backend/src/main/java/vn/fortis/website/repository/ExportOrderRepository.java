package vn.fortis.website.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.fortis.website.entity.ExportOrderEntity;

public interface ExportOrderRepository extends JpaRepository<ExportOrderEntity, String> {
}
