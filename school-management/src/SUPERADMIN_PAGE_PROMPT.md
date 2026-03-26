# Superadmin Page Creation Prompt

Use this prompt to create a superadmin dashboard page for the school management system with styling identical to the existing Dashboard component.

---

## Prompt

Create a Superadmin Dashboard page for a school management system using React. The page must maintain visual consistency with the existing Dashboard component (located at `src/components/Dashboard.jsx` and `src/components/Dashboard.css`).

---

## Required Styling Guidelines

### Color Palette
- **Primary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` (purple/violet)
- **Background Gradient**: `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)`
- **Text Colors**: 
  - `#1a202c` (heading/dark text)
  - `#2d3748` (body text)
  - `#4a5568` (secondary text)
  - `#718096` (muted/gray text)
- **Status Colors**: Success `#48bb78`, Warning `#ed8936`, Error `#f56565`
- **Status Badge Backgrounds**: `#[color]20` opacity for backgrounds

### Typography
- **Font Family**: `"Inter", -apple-system, BlinkMacSystemFont, sans-serif`
- **Heading Weight**: 700-800
- **Body Weight**: 400-600
- **Gradient Text Effect**: Apply primary gradient to main headings using `-webkit-background-clip: text; -webkit-text-fill-color: transparent;`

### Component Styles

#### Stat Cards
- Background: white
- Border Radius: 16px
- Padding: 2rem
- Border-left: 4px solid (accent color)
- Box Shadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- Hover Effect: `transform: translateY(-4px)` with enhanced shadow
- Include absolute positioned icon in top-right corner

#### Panels
- Background: white
- Border Radius: 16px
- Padding: 2rem
- Box Shadow: same as stat cards
- Hover: enhanced shadow on hover
- Section headings with 4px gradient bar indicator before text

#### Tables
- Width: 100%
- Border Collapse: collapse
- Header: gradient background `linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)`
- Header Text: uppercase, 0.75rem, 600 weight
- Row Hover: `#f7fafc` background
- Cell Padding: 1rem

#### Buttons
- Primary: gradient background with white text
- Border Radius: 6px
- Padding: 0.5rem 1rem
- Font Size: 0.75rem, weight 600
- Hover: `translateY(-1px)` with shadow enhancement

#### Status Badges
- Padding: 0.25rem 0.75rem
- Border Radius: 9999px (pill shape)
- Font Size: 0.75rem, uppercase, 600 weight
- Background: `#[status-color]20` (20% opacity)

### Layout Structure
- Container: min-height 100vh
- Background: gradient
- Padding: 2rem
- Stats Grid: `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`, gap 1.5rem
- Panels Grid: `grid-template-columns: repeat(auto-fit, minmax(400px, 1fr))`, gap 1.5rem
- Bottom margin: 2rem

### Animations
- Shimmer effect on progress bars
- Spinning loader animation
- Smooth transitions (0.3s ease) on all interactive elements

### Responsive Breakpoints
- Mobile (< 768px): Single column layouts, reduced padding (1rem), smaller headings

---

## Superadmin-Specific Features to Include

1. **Overview Statistics Cards**:
   - Total Schools Managed
   - Total Students (across all schools)
   - Total Teachers (across all schools)
   - Active Administrators
   - System Health Status
   - Recent Registrations Count

2. **Multi-School Management Panel**:
   - Table showing schools with columns: School Name, Location, Student Count, Status, Actions
   - Add/Edit/Remove school capabilities

3. **User Management Panel**:
   - Manage administrators, principals, teachers across all schools
   - Role assignment functionality
   - Account status toggle

4. **System Analytics**:
   - Enrollment trends across schools
   - Performance comparison between schools
   - Financial overview (if applicable)

5. **Quick Actions**:
   - Add New School
   - Add New Administrator
   - Generate System Report
   - View All Notifications

6. **Notifications/Activity Feed**:
   - Recent system-wide activities
   - Pending approvals from school administrators

---

## File Structure

Create the following files:
- `src/components/SuperAdminDashboard.jsx` - Main component
- `src/components/SuperAdminDashboard.css` - Styling (reuse Dashboard.css patterns)

---

## Implementation Notes

1. Import and use helper functions from `../lib/dashboardData.js` where applicable
2. Use the same loading state pattern with `useState` and `useEffect`
3. Follow the same component composition patterns (separate StatCard, Table, etc. components)
4. Use realistic mock data for the superadmin context
5. Ensure all interactive elements have hover/active states
6. Maintain accessibility standards (proper button elements, semantic HTML)
