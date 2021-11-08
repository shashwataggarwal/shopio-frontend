const commerce = require('./commerce.config.json')

module.exports = {
  commerce,
  images: {
    domains: [
      'localhost',
      'demo.vendure.io',
      '192.168.202.48',
      'lh3.googleusercontent.com',
      process.env.NEXT_PUBLIC_VENDURE_ENDPOINT_DOMAIN,
    ],
  },
}
