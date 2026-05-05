# FoodLister - Project Brief

## Project Overview

**FoodLister** (package: foodlist v0.1.0) is a Next.js application for discovering, organizing, and sharing restaurant lists. Built with modern web technologies (Next.js 15, React 19, TypeScript) and Supabase as the backend service.

## Core Objectives

1. **Restaurant Discovery**: Help users find restaurants through advanced search and filtering (cuisine types, features, dietary options)
2. **List Management**: Enable users to create, edit, and share curated restaurant lists
3. **Collaboration**: Allow multiple users to collaborate on lists with role-based access (editor/viewer)
4. **Social Features**: Reviews, comments, user profiles, and sharing capabilities
5. **Decision Support**: Restaurant roulette for random selection, meal scheduling

## Key Features

### Discovery & Search
- Advanced filtering system (cuisine types, features like outdoor seating/delivery, dietary options like vegetarian/gluten-free)
- Full-text search across restaurant names, descriptions, and locations
- Tabbed filter interface with real-time stats

### List Management
- Create, edit, delete restaurant lists
- Add/remove restaurants from lists
- Drag-and-drop list positioning
- Cover images and tags for list customization
- Public/private list visibility

### Collaboration
- Invite collaborators to lists with specific roles (editor/viewer)
- Real-time updates for collaborative features
- List comments and discussions

### User Experience
- Responsive, mobile-first design (TailwindCSS 4)
- Dark mode support
- Restaurant roulette for indecisive diners
- Menu system (external links + uploaded images)
- User profiles with stats (reviews, restaurants, lists counts)
- Visit tracking for restaurants

### Advanced Features
- Meal scheduling with calendar integration (ICS export)
- Performance monitoring dashboard
- Rate limiting on API routes
- Image upload via Cloudinary
- Google Maps URL parsing for restaurant data extraction

## Target Users

- Food enthusiasts who want to organize their restaurant discoveries
- Groups of friends/family planning meals together
- Users who want to share curated restaurant recommendations
- People looking for restaurants matching specific criteria (dietary, features)

## Technology Foundation

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5.8.2
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Styling**: TailwindCSS 4, Headless UI, Framer Motion, Lucide React
- **External Services**: Cloudinary (image hosting), Google Maps (URL parsing)
- **Testing**: Jest 30.0.2, React Testing Library
- **Deployment**: Vercel (recommended), GitHub Actions for CI/CD

## Success Metrics

- User engagement with list creation and sharing
- Search and filter usage
- Collaboration feature adoption
- Mobile usability
- Performance (Core Web Vitals)