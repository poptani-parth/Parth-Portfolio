package com.parth.portfolio.portfolio.contact.service;

import com.parth.portfolio.portfolio.contact.dto.ContactRequest;

public interface ContactMailService {

    void sendContactNotification(ContactRequest request);
}