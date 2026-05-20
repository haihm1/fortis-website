package vn.fortis.website.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.fortis.website.entity.NavigationMenuEntity;

public interface NavigationMenuRepository extends JpaRepository<NavigationMenuEntity, String> {

	List<NavigationMenuEntity> findAllByOrderBySortOrderAsc();

	List<NavigationMenuEntity> findByVisibleTrueOrderBySortOrderAsc();
}
