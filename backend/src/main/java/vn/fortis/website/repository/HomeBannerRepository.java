package vn.fortis.website.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.fortis.website.entity.HomeBannerEntity;

public interface HomeBannerRepository extends JpaRepository<HomeBannerEntity, Integer> {

	List<HomeBannerEntity> findAllByOrderBySlotAsc();
}
