/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      // Domínios base existentes
      'example.com',
      'images.secretlab.co',
      'th.bing.com',
      'images.unsplash.com',
      'source.unsplash.com',
      'i.imgur.com',
      'res.cloudinary.com',
      'images.pexels.com',
      'picsum.photos',
      'upload.wikimedia.org',
      
      // Serviços de armazenamento e CDN populares
      'storage.googleapis.com',
      's3.amazonaws.com',
      'amazonaws.com',
      'media.giphy.com',
      'giphy.com',
      'cdn.pixabay.com',
      'pixabay.com',
      'img.freepik.com',
      'freepik.com',
      'dl.airtable.com',
      'airtable.com',
      
      // Plataformas de hospedagem de imagens
      'imgbb.com',
      'ibb.co',
      'imageshack.com',
      'postimg.cc',
      'postimages.org',
      'imagekit.io',
      
      // Redes sociais e plataformas de conteúdo
      'media.istockphoto.com',
      'static.wixstatic.com',
      'githubusercontent.com',
      'raw.githubusercontent.com',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'drive.google.com',
      
      // Serviços de banco de imagens e hospedagem
      'images.ctfassets.net',
      'images.contentful.com',
      'media.graphassets.com',
      'cdn.sanity.io',
      'cdn.dribbble.com',
      'fastly.picsum.photos',
      
      // Serviços de otimização de imagens
      'res.imgix.net',
      'images.imgix.net',
      'images.prismic.io',
      
      // Supabase
      'supabase.co',
      'supabase.in',
      'storage.supabase.co',
      
      // CDNs e serviços adicionais
      'cdn.jsdelivr.net',
      'cdnjs.cloudflare.com',
      'cdn.shopify.com',
      'assets.squarespace.com',
      'images.squarespace-cdn.com',
      'cdn.builder.io',
      'cdn-images-1.medium.com',
      'miro.medium.com',
      
      // Redes sociais
      'pbs.twimg.com',
      'scontent.cdninstagram.com',
      'scontent-iad3-1.cdninstagram.com',
      'scontent-iad3-2.cdninstagram.com',
      'graph.facebook.com',
      'platform-lookaside.fbsbx.com',
      'scontent.xx.fbcdn.net',
      'media-exp1.licdn.com',
      'media-exp2.licdn.com',
      'media-exp3.licdn.com',
      'static01.nyt.com',
      'media.npr.org',
      
      // Serviços de vídeo e imagem
      'img.youtube.com',
      'i.ytimg.com',
      'vimeo.com',
      'i.vimeocdn.com',
      'player.vimeo.com',
      'f.vimeocdn.com',
      
      // Plataformas para desenvolvedores
      'avatars.githubusercontent.com',
      'user-images.githubusercontent.com',
      'camo.githubusercontent.com',
      'repository-images.githubusercontent.com',
      
      // Hospedagem de sites
      'assets.vercel.com',
      'images.prismic.io',
      'images.contentstack.io',
      'images.ctfassets.net',
      'assets.website-files.com',
      'cdn.webflow.com',
      'netlify.app',
      'netlify-cdn.com',
      'assets.digitalocean.com',
      
      // E-commerce
      'images.tokopedia.net',
      'shopee.com',
      'shopee.sg',
      'cf.shopee.com.my',
      'images.tcdn.com.br',
      'images.kabum.com.br',
      'dafitistatic-a.akamaihd.net',
      'statics.olx.com.br',
      'static.zara.net',
      'static.nike.com',
      'assets.adidas.com',
      'images.footlocker.com',
      
      // Mais mídias sociais e blogs
      'static.tumblr.com',
      'media.tumblr.com',
      '64.media.tumblr.com',
      'wp.com',
      'i0.wp.com',
      'i1.wp.com',
      'i2.wp.com',
      'secure.gravatar.com',
      'gravatar.com',
      
      // Plataformas adicionais
      'live.staticflickr.com',
      'flickr.com',
      'images.squarespace-cdn.com',
      'images.unsplash.com',
      'plus.unsplash.com',
      'media.gettyimages.com',
      'media.newyorker.com',
      
      // Outros serviços populares
      'images.afterpay.com',
      'images.carsales.com.au',
      'images.carexpert.com.au',
      'lh3.googleusercontent.com',
      'lh4.googleusercontent.com',
      'lh5.googleusercontent.com',
      'lh6.googleusercontent.com',
      'bp.blogspot.com',
      'feeds.feedburner.com'
    ],
  },
  reactStrictMode: true,
};