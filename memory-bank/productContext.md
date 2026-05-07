# FoodLister - Product Context

## Why This Project Exists

Food enthusiasts often struggle to organize their restaurant discoveries and share recommendations with others. Traditional methods like notes apps or bookmarks lack structure, collaboration features, and discovery capabilities. FoodLister solves this by providing a dedicated platform for curating, sharing, and discovering restaurant lists.

## Problems Solved

1. **Disorganized Restaurant Discovery**: Users find great restaurants but forget them later. FoodLister provides structured list management with search and filtering.

2. **Lack of Collaboration**: Planning meals with friends requires sharing multiple links or text lists. FoodLister enables real-time collaboration with role-based permissions.

3. **Limited Filtering Options**: Existing apps don't offer comprehensive filtering by cuisine, features (outdoor seating, delivery), and dietary options. FoodLister provides advanced multi-dimensional filtering.

4. **Decision Paralysis**: Choosing where to eat can be overwhelming. The Restaurant Roulette feature provides fun, random selection.

5. **No Meal Planning**: Users lack tools to schedule future meals. FoodLister includes meal scheduling with calendar integration.

## How It Works

### User Journey

1. **Discovery**: Users search and filter restaurants by cuisine type, features (outdoor seating, delivery, etc.), and dietary options (vegetarian, gluten-free, etc.)

2. **Organization**: Users create curated lists (e.g., "Best Pizza in Town", "Date Night Spots") and add restaurants to them

3. **Collaboration**: Users invite friends to collaborate on lists with specific roles:
   - **Editors**: Can add/remove restaurants, edit list details
   - **Viewers**: Can only view the list

4. **Social Interaction**: Users can:
   - Write reviews with ratings and amount spent
   - Comment on lists
   - View other users' public profiles and lists
   - Share lists via unique URLs

5. **Decision Making**: 
   - Use Restaurant Roulette for random selection
   - Schedule meals with calendar integration (ICS export)
   - Track restaurant visits

### Key Workflows

#### Creating a Restaurant List
```
User → Create List → Add Details (name, description, tags, cover image) → 
Add Restaurants (search/filter) → Invite Collaborators → Share
```

#### Finding Restaurants
```
User → Search/Filter (cuisine, features, dietary) → View Restaurant Details → 
Read Reviews → Add to List → (Optional) Write Review
```

#### Collaborative Planning
```
List Owner → Invite Collaborator (email) → Assign Role → 
Collaborator Adds Restaurants → Real-time Updates → 
Comments Discussion → Schedule Meal
```

## User Experience Goals

### Core Principles

1. **Mobile-First**: 60%+ users access via mobile. All interfaces optimized for touch (44px minimum targets)

2. **Fast & Responsive**: 
   - Core Web Vitals compliance
   - Turbopack for fast development
   - Optimistic UI updates
   - Performance dashboard monitoring

3. **Intuitive Navigation**:
   - Clear information hierarchy
   - Tabbed interfaces for complex data
   - Breadcrumbs and back navigation
   - Consistent component patterns

4. **Visual Appeal**:
   - Modern, clean design (TailwindCSS 4)
   - Dark mode support
   - Framer Motion animations
   - High-quality images (Cloudinary optimization)

5. **Accessibility**:
   - Headless UI components
   - Keyboard navigation
   - Screen reader support
   - Color contrast compliance

### User Personas

**Food Enthusiast (Primary)**
- Loves discovering new restaurants
- Wants to organize findings by category
- Shares recommendations with friends
- Needs: search/filter, list management, sharing

**Social Planner (Secondary)**
- Organizes group dinners regularly
- Needs collaboration features
- Wants to discuss options with group
- Needs: list collaboration, comments, meal scheduling

**Dietary-Conscious User (Secondary)**
- Has specific dietary requirements
- Needs to filter by dietary options
- Reads reviews for dietary info
- Needs: advanced filters, review system

## Unique Value Proposition

Unlike generic review platforms (Yelp, Google Maps), FoodLister focuses on **personal curation and collaboration**:
- Create themed lists (not just generic reviews)
- Collaborate with friends in real-time
- Advanced filtering tailored for group dining decisions
- Integrated meal planning and visit tracking
- Privacy controls (public/private lists)

## Success Indicators

- Users create an average of 3+ lists within first month
- 40%+ lists have multiple collaborators
- Search/filter used in 70%+ sessions
- Mobile usage exceeds 60%
- Restaurant roulette used weekly by active users