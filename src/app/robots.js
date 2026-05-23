export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/advisor/',
        '/broker/',
        '/buyer/',
        '/seller/',
        '/settings/',
        '/saved/',
        '/checkout/',
        '/update-password/',
        '/auth/',
        '/forgot-password/',
        '/login/',
        '/signup/'
      ]
    },
    sitemap: 'https://www.dealiomarketplace.com/sitemap.xml'
  };
}
