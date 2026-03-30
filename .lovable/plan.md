

# Professional Upgrade Plan for The Azzariah's Family Site

## Current State Assessment
The site has a solid foundation but several areas feel like placeholders: hardcoded blog posts/events/recipes, no real guestbook persistence, basic admin dashboard UI, no analytics, no notifications, no family tree, and limited visual polish.

## Plan Overview

### 1. Database-Driven Blog, Events & Recipes (replace all hardcoded data)
- Create three new tables: `blog_posts`, `events`, `recipes` with full CRUD
- Blog posts: title, author, content (rich text), category, featured image, published status, created/updated timestamps
- Events: title, description, date/time, location, type, RSVP tracking via an `event_rsvps` table
- Recipes: title, category, prep/cook time, ingredients (JSONB), instructions (JSONB), image, rating
- RLS: public read, admin full CRUD, members can RSVP to events
- Admin dashboard gets new tabs for managing Blog Posts, Events, and Recipes with full add/edit/delete and image upload

### 2. Persistent Guestbook & Contact Messages
- Create `guestbook_entries` table (name, message, approved boolean, created_at) and `contact_messages` table
- Contact form submissions get saved to DB; admin can view them in dashboard
- Guestbook entries require admin approval before display
- Admin gets a "Messages" tab showing contact form submissions and guestbook moderation

### 3. Family Tree / Member Directory
- Create a visual family member directory on the About page, pulling from a `family_members` table (name, role, bio, avatar, parent_id for tree structure)
- Admin can add/edit/remove family members from the dashboard
- Display as an interactive card grid with avatars and relationship labels

### 4. Admin Dashboard Overhaul
- Add a **Dashboard Overview** tab as the landing view with:
  - Stats cards (total members, pending approvals, total photos, total blog posts, total events)
  - Recent activity feed (latest signups, suggestions, uploads)
  - Quick action buttons
- Use a **sidebar layout** instead of cramped horizontal tabs for better navigation across 8+ sections
- Sections: Overview, Members, Hero Slides, Page Content, Blog Posts, Events, Recipes, Gallery, Guestbook/Messages, Suggestions, Family Members, Site Settings
- Add confirmation dialogs for destructive actions (delete)

### 5. Visual & UX Polish (Entire Site)
- **Scroll animations**: Add intersection observer-based fade/slide animations on all sections
- **Loading skeletons**: Replace "Loading..." text with skeleton components on all pages
- **Image lazy loading**: Add native lazy loading + blur-up placeholder effect on gallery/hero images
- **Breadcrumbs**: Add breadcrumb navigation on inner pages
- **Empty states**: Design proper empty state illustrations/messages for all sections
- **Toast notifications**: Ensure consistent success/error feedback everywhere
- **Page transitions**: Smooth fade transitions between routes
- **Typography refinement**: Add proper line-height, letter-spacing, and responsive font scaling
- **Card hover effects**: Uniform lift + shadow + subtle scale on all interactive cards
- **Gradient accents**: Add subtle gradient borders/backgrounds on key sections

### 6. Notification System
- Create a `notifications` table (user_id, type, message, read, created_at)
- Bell icon in the Navigation bar showing unread count
- Notify admin when: new member signs up, new suggestion submitted, new contact message
- Notify members when: their account is approved, their suggestion is approved/rejected

### 7. Search & Filtering Improvements
- Add a global search bar in the navigation that searches across blog posts, events, recipes, and gallery
- Debounced search with result dropdown

### 8. Site Settings (Admin)
- Admin can edit: site name, family motto, social media links, contact info (email, phone, address)
- These get stored in `site_content` with appropriate section keys and rendered dynamically in the Footer and Contact page

## Technical Details

### New Database Tables
```text
blog_posts: id, title, author, content, excerpt, category, image_url, published, created_at, updated_at
events: id, title, description, event_date, event_time, location, type, image_url, active, created_at
event_rsvps: id, event_id, user_id, status (going/maybe/not_going), created_at
recipes: id, title, category, prep_time, cook_time, servings, ingredients (jsonb), instructions (jsonb), image_url, created_at
family_members: id, name, role, bio, avatar_url, sort_order, created_at
guestbook_entries: id, user_id, name, message, approved, created_at
contact_messages: id, name, email, message, read, created_at
notifications: id, user_id, type, message, read, created_at
```

### Files to Create/Modify
- **New pages**: None (existing pages get refactored)
- **New components**: `GlobalSearch.tsx`, `NotificationBell.tsx`, `LoadingSkeleton.tsx`, `ScrollAnimator.tsx`, `ConfirmDialog.tsx`, `AdminSidebar.tsx`, `StatsCard.tsx`
- **Modified pages**: `Admin.tsx` (major overhaul with sidebar), `Blog.tsx`, `Events.tsx`, `Recipes.tsx`, `Contact.tsx`, `About.tsx`, `Home.tsx`
- **Modified components**: `Navigation.tsx` (add search + notification bell), `Footer.tsx` (dynamic content from DB)
- **New hooks**: `useNotifications.tsx`, `useGlobalSearch.tsx`
- **Database**: 5-6 migration files for new tables + RLS policies + seed data

### Implementation Order
1. Database migrations (all new tables + RLS)
2. Admin dashboard sidebar layout + overview stats
3. Blog/Events/Recipes CRUD in admin + frontend pages
4. Guestbook + contact messages persistence
5. Family members management
6. Notification system
7. Global search
8. Visual polish (animations, skeletons, transitions)
9. Site settings in admin

