package vn.fortis.website.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.fortis.website.entity.ContactRequestEntity;

public interface ContactRequestRepository extends JpaRepository<ContactRequestEntity, String> {
}
