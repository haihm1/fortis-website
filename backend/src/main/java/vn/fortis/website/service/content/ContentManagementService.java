package vn.fortis.website.service.content;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import vn.fortis.website.dto.content.AdminBannerUpdateRequest;
import vn.fortis.website.dto.content.AdminContentProfileUpdateRequest;
import vn.fortis.website.dto.content.AdminContentResponse;
import vn.fortis.website.entity.ContentProfileEntity;
import vn.fortis.website.entity.HomeBannerEntity;
import vn.fortis.website.repository.ContentProfileRepository;
import vn.fortis.website.repository.HomeBannerRepository;
import vn.fortis.website.service.catalog.FileStorageService;

@Service
public class ContentManagementService {

	private static final String MAIN_PROFILE_ID = "main";

	private final FileStorageService fileStorageService;
	private final ContentProfileRepository contentProfileRepository;
	private final HomeBannerRepository homeBannerRepository;

	public ContentManagementService(
			FileStorageService fileStorageService,
			ContentProfileRepository contentProfileRepository,
			HomeBannerRepository homeBannerRepository
	) {
		this.fileStorageService = fileStorageService;
		this.contentProfileRepository = contentProfileRepository;
		this.homeBannerRepository = homeBannerRepository;
	}

	public synchronized AdminContentResponse getAdminContent() {
		ContentProfileEntity profile = requireMainProfile();
		return new AdminContentResponse(
				profile.getAboutArticleVi(),
				profile.getAboutArticleEn(),
				profile.getAddress(),
				profile.getHotline(),
				profile.getEmail(),
				homeBannerRepository.findAllByOrderBySlotAsc().stream().map(this::mapBanner).toList()
		);
	}

	public synchronized AdminContentResponse updateProfile(AdminContentProfileUpdateRequest request) {
		ContentProfileEntity profile = requireMainProfile();
		profile.setAboutArticleVi(request.aboutArticleVi());
		profile.setAboutArticleEn(request.aboutArticleEn());
		profile.setAddress(request.address());
		profile.setHotline(request.hotline());
		profile.setEmail(request.email());
		contentProfileRepository.save(profile);
		return getAdminContent();
	}

	public synchronized AdminContentResponse.BannerItem updateBanner(
			int slot,
			AdminBannerUpdateRequest request,
			MultipartFile image
	) {
		HomeBannerEntity existingBanner = requireBanner(slot);
		String imageUrl = image == null || image.isEmpty()
				? existingBanner.getImageUrl()
				: fileStorageService.store(image, "content/banners");

		existingBanner.setTitleVi(request.titleVi());
		existingBanner.setTitleEn(request.titleEn());
		existingBanner.setDescriptionVi(request.descriptionVi());
		existingBanner.setDescriptionEn(request.descriptionEn());
		existingBanner.setOverlayLabel(request.overlayLabel());
		existingBanner.setImageUrl(imageUrl);
		return mapBanner(homeBannerRepository.save(existingBanner));
	}

	public synchronized ContentSnapshot getSnapshot() {
		ContentProfileEntity profile = requireMainProfile();
		return new ContentSnapshot(
				profile.getAboutArticleVi(),
				profile.getAboutArticleEn(),
				profile.getAddress(),
				profile.getHotline(),
				profile.getEmail(),
				homeBannerRepository.findAllByOrderBySlotAsc().stream()
						.map(this::toBannerRecord)
						.toList()
		);
	}

	private ContentProfileEntity requireMainProfile() {
		return contentProfileRepository.findById(MAIN_PROFILE_ID)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Content profile not found"));
	}

	private HomeBannerEntity requireBanner(int slot) {
		return homeBannerRepository.findById(slot)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Banner slot not found"));
	}

	private AdminContentResponse.BannerItem mapBanner(HomeBannerEntity banner) {
		return new AdminContentResponse.BannerItem(
				banner.getSlot(),
				banner.getTitleVi(),
				banner.getTitleEn(),
				banner.getDescriptionVi(),
				banner.getDescriptionEn(),
				banner.getOverlayLabel(),
				banner.getImageUrl()
		);
	}

	private BannerRecord toBannerRecord(HomeBannerEntity banner) {
		return new BannerRecord(
				banner.getSlot(),
				banner.getTitleVi(),
				banner.getTitleEn(),
				banner.getDescriptionVi(),
				banner.getDescriptionEn(),
				banner.getOverlayLabel(),
				banner.getImageUrl()
		);
	}

	public record ContentSnapshot(
			String aboutArticleVi,
			String aboutArticleEn,
			String address,
			String hotline,
			String email,
			List<BannerRecord> banners
	) {
	}

	public record BannerRecord(
			int slot,
			String titleVi,
			String titleEn,
			String descriptionVi,
			String descriptionEn,
			String overlayLabel,
			String imageUrl
	) {
	}
}
