## Brief overview
Rules for handling .env and environment variable files in the FoodLister project.

## Environment Variables (.env) Handling
- Any task involving .env files must first create a `.env.example` file with example data/placeholder values
- The `.env.example` file should contain all required environment variables with example values showing the expected format
- After creating `.env.example`, the actual `.env` file should be configured separately by the user with real values
- It is **strictly forbidden** to modify `.env` files that are not examples
- The AI assistant must never edit, create, or touch the actual `.env` file (only `.env.example` is allowed)
- The `.env` file should be listed in `.gitignore` and never committed to the repository
- Only `.env.example` files may be created or modified by the AI assistant
- When documenting environment variables, always reference `.env.local.example` as the template file

## Examples
- ✅ **Allowed**: Creating `.env.local.example` with `NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here`
- ❌ **Forbidden**: Editing `.env.local` directly with real credentials
- ✅ **Allowed**: Updating `.env.local.example` when new environment variables are added to the project
- ❌ **Forbidden**: Running commands that modify `.env` or `.env.local` files