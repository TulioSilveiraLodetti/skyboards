package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String remetente;

    public void enviarEmail(String destinatario, String titulo, String descricao) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        if (remetente != null && !remetente.isBlank()) {
            helper.setFrom(remetente);
        }
        helper.setTo(destinatario);
        helper.setSubject(titulo);
        helper.setText(descricao, true);
        mailSender.send(message);
    }

}
