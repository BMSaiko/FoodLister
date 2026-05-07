# Deployment Guide#

This guide covers the deployment process for the FoodLister application, including different deployment platforms, environment configuration, and production optimization.

## Deployment Platforms#

### Vercel (Recommended)#

Vercel is the recommended deployment platform for Next.js applications due to its seamless integration and performance optimizations.

#### Automatic Deployment#

1. **Connect Repository**#
   - Go to [vercel.com](https://vercel.com) and sign in#
   - Click "New Project"#
   - Import your GitHub repository#
   - Vercel will automatically detect it's a Next.js project#

2. **Configure Project**#
   - **Framework Preset**: Next.js (automatically detected)#
   - **Root Directory**: `./` (leave default)#
   - **Build Command**: `npm run build` (automatically detected)#
   - **Output Directory**: `.next` (automatically detected)#

3. **Environment Variables**#
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your_secure_random_secret
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Deploy**#
   - Click "Deploy"#
   - Vercel will build and deploy your application#
   - You'll get a production URL like `https://foodlister.vercel.app`#

#### Custom Domain#

1. Go to your project settings in Vercel#
2. Navigate to "Domains"#
3. Add your custom domain#
4. Follow DNS configuration instructions#

#### Preview Deployments#

- Every push to feature branches creates a preview deployment#
- Preview deployments have URLs like `https://feature-branch.foodlister.vercel.app`#
- Useful for testing changes before merging#

### Netlify#

#### Setup#

1. **Connect Repository**#
   - Go to [netlify.com](https://netlify.com) and sign in#
   - Click "New site from Git"#
   - Choose your Git provider and repository#

2. **Build Settings**#
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Environment Variables**#
   Set the same environment variables as mentioned in Vercel section#

4. **Deploy**#
   - Netlify will build and deploy automatically#
   - Provides preview deployments for branches#

### Railway#

#### Setup#

1. **Connect Repository**#
   - Go to [railway.app](https://railway.app) and sign in#
   - Click "New Project" > "Deploy from GitHub repo"#
   - Select your repository#

2. **Environment Variables**#
   Set all required environment variables in Railway dashboard#

3. **Database**#
   - Railway can provide PostgreSQL database#
   - Or use external Supabase instance#

### Self-Hosted (Docker)#

#### Docker Setup#

1. **Create Dockerfile**#
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

2. **Create docker-compose.yml**#
   ```yaml
   version: '3.8'
   services:
     foodlister:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
         - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
         - NEXTAUTH_URL=${NEXTAUTH_URL}
         - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
         - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=${NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
         - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
         - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
       restart: unless-stopped
   ```

3. **Build and Run**#
   ```bash
   docker-compose up -d
   ```

## Environment Configuration#

### Environment Variables#

#### Required Variables#

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# NextAuth (Optional - for authentication)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secure-random-secret

# Cloudinary (Required for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### Generating Secure Secrets#

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

#### Environment-Specific Configuration#

##### Development#
```env
NODE_ENV=development
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXTAUTH_URL=http://localhost:3000
```

##### Production#
```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXTAUTH_URL=https://your-domain.com
```

## Database Setup#

### Supabase Production Configuration#

1. **Create Production Project**#
   - Go to [supabase.com](https://supabase.com)#
   - Create a new project for production#
   - Choose a strong database password#

2. **Database Schema**#
   Run the following SQL in Supabase SQL Editor (see `docs/database/database-schema.md` for full migration scripts):#

   ```sql
   -- Enable UUID extension
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   
   -- Restaurants table
   CREATE TABLE restaurants (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     image_url TEXT,
     price_per_person NUMERIC,
     rating NUMERIC CHECK (rating >= 0 AND rating <= 5),
     location TEXT,
     source_url TEXT,
     creator UUID REFERENCES auth.users(id),
     menu_url TEXT,
     menu_links TEXT[] DEFAULT '{}'::text[],
     menu_images TEXT[] DEFAULT '{}'::text[],
     phone_numbers TEXT[] DEFAULT '{}'::text[],
     latitude DOUBLE PRECISION CHECK (latitude >= -90 AND latitude <= 90),
     longitude DOUBLE PRECISION CHECK (longitude >= -180 AND longitude <= 180),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Cuisine types table
   CREATE TABLE cuisine_types (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL UNIQUE,
     description TEXT,
     icon TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Restaurant cuisine types junction table
   CREATE TABLE restaurant_cuisine_types (
     restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
     cuisine_type_id UUID REFERENCES cuisine_types(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     PRIMARY KEY (restaurant_id, cuisine_type_id)
   );
   
   -- Dietary options table
   CREATE TABLE dietary_options (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL UNIQUE,
     description TEXT,
     icon TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Restaurant dietary options junction table
   CREATE TABLE restaurant_dietary_options_junction (
     restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
     dietary_option_id UUID REFERENCES dietary_options(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     PRIMARY KEY (restaurant_id, dietary_option_id)
   );
   
   -- Restaurant features table
   CREATE TABLE restaurant_features (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     icon TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Restaurant restaurant features junction table
   CREATE TABLE restaurant_restaurant_features (
     restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
     feature_id UUID REFERENCES restaurant_features(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     PRIMARY KEY (restaurant_id, feature_id)
   );
   
   -- Lists table
   CREATE TABLE lists (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     creator_id UUID REFERENCES auth.users(id),
     is_public BOOLEAN DEFAULT TRUE,
     filters JSONB,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- List restaurants junction table
   CREATE TABLE list_restaurants (
     list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
     restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     PRIMARY KEY (list_id, restaurant_id)
   );
   
   -- Reviews table
   CREATE TABLE reviews (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
     user_id UUID NOT NULL REFERENCES auth.users(id),
     rating NUMERIC NOT NULL CHECK (rating >= 0.5 AND rating <= 5.0),
     comment TEXT,
     amount_spent NUMERIC,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- User stats table
   CREATE TABLE user_stats (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
     restaurants_visited INTEGER DEFAULT 0,
     lists_created INTEGER DEFAULT 0,
     reviews_written INTEGER DEFAULT 0,
     total_visits INTEGER DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Notifications table
   CREATE TABLE notifications (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID NOT NULL REFERENCES auth.users(id),
     type TEXT NOT NULL,
     message TEXT NOT NULL,
     read BOOLEAN DEFAULT FALSE,
     related_id UUID,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Scheduled meals table
   CREATE TABLE scheduled_meals (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID NOT NULL REFERENCES auth.users(id),
     restaurant_id UUID NOT NULL REFERENCES restaurants(id),
     meal_date DATE NOT NULL,
     meal_type TEXT,
     participants UUID[] DEFAULT '{}'::uuid[],
     notes TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **Enable Row Level Security (RLS)**#
   ```sql
   ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
   ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
   ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
   ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
   ALTER TABLE scheduled_meals ENABLE ROW LEVEL SECURITY;
   
   -- Create policies (see docs/database/database-schema.md for full policies)
   ```

4. **Seed Data**#
   ```sql
   -- Insert cuisine types
   INSERT INTO cuisine_types (name, description, icon) VALUES
   ('Italian', 'Italian cuisine', '🍝'),
   ('Chinese', 'Chinese cuisine', '🥡'),
   ('Mexican', 'Mexican cuisine', '🌮'),
   ('Japanese', 'Japanese cuisine', '🍱');
   
   -- Insert dietary options
   INSERT INTO dietary_options (name, description, icon) VALUES
   ('Vegetarian', 'No meat products', '🥗'),
   ('Vegan', 'No animal products', '🌱');
   
   -- Insert restaurant features
   INSERT INTO restaurant_features (name, description, icon) VALUES
   ('Outdoor Seating', 'Seating available outdoors', '🪑'),
   ('WiFi', 'Free WiFi available', '📶');
   ```

### Database Migrations#

Run all migration files in `supabase/migrations/` directory in order through the Supabase SQL Editor.

## Performance Optimization#

### Build Optimization#

#### Next.js Configuration#

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployments
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: ['res.cloudinary.com'],
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

export default nextConfig;
```

### CDN and Caching#

#### Static Asset Optimization#
- Next.js automatically optimizes static assets#
- Images are automatically converted to WebP/AVIF#
- CSS and JS are minified and compressed#

#### Cache Headers#
- **Static assets**: Cache for 1 year (immutable)#
- **API routes**: Cache for 5 minutes (public)#
- **HTML pages**: Cache for 0 seconds (dynamic)#

### Bundle Analysis#

```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer

# Add to package.json scripts
"analyze": "ANALYZE=true npm run build"
```

## Monitoring and Analytics#

### Application Monitoring#

#### Vercel Analytics#
- Automatically enabled on Vercel deployments#
- Provides real user monitoring#
- Performance metrics and Core Web Vitals#

#### Error Tracking#

```javascript
// utils/monitoring.ts
export function logError(error: Error, context?: Record<string, unknown>) {
  console.error('Application error:', error);
  
  // Send to error tracking service (Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { extra: context });
  }
}
```

#### Database Monitoring#
- Supabase provides built-in monitoring#
- Query performance insights#
- Real-time metrics#

### Health Checks#

#### API Health Check#

```javascript
// app/api/health/route.ts
export async function GET() {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('restaurants')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '1.0.0'
    });
  } catch (error) {
    return Response.json({
      status: 'error',
      error: error.message
    }, { status: 500 });
  }
}
```

## Security#

### Production Security Checklist#

- [ ] HTTPS enabled (automatic on Vercel/Netlify)#
- [ ] Environment variables properly configured#
- [ ] Database credentials not exposed#
- [ ] Row Level Security enabled#
- [ ] Input validation implemented#
- [ ] XSS protection enabled#
- [ ] CSRF protection configured#
- [ ] Secure headers set#
- [ ] Rate limiting configured#

### SSL/TLS Configuration#

Most platforms handle SSL automatically:#
- **Vercel**: Automatic SSL certificates#
- **Netlify**: Automatic HTTPS#
- **Railway**: SSL certificates included#

### Backup Strategy#

#### Database Backups#
- Supabase provides automatic backups#
- Point-in-time recovery available#
- Export data regularly for additional safety#

#### Application Backups#
- Code is backed up in Git#
- Static assets cached by CDN#
- Consider regular database snapshots#

## Rollback Strategy#

### Quick Rollback (Vercel)#

```bash
# Rollback to previous deployment
vercel rollback
```

### Database Rollbacks#

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

## Scaling#

### Horizontal Scaling#

- Vercel automatically scales based on traffic#
- Supabase handles database scaling#
- CDN distributes static assets globally#

### Database Scaling#
- Supabase provides automatic scaling#
- Consider read replicas for high-traffic applications#
- Optimize queries and add proper indexes#

### Performance Monitoring#
- Monitor Core Web Vitals#
- Track API response times#
- Monitor database query performance#
- Set up alerts for performance degradation#

## Troubleshooting#

### Common Deployment Issues#

#### Build Failures#

```bash
# Check build logs
npm run build

# Clear cache and retry
rm -rf .next node_modules/.cache
npm install
npm run build
```

#### Environment Variable Issues#

```bash
# Verify environment variables are set
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### Database Connection Issues#

```bash
# Test database connection
curl -X GET 'https://your-project.supabase.co/rest/v1/restaurants' \
  -H 'apikey: your-anon-key'
```

### Performance Issues#

#### Slow Page Loads#
- Check for large bundle sizes#
- Optimize images#
- Implement proper caching#
- Use Next.js performance monitoring#

#### Database Slow Queries#
- Add missing indexes#
- Optimize query structure#
- Implement query result caching#
- Monitor Supabase query performance#

This deployment guide should be updated as new deployment platforms or strategies are adopted. Use the `/docs` command to automatically update all documentation.