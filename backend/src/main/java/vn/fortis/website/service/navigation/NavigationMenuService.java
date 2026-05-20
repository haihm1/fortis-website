package vn.fortis.website.service.navigation;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import vn.fortis.website.dto.navigation.AdminNavigationMenuUpdateRequest;
import vn.fortis.website.dto.navigation.NavigationMenuResponse;
import vn.fortis.website.entity.NavigationMenuEntity;
import vn.fortis.website.repository.NavigationMenuRepository;

@Service
@Transactional
public class NavigationMenuService {

	private static final Set<String> ALLOWED_KEYS = Set.of(
			"home",
			"about",
			"services",
			"products",
			"export-market"
	);

	private final NavigationMenuRepository navigationMenuRepository;

	public NavigationMenuService(NavigationMenuRepository navigationMenuRepository) {
		this.navigationMenuRepository = navigationMenuRepository;
	}

	@Transactional(readOnly = true)
	public NavigationMenuResponse getPublicMenu(String lang) {
		String locale = normalizeLocale(lang);
		return new NavigationMenuResponse(
				locale,
				navigationMenuRepository.findByVisibleTrueOrderBySortOrderAsc().stream()
						.map(menu -> mapMenu(menu, locale))
						.toList()
		);
	}

	@Transactional(readOnly = true)
	public NavigationMenuResponse getAdminMenu() {
		return new NavigationMenuResponse(
				"admin",
				navigationMenuRepository.findAllByOrderBySortOrderAsc().stream()
						.map(menu -> mapMenu(menu, "en"))
						.toList()
		);
	}

	public NavigationMenuResponse updateAdminMenu(AdminNavigationMenuUpdateRequest request) {
		Map<String, NavigationMenuEntity> existingMenus = navigationMenuRepository.findAll().stream()
				.collect(java.util.stream.Collectors.toMap(NavigationMenuEntity::getKey, menu -> menu));

		List<NavigationMenuEntity> updatedMenus = request.items().stream()
				.map(item -> {
					if (!ALLOWED_KEYS.contains(item.key())) {
						throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported menu key: " + item.key());
					}
					NavigationMenuEntity menu = existingMenus.getOrDefault(item.key(), new NavigationMenuEntity());
					menu.setKey(item.key());
					menu.setLabelVi(item.labelVi().trim());
					menu.setLabelEn(item.labelEn().trim());
					menu.setLabelZh(nullableTrim(item.labelZh()));
					menu.setPath(normalizePath(item.path()));
					menu.setSortOrder(item.sortOrder());
					menu.setVisible(Boolean.TRUE.equals(item.visible()));
					return menu;
				})
				.toList();

		navigationMenuRepository.saveAll(updatedMenus);
		return getAdminMenu();
	}

	private NavigationMenuResponse.MenuItem mapMenu(NavigationMenuEntity menu, String locale) {
		return new NavigationMenuResponse.MenuItem(
				menu.getKey(),
				localizedLabel(menu, locale),
				menu.getLabelVi(),
				menu.getLabelEn(),
				menu.getLabelZh(),
				menu.getPath(),
				menu.getSortOrder(),
				menu.isVisible()
		);
	}

	private String localizedLabel(NavigationMenuEntity menu, String locale) {
		return switch (locale) {
			case "vi" -> menu.getLabelVi();
			case "zh" -> textWithFallback(menu.getLabelZh(), menu.getLabelEn(), menu.getLabelVi());
			default -> textWithFallback(menu.getLabelEn(), menu.getLabelVi());
		};
	}

	private String normalizeLocale(String lang) {
		if ("vi".equalsIgnoreCase(lang)) {
			return "vi";
		}
		if ("zh".equalsIgnoreCase(lang) || "cn".equalsIgnoreCase(lang) || "zh-cn".equalsIgnoreCase(lang)) {
			return "zh";
		}
		return "en";
	}

	private String normalizePath(String path) {
		String trimmedPath = path.trim();
		if (trimmedPath.startsWith("/") || trimmedPath.startsWith("#")) {
			return trimmedPath;
		}
		return "/" + trimmedPath;
	}

	private String nullableTrim(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		return value.trim();
	}

	private String textWithFallback(String... values) {
		for (String value : values) {
			if (value != null && !value.isBlank()) {
				return value;
			}
		}
		return "";
	}
}
