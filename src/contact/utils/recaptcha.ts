import axios from 'axios';

/**
 * Valida el token reCAPTCHA v2/v3 con Google.
 * @param token El token recibido desde el frontend
 * @returns true si es válido, false si no
 */
export async function validateRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) throw new Error('RECAPTCHA_SECRET_KEY not set in environment');

  const url = 'https://www.google.com/recaptcha/api/siteverify';
  const params = new URLSearchParams({
    secret,
    response: token,
  });

  try {
    const res = await axios.post(url, params);
    return res.data.success === true;
  } catch (error) {
    // Si falla la petición, consideramos el captcha inválido
    return false;
  }
}
