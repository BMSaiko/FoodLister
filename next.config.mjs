/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['example.com', 'images.secretlab.co', 
        'th.bing.com',
        'images.unsplash.com',
        'source.unsplash.com',
        'i.imgur.com',
        'res.cloudinary.com',
        'images.pexels.com',
        'picsum.photos',
        'upload.wikimedia.org'
      ], // adicione outros domínios conforme necessário
    },
    reactStrictMode: true,
  };

export default nextConfig;
