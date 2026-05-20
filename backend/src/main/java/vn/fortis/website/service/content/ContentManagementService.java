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
import vn.fortis.website.service.cloudinary.CloudinaryService;

@Service
public class ContentManagementService {

	private static final String MAIN_PROFILE_ID = "main";

	private final CloudinaryService cloudinaryService;
	private final ContentProfileRepository contentProfileRepository;
	private final HomeBannerRepository homeBannerRepository;

	public ContentManagementService(
			CloudinaryService cloudinaryService,
			ContentProfileRepository contentProfileRepository,
			HomeBannerRepository homeBannerRepository
	) {
		this.cloudinaryService = cloudinaryService;
		this.contentProfileRepository = contentProfileRepository;
		this.homeBannerRepository = homeBannerRepository;
	}

	public synchronized AdminContentResponse getAdminContent() {
		ContentProfileEntity profile = requireMainProfile();
		return new AdminContentResponse(
				profile.getAboutArticleVi(),
				profile.getAboutArticleEn(),
				profile.getAboutArticleZh(),
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
		profile.setAboutArticleZh(nullableTrim(request.aboutArticleZh()));
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
				: uploadImageToCloudinary(image);

		existingBanner.setTitleVi(request.titleVi());
		existingBanner.setTitleEn(request.titleEn());
		existingBanner.setTitleZh(nullableTrim(request.titleZh()));
		existingBanner.setDescriptionVi(request.descriptionVi());
		existingBanner.setDescriptionEn(request.descriptionEn());
		existingBanner.setDescriptionZh(nullableTrim(request.descriptionZh()));
		existingBanner.setOverlayLabel(request.overlayLabel());
		existingBanner.setImageUrl(imageUrl);
		return mapBanner(homeBannerRepository.save(existingBanner));
	}

	private String uploadImageToCloudinary(MultipartFile image) {
		Object secureUrl = cloudinaryService.upload(image).get("secure_url");
		if (secureUrl == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cloudinary upload did not return a secure URL");
		}
		return secureUrl.toString();
	}

	public synchronized ContentSnapshot getSnapshot() {
		ContentProfileEntity profile = requireMainProfile();
		return new ContentSnapshot(
				profile.getAboutArticleVi(),
				profile.getAboutArticleEn(),
				profile.getAboutArticleZh(),
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
				banner.getTitleZh(),
				banner.getDescriptionVi(),
				banner.getDescriptionEn(),
				banner.getDescriptionZh(),
				banner.getOverlayLabel(),
				banner.getImageUrl()
		);
	}

	private BannerRecord toBannerRecord(HomeBannerEntity banner) {
		return new BannerRecord(
				banner.getSlot(),
				banner.getTitleVi(),
				banner.getTitleEn(),
				banner.getTitleZh(),
				banner.getDescriptionVi(),
				banner.getDescriptionEn(),
				banner.getDescriptionZh(),
				banner.getOverlayLabel(),
				banner.getImageUrl()
		);
	}

	public record ContentSnapshot(
			String aboutArticleVi,
			String aboutArticleEn,
			String aboutArticleZh,
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
			String titleZh,
			String descriptionVi,
			String descriptionEn,
			String descriptionZh,
			String overlayLabel,
			String imageUrl
	) {
	}

	private String nullableTrim(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		return value.trim();
	}
}
