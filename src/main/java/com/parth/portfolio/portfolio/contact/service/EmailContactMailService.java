package com.parth.portfolio.portfolio.contact.service;

import com.parth.portfolio.portfolio.contact.dto.ContactRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailContactMailService implements ContactMailService {

    private final JavaMailSender mailSender;
    private final String notificationEmail;

    public EmailContactMailService(
            JavaMailSender mailSender,
            @Value("${contact.mail.to}") String notificationEmail) {

        this.mailSender = mailSender;
        this.notificationEmail = notificationEmail;
    }

    @Override
    public void sendContactNotification(ContactRequest request) {

        SimpleMailMessage mail = new SimpleMailMessage();

        mail.setTo(notificationEmail);

        String safeSubject = request.subject() == null
                ? "General Inquiry"
                : request.subject().replaceAll("[\\r\\n]", " ").trim();

        mail.setSubject(
                "Portfolio Contact: " + safeSubject
        );

        mail.setText("""
                New contact message from your portfolio.

                Name:
                %s

                Email:
                %s

                Subject:
                %s

                Message:
                %s
                """.formatted(
                request.name(),
                request.email(),
                request.subject(),
                request.message()
        ));

        mailSender.send(mail);
    }
}