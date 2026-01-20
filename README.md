# 🍽️ FoodList - Restaurant Management App

A modern, responsive web application for managing your restaurant discoveries and culinary adventures. Built with Next.js, this app helps you organize, discover, and randomly select restaurants using an interactive roulette wheel.

## ✨ Features

### 🏪 Restaurant Management
- **Browse & Search**: Discover restaurants with powerful search functionality
- **Advanced Filtering**: Filter by price range, rating, cuisine type, and visit status
- **Create & Edit**: Add new restaurants with detailed information
- **Visit Tracking**: Mark restaurants as visited with visit counter (+1/-1 functionality)
- **Row Level Security**: Complete data isolation per authenticated user

### 🎯 Restaurant Roulette
- **Interactive Wheel**: Spin a customizable wheel to randomly select restaurants
- **Custom Selection**: Choose specific restaurants for your roulette session
- **Smart Filtering**: Filter by cuisine type and visit status before spinning
- **Visual Feedback**: Smooth animations with restaurant names displayed on the wheel

### 🗺️ Google Maps Integration
- **One-Click Import**: Extract restaurant data directly from Google Maps URLs
- **No API Keys Required**: Works with standard Google Maps links
- **Auto-Fill Forms**: Automatically populate restaurant details from maps data

### 📱 Modern UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Intuitive Navigation**: Clean, user-friendly interface with smooth transitions
- **Dark/Light Themes**: Adaptable to user preferences (via Tailwind CSS)
- **Accessibility**: Built with accessibility best practices

### 📋 Lists Management
- **Create Lists**: Organize restaurants into custom collections
- **List Categories**: Group restaurants by occasion, cuisine, or personal preferences
- **Share & Export**: Share your restaurant lists with others

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom components with Lucide React icons
- **Language**: JavaScript/TypeScript

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **API**: RESTful API with Supabase client

### Integrations
- **Maps**: Google Maps URL parsing
- **Images**: Imgur API integration for image hosting
- **Search**: Advanced search with filters

### Development Tools
- **Package Manager**: npm
- **Build Tool**: Next.js built-in
- **Linting**: ESLint
- **Type Checking**: TypeScript (selective)

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Supabase Account**: For database and authentication
- **Git**: For cloning the repository

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BMSaiko/FoodLister.git
   cd foodlist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory and add your configuration:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # NextAuth Configuration (if using authentication)
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # Optional: Imgur API for image uploads
   IMGUR_CLIENT_ID=your_imgur_client_id
   ```

4. **Set up Supabase database**

   - Create a new Supabase project
   - Run the SQL migrations in your Supabase SQL editor
   - Configure authentication providers if needed

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📖 Usage

### Getting Started
1. **Add Restaurants**: Click "Add Restaurant" to create your first restaurant entry
2. **Use Google Maps**: Import restaurant data by pasting Google Maps URLs
3. **Create Lists**: Organize restaurants into themed collections
4. **Try the Roulette**: Spin the wheel to randomly select where to eat

### Key Workflows

#### Adding a Restaurant
1. Navigate to `/restaurants/create`
2. Fill in restaurant details manually or use Google Maps integration
3. Add cuisine types, price range, rating, and notes
4. Upload images using the Imgur integration
5. Save your restaurant

#### Using the Restaurant Roulette
1. Go to `/restaurants/roulette`
2. Apply filters (cuisine type, visit status) or select specific restaurants
3. Click "Spin Roulette" to randomly select a restaurant
4. View detailed information about the selected restaurant

#### Managing Lists
1. Create a new list at `/lists/create`
2. Add restaurants to your list
3. Edit list details and share with others

## 🏗️ Project Structure

```
foodlist/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Home page
├── components/            # React components
│   ├── layouts/          # Layout components
│   ├── pages/            # Page-specific components
│   ├── providers/        # Context providers
│   └── ui/               # Reusable UI components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── libs/                 # External service integrations
│   └── supabase/         # Supabase client setup
├── public/               # Static assets
├── utils/                # Utility functions
│   ├── filters.ts        # Filter logic
│   ├── formatters.ts     # Data formatters
│   ├── googleMapsExtractor.ts  # Google Maps integration
│   └── search.ts         # Search functionality
└── types.ts              # TypeScript type definitions
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** and ensure tests pass
4. **Commit your changes**: `git commit -m 'Add some feature'`
5. **Push to the branch**: `git push origin feature/your-feature-name`
6. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and naming conventions
- Write clear, concise commit messages
- Test your changes thoroughly
- Update documentation as needed
- Ensure responsive design works on all screen sizes

## 📄 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Supabase Setup
1. Create tables for restaurants, lists, cuisine_types, etc.
2. Set up Row Level Security (RLS) policies
3. Configure authentication if needed

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXTAUTH_URL`: Base URL for NextAuth (development/production)
- `NEXTAUTH_SECRET`: Secret for NextAuth JWT encryption

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- Digital Ocean App Platform
- Self-hosted with Docker

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Database powered by [Supabase](https://supabase.com)
- Icons from [Lucide React](https://lucide.dev)

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[Database Schema](./docs/database-schema.md)** - Complete database structure and relationships
- **[API Documentation](./docs/api-documentation.md)** - API endpoints and database operations
- **[Architecture Overview](./docs/architecture-overview.md)** - System design and technical decisions
- **[Development Guide](./docs/development-guide.md)** - Setup, coding standards, and best practices
- **[Deployment Guide](./docs/deployment-guide.md)** - Production deployment and configuration

## 📞 Support

If you have any questions or need help:

- Open an issue on GitHub
- Check the documentation in the `docs/` folder
- Contact the maintainers

---

**Happy restaurant hunting! 🍽️**
