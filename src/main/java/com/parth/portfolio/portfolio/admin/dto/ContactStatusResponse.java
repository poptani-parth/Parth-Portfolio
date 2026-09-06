package com.parth.portfolio.portfolio.admin.dto;

import com.parth.portfolio.common.enums.ContactMessageStatus;

public record ContactStatusResponse( String id, ContactMessageStatus status ) { }
