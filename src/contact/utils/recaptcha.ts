import axios from 'axios';

export async function validateRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const url = 'https://www.google.com/recaptcha/api/siteverify';
  const params = new URLSearchParams({
    secret,
    response: token,
  });

  const res = await axios.post(url, params);
  return res.data.success === true;
}
