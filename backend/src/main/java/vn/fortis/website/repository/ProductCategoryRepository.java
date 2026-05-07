package vn.fortis.website.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.fortis.website.entity.ProductCategoryEntity;

public interface ProductCategoryRepository extends JpaRepository<ProductCategoryEntity, String> {

	Optional<ProductCategoryEntity> findBySlugIgnoreCase(String slug);

	boolean existsBySlugIgnoreCase(String slug);

	List<ProductCategoryEntity> findByActiveTrueOrderByCreatedAtAsc();
}
