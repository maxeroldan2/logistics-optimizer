# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server (typically runs on http://localhost:5173)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint for code quality
- `npm run preview` - Preview production build locally

### Environment Setup
- Create `.env` file with Supabase credentials:
  ```
  VITE_SUPABASE_URL=http://127.0.0.1:54321
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
  VITE_FORCE_REAL_AUTH=true
  ```
- Local development uses Supabase local instance
- Test user credentials: demo@example.com / demo123

### Supabase Development
- `npm run supabase:start` - Start local Supabase (requires Supabase CLI)
- `npm run supabase:stop` - Stop local Supabase
- `npm run supabase:reset` - Reset database to migrations
- `npm run supabase:studio` - Open Supabase Studio (http://127.0.0.1:54323)
- `npm run supabase:status` - Check local Supabase status

## Architecture Overview

This is a **Logistics Investment Optimizer** - a React TypeScript application for optimizing shipping logistics with freemium SaaS features.

### Core System Design

**Freemium Model Architecture:**
- `AppContext.tsx` manages subscription tiers (free/premium) with feature restrictions
- Free users limited to 1 shipment, premium users get unlimited access
- Features like dumping penalizer, AI dimensions, and market analysis are premium-gated
- Real subscription checking via Supabase integration

**Drag & Drop System:**
- Built with `@dnd-kit/core` for robust drag and drop
- `DragDropProvider` centralizes drag state and handles product-to-container assignments
- Products draggable from 6-dot grip handles in Product Palette table
- Containers act as drop zones with visual feedback
- `DragOverlay` provides smooth visual feedback during drag operations

**Data Flow Architecture:**
- `AppContext` is the central state manager for shipments, products, containers, and subscription
- All business logic for calculations flows through `utils/calculations.ts`
- Supabase handles authentication and data persistence
- Products can be assigned to containers via `containerId` field

### Key Technical Patterns

**Component Structure:**
- Pages in `pages/` (main is `Home.tsx`)
- Reusable components organized by function in `components/`
- Form components (`ProductForm`, `ContainerForm`) are modal-based with preset systems
- Sections (`ProductsSection`, `ContainersSection`) handle main dashboard areas

**Modal System:**
- Both product and container forms use modal overlays instead of inline forms
- Preset systems with search functionality for quick data entry
- Real-time calculations (volume, profit) in forms

**Calculation Engine:**
- `calculateProductScore()` - Core scoring algorithm for products
- `calculateShipmentScore()` - Aggregate shipment metrics
- Dumping penalizer system applies market saturation penalties to scores
- All calculations consider volume efficiency, profit margins, and turnover rates

**State Management Pattern:**
- Custom hooks (`useShipmentManagement`, `useFolderManagement`) encapsulate related state logic
- AppContext provides global state, local components manage UI state
- Product assignment updates flow through drag drop system

### Database Schema (Supabase)
- **Authentication**: Supabase Auth with RLS policies for data isolation
- **Migrations**: Located in `supabase/migrations/` for schema versioning
- **Tables**: users, shipments, user_settings with proper foreign key relationships
- **Local Development**: Uses local Supabase instance on port 54321
- **Production**: Configured for real database persistence
- **Data Persistence**: All shipments, products, containers saved to PostgreSQL
- **Row Level Security**: Each user only accesses their own data

### Key Dependencies
- **@dnd-kit/core** - Drag and drop functionality
- **@supabase/supabase-js** - Backend integration
- **lucide-react** - Icon system
- **react-router-dom** - Routing
- **tailwindcss** - Styling system

### Important Development Notes

**Drag & Drop Implementation:**
- Always pass `products` prop to `DragDropProvider`
- Use `useDraggable` for draggable elements, `useDroppable` for drop zones
- `DragOverlay` is essential for proper visual feedback across z-index layers

**Form Patterns:**
- Product and container forms support both add and edit modes via same component
- Preset functionality auto-fills form fields for common items
- All forms validate required fields and handle proper state cleanup

**Subscription Logic:**
- Check `subscriptionTier` before enabling premium features
- Use `isFeatureAvailable()` helper for feature gating
- Free users: 1 shipment limit, basic features only
- Premium users: Unlimited shipments, dumping penalizer, AI dimensions, market analysis
- Subscription data persisted in database with real-time checking

**Production Database Mode:**
- Application now uses real Supabase database instead of localStorage
- Authentication required for all operations
- Data persists across sessions and devices
- Multi-user support with proper data isolation
- Row Level Security enforces user-specific data access

**Development vs Production:**
- Local development uses Supabase local instance (port 54321)
- Environment variables control authentication mode
- Test user available for development: demo@example.com / demo123
- Database migrations handle schema changes

**State Persistence:**
- All shipment data automatically saved to database
- Real-time updates when shipment data changes
- User settings and subscription status persisted
- Fallback to localStorage disabled in production mode