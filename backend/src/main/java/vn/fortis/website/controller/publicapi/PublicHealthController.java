package vn.fortis.website.controller.publicapi;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PublicHealthController {

	@GetMapping("/")
	public String root() {
		return "Fortis VN API";
	}

	@GetMapping("/health")
	public String health() {
		return "OK";
	}
}
