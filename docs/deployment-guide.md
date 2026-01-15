# Deployment Guide

This guide covers the deployment process for the FoodList application, including different deployment platforms, environment configuration, and production optimization.

## Deployment Platforms

### Vercel (Recommended)

Vercel is the recommended deployment platform for Next.js applications due to its seamless integration and performance optimizations.

#### Automatic Deployment

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js project

2. **Configure Project**
   - **Framework Preset**: Next.js (automatically detected)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` (automatically detected)
   - **Output Directory**: `.next` (automatically detected)

3. **Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your_secure_random_secret
   IMGUR_CLIENT_ID=your_imgur_client_id
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - You'll get a production URL like `https://foodlist.vercel.app`

#### Custom Domain
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

#### Preview Deployments
- Every push to feature branches creates a preview deployment
- Preview deployments have URLs like `https://feature-branch.foodlist.vercel.app`
- Useful for testing changes before merging

### Netlify

#### Setup
1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "New site from Git"
   - Choose your Git provider and repository

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Environment Variables**
   Set the same environment variables as mentioned in Vercel section

4. **Deploy**
   - Netlify will build and deploy automatically
   - Provides preview deployments for branches

### Railway

#### Setup
1. **Connect Repository**
   - Go to [railway.app](https://railway.app) and sign in
   - Click "New Project" > "Deploy from GitHub repo"
   - Select your repository

2. **Environment Variables**
   Set all required environment variables in Railway dashboard

3. **Database**
   - Railway can provide PostgreSQL database
   - Or use external Supabase instance

### Self-Hosted (Docker)

#### Docker Setup

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base

   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app

   COPY package.json package-lock.json ./
   RUN npm ci --only=production

   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .

   ENV NEXT_TELEMETRY_DISABLED 1

   RUN npm run build

   # Production image, copy all the files and run next
   FROM base AS runner
   WORKDIR /app

   ENV NODE_ENV production
   ENV NEXT_TELEMETRY_DISABLED 1

   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   COPY --from=builder /app/public ./public

   # Set the correct permission for prerender cache
   RUN mkdir .next
   RUN chown nextjs:nodejs .next

   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

   USER nextjs

   EXPOSE 3000

   ENV PORT 3000

   CMD ["node", "server.js"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     foodlist:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
         - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
         - NEXTAUTH_URL=${NEXTAUTH_URL}
         - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
       restart: unless-stopped
   ```

3. **Build and Run**
   ```bash
   docker-compose up -d
   ```

## Environment Configuration

### Environment Variables

#### Required Variables
```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# NextAuth (Optional - for authentication)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secure-random-secret

# Imgur (Optional - for image uploads)
IMGUR_CLIENT_ID=your-imgur-client-id
```

#### Generating Secure Secrets
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use online generators for secure random strings
```

### Environment-Specific Configuration

#### Development
```env
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXTAUTH_URL=http://localhost:3000
```

#### Production
```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXTAUTH_URL=https://your-domain.com
```

## Database Setup

### Supabase Production Configuration

1. **Create Production Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project for production
   - Choose a strong database password

2. **Database Schema**
   Run the following SQL in Supabase SQL Editor:

   ```sql
   -- Create tables
   CREATE TABLE restaurants (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     image_url TEXT,
     price_per_person NUMERIC,
     rating NUMERIC CHECK (rating >= 0 AND rating <= 5),
     location TEXT,
     source_url TEXT,
     creator TEXT,
     menu_url TEXT,
     visited BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE TABLE cuisine_types (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL UNIQUE,
     description TEXT,
     icon TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE TABLE restaurant_cuisine_types (
     restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
     cuisine_type_id UUID REFERENCES cuisine_types(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     PRIMARY KEY (restaurant_id, cuisine_type_id)
   );

   CREATE TABLE lists (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     creator TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE TABLE list_restaurants (
     list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
     restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     PRIMARY KEY (list_id, restaurant_id)
   );

   -- Create indexes
   CREATE INDEX idx_restaurants_name ON restaurants USING gin(to_tsvector('english', name));
   CREATE INDEX idx_restaurants_creator ON restaurants(creator);
   CREATE INDEX idx_restaurants_visited ON restaurants(visited);
   CREATE INDEX idx_restaurants_rating ON restaurants(rating);
   CREATE INDEX idx_restaurants_price ON restaurants(price_per_person);

   CREATE INDEX idx_cuisine_types_name ON cuisine_types(name);

   CREATE INDEX idx_restaurant_cuisine_types_restaurant_id ON restaurant_cuisine_types(restaurant_id);
   CREATE INDEX idx_restaurant_cuisine_types_cuisine_type_id ON restaurant_cuisine_types(cuisine_type_id);

   CREATE INDEX idx_list_restaurants_list_id ON list_restaurants(list_id);
   CREATE INDEX idx_list_restaurants_restaurant_id ON list_restaurants(restaurant_id);

   -- Enable Row Level Security
   ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
   ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
   ALTER TABLE cuisine_types ENABLE ROW LEVEL SECURITY;
   ALTER TABLE restaurant_cuisine_types ENABLE ROW LEVEL SECURITY;
   ALTER TABLE list_restaurants ENABLE ROW LEVEL SECURITY;

   -- Create RLS policies
   CREATE POLICY "Allow read access to restaurants" ON restaurants
   FOR SELECT USING (auth.role() = 'authenticated');

   CREATE POLICY "Allow insert access to restaurants" ON restaurants
   FOR INSERT WITH CHECK (auth.role() = 'authenticated');

   CREATE POLICY "Allow update access to own restaurants" ON restaurants
   FOR UPDATE USING (auth.uid()::text = creator);

   CREATE POLICY "Allow delete access to own restaurants" ON restaurants
   FOR DELETE USING (auth.uid()::text = creator);

   -- Similar policies for other tables...
   ```

3. **Seed Data**
   ```sql
   -- Insert cuisine types
   INSERT INTO cuisine_types (name, description, icon) VALUES
   ('Italian', 'Italian cuisine', '🍝'),
   ('Chinese', 'Chinese cuisine', '🥡'),
   ('Mexican', 'Mexican cuisine', '🌮'),
   ('Japanese', 'Japanese cuisine', '🍱'),
   ('French', 'French cuisine', '🥖');
   ```

## Performance Optimization

### Build Optimization

#### Next.js Configuration
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployments
  output: 'standalone',

  // Image optimization
  images: {
    domains: ['images.unsplash.com', 'i.imgur.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Compression
  compress: true,

  // Performance optimizations
  experimental: {
    // Enable optimizePackageImports for better tree shaking
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### CDN and Caching

#### Static Asset Optimization
- Next.js automatically optimizes static assets
- Images are automatically converted to WebP/AVIF
- CSS and JS are minified and compressed

#### Cache Headers
```javascript
// next.config.mjs - Cache configuration
export default {
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600',
          },
        ],
      },
    ];
  },
};
```

## Monitoring and Analytics

### Application Monitoring

#### Vercel Analytics
- Automatically enabled on Vercel deployments
- Provides real user monitoring
- Performance metrics and Core Web Vitals

#### Error Tracking
```javascript
// lib/error-tracking.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

#### Database Monitoring
- Supabase provides built-in monitoring
- Query performance insights
- Real-time metrics

### Health Checks

#### API Health Check
```javascript
// app/api/health/route.js
export async function GET() {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('restaurants')
      .select('count')
      .limit(1);

    if (error) throw error;

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 500 });
  }
}
```

## Security

### Production Security Checklist

- [ ] HTTPS enabled (automatic on Vercel/Netlify)
- [ ] Environment variables properly configured
- [ ] Database credentials not exposed
- [ ] Row Level Security enabled
- [ ] Input validation implemented
- [ ] XSS protection enabled
- [ ] CSRF protection configured
- [ ] Secure headers set

### SSL/TLS Configuration

Most platforms handle SSL automatically:
- **Vercel**: Automatic SSL certificates
- **Netlify**: Automatic HTTPS
- **Railway**: SSL certificates included

### Backup Strategy

#### Database Backups
- Supabase provides automatic backups
- Point-in-time recovery available
- Export data regularly for additional safety

#### Application Backups
- Code is backed up in Git
- Static assets cached by CDN
- Consider regular database snapshots

## Rollback Strategy

### Quick Rollback (Vercel)
```bash
# Rollback to previous deployment
vercel rollback
```

### Database Rollbacks
```sql
-- Create restore point before major changes
CREATE TABLE restaurants_backup AS
SELECT * FROM restaurants;

-- Restore if needed
INSERT INTO restaurants
SELECT * FROM restaurants_backup
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
```

## Scaling

### Horizontal Scaling
- Vercel automatically scales based on traffic
- Supabase handles database scaling
- CDN distributes static assets globally

### Database Scaling
- Supabase provides automatic scaling
- Consider read replicas for high-traffic applications
- Optimize queries and add proper indexes

### Performance Monitoring
- Monitor Core Web Vitals
- Track API response times
- Monitor database query performance
- Set up alerts for performance degradation

## Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Check build logs
npm run build

# Clear cache and retry
rm -rf .next node_modules/.cache
npm install
npm run build
```

#### Environment Variable Issues
```bash
# Verify environment variables are set
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### Database Connection Issues
```bash
# Test database connection
curl -X GET 'https://your-project.supabase.co/rest/v1/restaurants' \
  -H 'apikey: your-anon-key' \
  -H 'Authorization: Bearer your-anon-key'
```

### Performance Issues

#### Slow Page Loads
- Check for large bundle sizes
- Optimize images
- Implement proper caching
- Use Next.js performance monitoring

#### Database Slow Queries
- Add missing indexes
- Optimize query structure
- Implement query result caching
- Monitor Supabase query performance

This deployment guide should be updated as new deployment platforms or strategies are adopted.
