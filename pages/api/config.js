// pages/api/config.js
export default function handler(req, res) {
  res.status(200).json({
    USE_5ETOOLS: process.env.USE_5ETOOLS,
    API_URL: process.env['5E_API'] || 'https://www.dnd5eapi.co/'
  });
}
