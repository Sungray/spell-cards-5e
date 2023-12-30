// pages/api/config.js
export default function handler(req, res) {
  const apiURL = process.env['5E_API'] || 'https://www.dnd5eapi.co/';
  // Ensure the URL ends with a slash
  const apiUrlWithSlash = apiURL.endsWith('/') ? apiURL : `${apiURL}/`;

  res.status(200).json({
    USE_5ETOOLS: process.env.USE_5ETOOLS,
    API_URL: apiUrlWithSlash
  });
}
