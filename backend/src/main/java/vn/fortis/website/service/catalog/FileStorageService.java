package vn.fortis.website.service.catalog;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FileStorageService {

	private final Path uploadRoot;

	public FileStorageService(@Value("${app.storage.upload-dir}") String uploadDir) {
		this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
	}

	public String store(MultipartFile file, String subDirectory) {
		if (file == null || file.isEmpty()) {
			return null;
		}

		try {
			Path targetDirectory = uploadRoot.resolve(subDirectory).normalize();
			Files.createDirectories(targetDirectory);

			String originalName = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
			String extension = extractExtension(originalName);
			String fileName = UUID.randomUUID() + extension;
			Path targetFile = targetDirectory.resolve(fileName);

			try (InputStream inputStream = file.getInputStream()) {
				Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
			}

			return "/uploads/" + subDirectory + "/" + fileName;
		} catch (IOException exception) {
			throw new ResponseStatusException(
					HttpStatus.INTERNAL_SERVER_ERROR,
					"Failed to store uploaded file",
					exception
			);
		}
	}

	private String extractExtension(String originalName) {
		int separatorIndex = originalName.lastIndexOf('.');
		if (separatorIndex < 0) {
			return "";
		}
		return originalName.substring(separatorIndex);
	}
}
