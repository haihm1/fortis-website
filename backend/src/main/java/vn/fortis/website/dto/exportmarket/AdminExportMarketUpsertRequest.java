package vn.fortis.website.dto.exportmarket;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminExportMarketUpsertRequest(
		@NotBlank @Size(max = 160) String slug,
		@NotBlank @Size(max = 260) String titleVi,
		@NotBlank @Size(max = 260) String titleEn,
		@Size(max = 260) String titleZh,
		@NotBlank String excerptVi,
		@NotBlank String excerptEn,
		String excerptZh,
		@NotBlank @Size(max = 500) String imageUrl,
		@NotBlank @Size(max = 120) String category,
		@NotBlank @Size(max = 120) String author,
		@NotNull LocalDate publishedAt,
		boolean featured,
		boolean active,
		@NotNull @Size(min = 1) List<@NotBlank String> paragraphsVi,
		@NotNull @Size(min = 1) List<@NotBlank String> paragraphsEn,
		List<@NotBlank String> paragraphsZh
) {
}
