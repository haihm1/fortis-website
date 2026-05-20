package vn.fortis.website.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.fortis.website.entity.ExportMarketArticleEntity;

public interface ExportMarketArticleRepository extends JpaRepository<ExportMarketArticleEntity, String> {

	List<ExportMarketArticleEntity> findByActiveTrueOrderByPublishedAtDesc();

	List<ExportMarketArticleEntity> findAllByOrderByPublishedAtDesc();

	Optional<ExportMarketArticleEntity> findBySlugAndActiveTrue(String slug);

	Optional<ExportMarketArticleEntity> findBySlug(String slug);
}
