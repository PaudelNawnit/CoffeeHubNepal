# CoffeeHubNepal - Web Frontend

## Overview

**CoffeeHubNepal** is Nepal's premier digital platform connecting coffee farmers, roasters, traders, exporters, and enthusiasts. The platform empowers Nepal's coffee community through technology, knowledge sharing, and trusted connections, fostering fair trade and sustainable growth in the coffee industry.

### Mission
To create a unified platform that connects coffee farmers, roasters, traders, and enthusiasts across Nepal, fostering knowledge exchange, fair trade, and sustainable growth in the coffee industry.

### Vision
To become Nepal's leading digital ecosystem for coffee, where every farmer has access to markets, knowledge, and opportunities to thrive in the global coffee industry.

---

## What We Do

- **Connect farmers with buyers and exporters** - Direct marketplace for coffee trading
- **Provide real-time market prices and trends** - Live price board with analytics
- **Facilitate knowledge sharing** - Blog posts and community discussions
- **Verify farmers to build trust** - Account verification system for all roles
- **Share government notices and opportunities** - Official alerts and announcements
- **Create job opportunities** - Job board for the coffee sector

---

## Team Members

Our diverse team of developers, designers, and content creators:

| Name | Role |
|------|------|
| **Suraj Nepal** | Backend Developer |
| **Sarthak Bhattarai** | Social Media Manager |
| **Siddhant Giri** | Frontend Developer |
| **Krrish Nyopane** | UI/UX Designer |
| **Sachin Jha** | Graphic Designer |
| **Mukesh Pandey** | Graphic Designer |
| **Nawnit Paudel** | Security Expert |
| **Supriya Khadka** | App Developer |
| **Rajdip Joshi** | App Developer |
| **Aastha Gaire** | Frontend Developer |
| **Pradip Khanal** | Researcher |
| **Aditya Man Shrestha** | Content Writer |

---

## System Architecture

### Tech Stack

**Frontend Framework:**
- **React 18** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

**State Management:**
- React Context API (`AppContext`, `AuthContext`)
- Local Storage for persistence
- Session Storage for temporary data

**Routing:**
- Custom routing system via `AppContext`
- Lazy loading for code splitting
- URL-based navigation for email links

**Internationalization:**
- Custom i18n system supporting English and Nepali
- Language toggle in header
- Persistent language preference

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  (React Components - Pages, Layouts, Common)           │
└────────────────────┬──────────────────────────────────┘
                     │
┌────────────────────▼──────────────────────────────────┐
│              Context Layer                              │
│  • AppContext (Navigation, Language, UI State)          │
│  • AuthContext (Authentication, User Data)              │
└────────────────────┬──────────────────────────────────┘
                     │
┌────────────────────▼──────────────────────────────────┐
│              Service Layer                              │
│  • auth.service.ts      • blog.service.ts              │
│  • admin.service.ts     • job.service.ts               │
│  • marketplace.service  • notice.service.ts           │
│  • price.service.ts     • contact.service.ts           │
└────────────────────┬──────────────────────────────────┘
                     │
