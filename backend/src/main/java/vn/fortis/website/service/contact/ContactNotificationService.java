package vn.fortis.website.service.contact;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class ContactNotificationService {

	private static final Logger LOGGER = LoggerFactory.getLogger(ContactNotificationService.class);

	private final ObjectProvider<JavaMailSender> mailSenderProvider;
	private final String notificationEmail;

	public ContactNotificationService(
			ObjectProvider<JavaMailSender> mailSenderProvider,
			@Value("${app.contact.notification-email:}") String notificationEmail
	) {
		this.mailSenderProvider = mailSenderProvider;
		this.notificationEmail = notificationEmail == null ? "" : notificationEmail.trim();
	}

	public void notifyNewContact(ContactMessage contactMessage) {
		if (notificationEmail.isBlank()) {
			LOGGER.info("New contact received from {} <{}>; notification email not configured",
					contactMessage.fullName(), contactMessage.email());
			return;
		}

		JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
		if (mailSender == null) {
			LOGGER.warn("New contact received from {} <{}>; mail sender is unavailable",
					contactMessage.fullName(), contactMessage.email());
			return;
		}

		SimpleMailMessage mailMessage = new SimpleMailMessage();
		mailMessage.setTo(notificationEmail);
		mailMessage.setSubject("[FortisVN] New contact request from " + contactMessage.fullName());
		mailMessage.setText(buildEmailBody(contactMessage));

		try {
			mailSender.send(mailMessage);
		} catch (Exception exception) {
			LOGGER.error("Failed to send contact notification email", exception);
		}
	}

	private String buildEmailBody(ContactMessage contactMessage) {
		return """
				New customer contact received.

				Name: %s
				Company: %s
				Email: %s
				Phone: %s
				Product interest: %s
				Requested quantity: %s
				Target market: %s
				Specification details: %s
				Attachment: %s
				Message:
				%s
				""".formatted(
				contactMessage.fullName(),
				nullable(contactMessage.companyName()),
				contactMessage.email(),
				nullable(contactMessage.phoneNumber()),
				nullable(contactMessage.productInterest()),
				nullable(contactMessage.requestedQuantity()),
				nullable(contactMessage.targetMarket()),
				nullable(contactMessage.specificationDetails()),
				nullable(contactMessage.attachmentUrl()),
				contactMessage.message()
		);
	}

	private String nullable(String value) {
		return value == null || value.isBlank() ? "(not provided)" : value;
	}

	public record ContactMessage(
			String fullName,
			String companyName,
			String email,
			String phoneNumber,
			String productInterest,
			String requestedQuantity,
			String targetMarket,
			String specificationDetails,
			String attachmentUrl,
			String message
	) {
	}
}
