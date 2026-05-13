package vn.fortis.website.config.bootstrap;


import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        Cloudinary cloudinary = null;
        Map config = new HashMap();
        config.put("cloud_name", "dakmg2dj2");
        config.put("api_key", "215599276798438");
        config.put("api_secret", "vlxu5T9P2rRi8WJVih-uzOIjB3U");
        cloudinary = new Cloudinary(config);
        return cloudinary;
    }

}
