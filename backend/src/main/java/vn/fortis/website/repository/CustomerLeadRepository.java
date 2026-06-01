package vn.fortis.website.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.fortis.website.entity.CustomerLeadEntity;

public interface CustomerLeadRepository extends JpaRepository<CustomerLeadEntity, String> {
}
