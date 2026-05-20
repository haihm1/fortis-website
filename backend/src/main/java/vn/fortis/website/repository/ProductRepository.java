package vn.fortis.website.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import vn.fortis.website.entity.ProductEntity;

public interface ProductRepository extends JpaRepository<ProductEntity, String> {

	@Override
	@EntityGraph(attributePaths = "category")
	Optional<ProductEntity> findById(String id);

	@EntityGraph(attributePaths = "category")
	Optional<ProductEntity> findBySlugIgnoreCase(String slug);

	boolean existsBySlugIgnoreCase(String slug);

	@Override
	@EntityGraph(attributePaths = "category")
	List<ProductEntity> findAll();

	@EntityGraph(attributePaths = "category")
	List<ProductEntity> findByActiveTrueOrderByCreatedAtAsc();

	@EntityGraph(attributePaths = "category")
	List<ProductEntity> findByActiveTrueAndFeaturedTrueOrderByCreatedAtAsc();

	boolean existsByCategory_Id(String categoryId);
}
