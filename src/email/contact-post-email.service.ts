import { Injectable } from '@nestjs/common';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

// Usar require por compatibilidad
const nodemailer = require('nodemailer');

export interface ContactEmailData {
  nombre: string;
  apellido: string;
  email: string;
  empresa: string;
  mensaje: string;
  area_de_servicio: string[];
  telefono?: string;
}

@Injectable()
export class ContactPostEmailService {
  private smtpConfig: SMTPTransport.Options = {
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.ZOHO_MAIL_USER as string,
      pass: process.env.ZOHO_MAIL_PASS as string,
    },
  };

  private transporter: any = nodemailer.createTransport(this.smtpConfig);

  async sendContactEmail(data: ContactEmailData): Promise<void> {
    const html = `
      <div>
        <h2>Mensaje recibido de:</h2>
        <div><b>Nombre:</b> ${data.nombre} ${data.apellido}</div>
        <div><b>Email:</b> ${data.email}</div>
        <div><b>Teléfono:</b> ${data.telefono ?? '-'}</div>
        <div><b>Empresa:</b> ${data.empresa}</div>        
        <div><b>Áreas de servicio:</b> ${data.area_de_servicio.join(', ')}</div>
        <div><b>Consulta:</b> ${data.mensaje}</div>
      </div>
    `;
    await this.transporter.sendMail({
      from: 'No Reply <no-reply@rombux.com>',
      to: 'central@rombux.com',
      subject: 'Formulario de consulta vía rombux.com',
      html,
    });
  }
}
