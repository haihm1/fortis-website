package vn.fortis.website.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.fortis.website.entity.ContentProfileEntity;

public interface ContentProfileRepository extends JpaRepository<ContentProfileEntity, String> {
}