┌────────────────────▼──────────────────────────────────┐
│              API Layer (REST)                           │
│  Backend API: http://localhost:4000                    │
│  • /auth/*      • /blog/*                              │
│  • /admin/*     • /jobs/*                              │
│  • /products/*  • /prices/*                            │
│  • /contacts/*  • /notices/*                           │
└────────────────────────────────────────────────────────┘
```

### Key Features

#### 1. **Authentication & Authorization**
- Email verification link-based signup (no OTP)
- JWT-based authentication
- Role-based access control (Farmer, Roaster, Trader, Exporter, Expert, Admin, Moderator)
- Account verification system for all roles
- Password reset via email links

#### 2. **Marketplace**
- Create and browse coffee listings
- Image upload with compression (max 5MB, WebP/JPEG/PNG)
- Category-based filtering
- Verified seller badges

#### 3. **Live Price Board**
- Real-time coffee market prices
- Price trends and analytics
- Admin-managed price updates

#### 4. **Job Board**
- Post and browse job opportunities
- Application management
- Role-specific job filtering

#### 5. **Blog & Community**
- Create, edit, and manage blog posts
- Comments and likes
- Category and tag filtering
- Content moderation

#### 6. **Official Alerts (Notices)**
- Admin/moderator-only posting
- Stored in BlogPost collection with `category='notice'`
- Priority levels (High, Medium, Low)
- Type classification (Training, Govt, Event, Alert, Other)

#### 7. **Admin Panel**
- User management and verification
- Content moderation (reports, reviews)
- Price management
- Contact message handling
- Statistics dashboard

#### 8. **User Profile**
- Profile customization with avatar upload
- Account verification submission
- My listings and jobs management
- Settings and preferences

---

## Project Structure

```
apps/web/
├── src/
│   ├── assets/              # Static assets (images, icons)
│   │   ├── images/
│   │   │   ├── logo/        # Logo files (WebP format)
│   │   │   ├── team/        # Team member photos (WebP format)
│   │   │   ├── landing/     # Landing page images
│   │   │   └── icons/       # SVG icons
│   │   └── ...
│   │
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Shared components (Button, Card, Input, etc.)
│   │   ├── cards/           # Card components (BlogCard, JobCard, etc.)
│   │   └── layout/          # Layout components (Header, Sidebar, BottomNav)
│   │
│   ├── context/             # React Context providers
│   │   ├── AppContext.tsx   # App state, navigation, language
│   │   └── AuthContext.tsx  # Authentication state
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useCountUp.ts    # Animated counter hook
│   │   ├── useMediaQuery.ts # Responsive breakpoint hook
│   │   └── useRole.ts       # Role management hook
│   │
│   ├── i18n/                # Internationalization
│   │   ├── en.ts           # English translations
│   │   ├── ne.ts           # Nepali translations
│   │   └── index.ts        # i18n utilities
│   │
│   ├── pages/               # Page components
│   │   ├── about/          # About Us page
│   │   ├── admin/          # Admin panel pages
│   │   ├── auth/           # Authentication pages
│   │   ├── blog/           # Blog pages
│   │   ├── contact/        # Contact page
│   │   ├── events/         # Events pages
│   │   ├── groups/         # Groups pages
│   │   ├── home/           # Home dashboard
│   │   ├── jobs/           # Job board pages
│   │   ├── landing/       # Landing page
│   │   ├── legal/          # Legal pages (Privacy, Terms)
│   │   ├── marketplace/    # Marketplace pages
│   │   ├── notices/        # Official alerts pages
│   │   ├── prices/         # Price board page
│   │   └── profile/        # User profile pages
│   │
│   ├── services/            # API service functions
│   │   ├── admin.service.ts
│   │   ├── auth.service.ts
│   │   ├── blog.service.ts
│   │   ├── contact.service.ts
│   │   ├── job.service.ts
│   │   ├── marketplace.service.ts
│   │   ├── notice.service.ts
│   │   ├── price.service.ts
│   │   └── report.service.ts
│   │
│   ├── utils/               # Utility functions
│   │   ├── constants.ts    # API URLs, constants
│   │   ├── formatDate.ts  # Date formatting
│   │   ├── iconMap.ts     # Icon mapping
│   │   ├── imageCompression.ts # Image compression utilities
│   │   └── mockData.ts    # Mock data (for development)
│   │
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # Entry point
│   ├── index.css           # Global styles
│   └── vite-env.d.ts       # Vite type declarations
│
├── public/                  # Public static files
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

---

## Responsive Design

The application is built with a **mobile-first** approach, ensuring optimal experience across all devices:

### Breakpoints
- **Mobile**: 320px - 639px (single column, bottom navigation)
- **Tablet**: 640px - 1023px (2-3 columns, responsive grids)
- **Desktop**: 1024px+ (sidebar navigation, multi-column layouts)
- **Large Desktop**: 1280px+ (max-width containers, optimized spacing)

### Key Responsive Features
- Fluid typography with `clamp()` for smooth scaling
- Responsive containers: `px-4 sm:px-6 lg:px-8` with max-width constraints
- Grid layouts that adapt: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Touch-friendly tap targets (minimum 44x44px)
- Safe area insets for iOS devices
- No horizontal scrolling (except intentional carousels)

---

## Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **npm** 9.0.0 or higher
- Backend API running (see `apps/api/README.md`)

### Installation

```bash
# Navigate to web directory
cd apps/web

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in `apps/web/` (optional for local development):

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_GEMINI_API_KEY=your_gemini_api_key_here  # If using AI features
```

### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

### Build for Production

```bash
# Build the application
npm run build

# Preview production build locally
npm run preview
```

The built files will be in the `dist/` directory.

---

## Development Guidelines

### Code Style

- **TypeScript** - All components and utilities are typed
- **Functional Components** - Use React hooks (no class components)
- **Component Organization** - One component per file, named exports
- **File Naming** - PascalCase for components (e.g., `BlogCard.tsx`)

### Component Structure

```typescript
// Example component structure
import { useState } from 'react';
import { Button } from '@/components/common/Button';

interface ComponentProps {
  // Props interface
}

export const Component = ({ prop }: ComponentProps) => {
  // Hooks
  const [state, setState] = useState();
  
  // Handlers
  const handleAction = () => {
    // Logic
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### State Management

- **Local State**: Use `useState` for component-specific state
- **Global State**: Use Context API (`AppContext`, `AuthContext`)
- **Server State**: Fetch via service functions, cache in Context or localStorage

### API Integration

All API calls go through service functions in `src/services/`:

```typescript
// Example: Using auth service
import { authService } from '@/services/auth.service';

const handleLogin = async () => {
  try {
    const result = await authService.login(email, password);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### Image Handling

- **Format**: Use WebP format for all images (25-35% smaller than PNG/JPEG)
- **Upload Limits**: Max 5MB per image, compressed client-side
- **Allowed Types**: JPEG, PNG, WebP only
- **Responsive Images**: Use `aspect-ratio` containers to prevent layout shift

### Form Validation

- **Client-side**: HTML5 validation + custom validation
- **Server-side**: Backend validates all inputs (Zod schemas)
- **Input Constraints**: All forms have `maxLength` limits enforced

### Security Best Practices

- **Input Validation**: All user inputs validated on both client and server
- **File Uploads**: Type and size restrictions enforced
- **Authentication**: JWT tokens stored in localStorage
- **Rate Limiting**: API endpoints protected with rate limits
- **Error Handling**: Generic error messages to users, detailed logs server-side

---

## Key Features Implementation

### Authentication Flow

1. **Signup**: User requests verification link → Email sent → User clicks link → Completes profile
2. **Login**: Email + password → JWT token → User data stored in context
3. **Password Reset**: Request reset → Email link → Set new password

### Image Upload Flow

1. User selects file (max 5MB, JPEG/PNG/WebP)
2. Client-side compression (if needed)
3. Convert to base64
4. Send to API
5. API stores in MongoDB (BlogPost documents)

### Responsive Navigation

- **Desktop**: Sidebar + Desktop Header (sticky)
- **Mobile**: Bottom Navigation + Mobile Header (sticky)
- **Tablet**: Hybrid approach based on screen size

### Internationalization

```typescript
// Usage example
import { t } from '@/i18n';
import { useApp } from '@/context/AppContext';

const { language } = useApp();
const title = t(language, 'about.title');
```

---

## Performance Optimizations

- **Code Splitting**: Lazy loading for all non-critical pages
- **Image Optimization**: WebP format, client-side compression
- **Bundle Size**: Tree-shaking, minimal dependencies
- **Caching**: API responses cached where appropriate
- **Responsive Images**: Aspect ratio containers prevent layout shift

---

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile**: iOS Safari 14+, Chrome Mobile (Android)
- **WebP Support**: Required (all modern browsers support WebP)

---

## Contributing

### Adding a New Page

1. Create component in `src/pages/[category]/[PageName].tsx`
2. Add lazy import in `App.tsx`
3. Add route handling in `AppContent` component
4. Update navigation if needed

### Adding a New Service

1. Create service file in `src/services/[name].service.ts`
2. Define TypeScript interfaces for request/response types
3. Use `API_BASE_URL` from `utils/constants.ts`
4. Handle errors appropriately

### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing scale
- Use design tokens (colors, fonts) from `tailwind.config.js`

---

## Deployment

### Production Build

```bash
npm run build
```

### Deployment Options

1. **Static Hosting** (Vercel, Netlify, GitHub Pages)
   - Upload `dist/` folder contents
   - Configure API base URL environment variable

2. **Heroku** (via root `package.json`)
   - Uses `heroku-build` script
   - Frontend built and copied to API's public folder

3. **Traditional Hosting** (Hostinger, etc.)
   - Upload built files to web server
   - Configure `.htaccess` for SPA routing

---

## Troubleshooting

### Common Issues

**Images not loading:**
- Ensure WebP files are in correct directories
- Check file paths match import statements
- Verify `vite-env.d.ts` includes WebP module declaration

**API connection errors:**
- Verify backend API is running
- Check `API_BASE_URL` in `utils/constants.ts`
- Ensure CORS is configured on backend

**Build errors:**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`
- Verify all imports are correct

---

## License

Private project - All rights reserved.

---

## Contact & Support

For questions, issues, or contributions, please contact the development team or use the Contact Us page in the application.

**Platform**: CoffeeHubNepal - Empowering Nepal's Coffee Community
