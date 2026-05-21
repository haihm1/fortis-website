package vn.fortis.website.service.cloudinary;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;

@Service
public class CloudinaryServiceImpl implements CloudinaryService {
    private final Cloudinary cloudinary;

    public CloudinaryServiceImpl(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }


    @Override
    public Map upload(MultipartFile file) {
        try{
            Map data = this.cloudinary.uploader().upload(file.getBytes(), Map.of());
            return data;
        }catch (IOException io){
            throw new RuntimeException("Image upload fail");
        }
    }

    @Override
    public boolean deleteByUrl(String imageUrl) {
        Optional<String> publicId = extractPublicId(imageUrl);
        if (publicId.isEmpty()) {
            return false;
        }

        try {
            Map result = this.cloudinary.uploader().destroy(publicId.get(), Map.of("resource_type", "image"));
            return "ok".equals(result.get("result")) || "not found".equals(result.get("result"));
        } catch (IOException io) {
            throw new RuntimeException("Image delete fail");
        }
    }

    private Optional<String> extractPublicId(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return Optional.empty();
        }

        URI uri;
        try {
            uri = URI.create(imageUrl);
        } catch (IllegalArgumentException exception) {
            return Optional.empty();
        }

        String host = uri.getHost();
        if (host == null || !host.endsWith("cloudinary.com")) {
            return Optional.empty();
        }

        String path = uri.getPath();
        int uploadIndex = path.indexOf("/upload/");
        if (uploadIndex < 0) {
            return Optional.empty();
        }

        String afterUpload = path.substring(uploadIndex + "/upload/".length());
        String[] segments = afterUpload.split("/");
        int start = 0;
        for (int index = 0; index < segments.length; index++) {
            if (segments[index].matches("v\\d+")) {
                start = index + 1;
                break;
            }
        }

        if (start >= segments.length) {
            return Optional.empty();
        }

        String publicId = String.join("/", java.util.Arrays.copyOfRange(segments, start, segments.length));
        int extensionIndex = publicId.lastIndexOf('.');
        if (extensionIndex > 0) {
            publicId = publicId.substring(0, extensionIndex);
        }

        publicId = URLDecoder.decode(publicId, StandardCharsets.UTF_8);
        return publicId.isBlank() ? Optional.empty() : Optional.of(publicId);
    }
}
