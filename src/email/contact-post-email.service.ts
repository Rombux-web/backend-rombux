import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(ContactPostEmailService.name);

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

  constructor() {
    // Log de instancia para debug (puedes quitarlo luego)
    this.logger.log('ContactPostEmailService instantiated');
  }

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

  /**
   * Enviar email para un envío de campaña genérico.
   * Recibe el id, nombre de campaña y payload (objeto). Convierte el payload
   * a HTML legible y lo envía al buzón central.
   */
  async sendCampaignEmail(payload: {
    id?: number;
    campaign: string;
    payload: Record<string, unknown>;
    received_at?: Date;
    source?: string;
    ip?: string;
    user_agent?: string;
  }): Promise<void> {
    const to = process.env.CAMPAIGN_EMAIL_TO ?? 'central@rombux.com';
    const subject = `[Campaña:${payload.campaign}] Nuevo envío${payload.id ? ' #' + payload.id : ''}`;

    const html = `
      <div>
        <h2>Nuevo envío de campaña: ${payload.campaign}</h2>
        <div><b>ID:</b> ${payload.id ?? '-'}</div>
        <div><b>Recibido en:</b> ${payload.received_at ?? new Date().toISOString()}</div>
        <div><b>Origen:</b> ${payload.source ?? '-'}</div>
        <div><b>IP:</b> ${payload.ip ?? '-'}</div>
        <div><b>User-Agent:</b> ${payload.user_agent ?? '-'}</div>
        <hr />
        <h3>Datos enviados:</h3>
        ${this.renderPayloadAsHtml(payload.payload)}
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM ?? 'no-reply@rombux.com',
        to,
        subject,
        html,
      });
      this.logger.log(`Email de campaign ${payload.campaign} enviado a ${to}`);
    } catch (err) {
      this.logger.error(
        'Error enviando email de campaign',
        (err as Error)?.stack ?? String(err),
      );
      throw err;
    }
  }

  /**
   * Helper simple que transforma un objeto JS en HTML legible.
   * - Objetos/arrays se muestran en <pre> con JSON pretty-print.
   * - Valores primitivos se muestran en lista.
   */
  private renderPayloadAsHtml(data: Record<string, unknown>): string {
    const parts: string[] = ['<ul style="list-style:none;padding:0;margin:0">'];

    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) {
        parts.push(`<li><b>${this.escapeHtml(key)}:</b> -</li>`);
      } else if (typeof value === 'object') {
        // Para objetos complejos o arrays, mostramos JSON formateado en <pre>
        parts.push(
          `<li><b>${this.escapeHtml(key)}:</b><br/><pre style="background:#f6f6f6;padding:8px;border-radius:4px;">${this.escapeHtml(
            JSON.stringify(value, null, 2),
          )}</pre></li>`,
        );
      } else {
        parts.push(
          `<li><b>${this.escapeHtml(key)}:</b> ${this.escapeHtml(String(value))}</li>`,
        );
      }
    }

    parts.push('</ul>');
    return parts.join('');
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
