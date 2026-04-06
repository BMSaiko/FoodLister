# FoodLister

A Next.js application for discovering, organizing, and sharing restaurant lists. Built with Supabase for authentication and database management.

## Features

- **Restaurant Discovery**: Search and filter restaurants by cuisine, features, dietary options
- **List Management**: Create, edit, and share curated restaurant lists
- **List Collaboration**: Invite collaborators with editor/viewer roles
- **List Comments**: Add comments to lists for discussion
- **Tags & Cover Images**: Customize lists with tags and cover images
- **Restaurant Roulette**: Random restaurant picker for indecisive diners
- **User Authentication**: Secure auth via Supabase
- **Responsive Design**: Mobile-first UI with TailwindCSS
- **Real-time Updates**: Live updates for collaborative features

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Image Upload**: Cloudinary
- **Testing**: Jest, React Testing Library
- **CI/CD**: GitHub Actions
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd foodlist
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase and Cloudinary credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Run database migrations:
- Go to Supabase Dashboard → SQL Editor
- Execute migrations in order (000-029)

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Project Structure

```
foodlist/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── lists/             # List pages
│   ├── restaurants/       # Restaurant pages
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components
│   └── lists/            # List-specific components
├── hooks/                 # Custom React hooks
├── contexts/              # React contexts
├── libs/                  # Utility libraries
├── types/                 # TypeScript type definitions
├── supabase/              # Database migrations and seeds
│   └── migrations/        # SQL migration files
├── __tests__/             # Test files
└── public/                # Static assets
```

## Database Schema

Key tables:
- `profiles` - User profiles
- `restaurants` - Restaurant entries
- `lists` - Curated restaurant lists
- `list_restaurants` - Junction table for list-restaurant relationships
- `list_comments` - Comments on lists
- `list_collaborators` - List collaboration management
- `reviews` - Restaurant reviews
- `cuisine_types` - Restaurant cuisine categories
- `features` - Restaurant features (outdoor seating, delivery, etc.)
- `dietary_options` - Dietary options (vegetarian, gluten-free, etc.)

## API Endpoints

### Lists
- `GET /api/lists` - Fetch all lists with optional search
- `GET /api/lists/[id]` - Fetch single list with restaurants
- `POST /api/lists` - Create new list
- `PUT /api/lists/[id]` - Update list
- `DELETE /api/lists/[id]` - Delete list (owner only)
- `POST /api/lists/[id]` - Duplicate list

### Restaurants
- `GET /api/restaurants` - Fetch restaurants with filters
- `POST /api/restaurants` - Create restaurant

### Reviews
- `GET /api/reviews?restaurant_id=xxx` - Fetch reviews for restaurant
- `POST /api/reviews` - Create review

### Upload
- `POST /api/upload` - Upload image to Cloudinary

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.