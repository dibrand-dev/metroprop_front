# Results Page Documentation

## Overview
The Results page displays property search results with a responsive design that adapts between mobile and desktop layouts. It features list and map views with filtering and sorting capabilities.

## File Structure

```
src/app/results/
  └── page.tsx                    # Route entry point

src/components/Results/
  ├── Results.tsx                 # Main results component
  ├── Results.scss                # Comprehensive responsive styles
  ├── FilterBar.tsx               # Filter bar with search and dropdowns
  ├── SortDropdown.tsx           # Sort dropdown menu
  ├── PropertyCard.tsx            # Mobile property card component
  └── PropertyCardDesktop.tsx     # Desktop property card component
```

## Features

### Desktop Layout (≥768px)
- **Split View**: Map (828px) on left, property list on right
- **FilterBar**: Horizontal bar with operation, location search, price, rooms, and advanced filters
- **Property Cards**: Horizontal desktop cards with image, price, address, and favorite button
- **Map Markers**: Price bubbles positioned on map with hover states
- **Always Visible**: Both map and list shown simultaneously

### Mobile Layout (<768px)
- **Toggle View**: Switch between list-only or map-only views
- **View Buttons**: List/Map toggle buttons in header
- **Property Cards**: Full-width mobile cards with larger images
- **Single View**: Either list OR map shown at a time
- **Simplified Filters**: FilterBar hidden on mobile

## Components

### Results (`Results.tsx`)
Main component managing view state and layout.

**State:**
- `viewMode`: 'list' | 'map' - Controls mobile view toggle
- `sortBy`: string - Current sort option

**Key Features:**
- Responsive layout switching
- Mock property data (76,500 total properties)
- Map marker rendering
- View toggle buttons (mobile only)

### FilterBar (`FilterBar.tsx`)
Filter controls for desktop view.

**Elements:**
- Operation dropdown (Comprar/Vender)
- Location search input with icon
- Price dropdown
- Rooms/Bedrooms dropdown
- Advanced filters button with badge count
- Create Alert button (primary action)

### SortDropdown (`SortDropdown.tsx`)
Dropdown menu for sorting results.

**Props:**
- `value`: Current sort value
- `onChange`: Sort change handler

**Sort Options:**
- Más relevantes (relevant)
- Menor precio (price-asc)
- Mayor precio (price-desc)
- Más recientes (newest)
- Mayor superficie (area-desc)
- Menor superficie (area-asc)

### PropertyCard (`PropertyCard.tsx`)
Mobile property card with vertical layout.

**Props:**
- `property`: Property object
- `onToggleFavorite`: Favorite toggle handler
- `compact`: Optional compact mode flag

**Features:**
- 200px height image with favorite overlay
- Price display with optional price/m²
- Address and property details
- Room and bathroom icons
- Favorite heart button

### PropertyCardDesktop (`PropertyCardDesktop.tsx`)
Desktop property card with horizontal layout.

**Props:**
- `property`: Property object
- `onToggleFavorite`: Favorite toggle handler

**Features:**
- 76x76px image
- Compact horizontal layout
- Price, title, and address
- Favorite button on right side
- Hover state with blue border

## Styling (`Results.scss`)

### Responsive Breakpoint
- **Mobile**: < 768px
- **Desktop**: ≥ 768px

### Key Classes
- `.results-page`: Main container
- `.filter-bar`: Desktop filter controls
- `.results-header`: Mobile view toggle header
- `.results-content`: Main content area
- `.map-view`: Map container
- `.list-view`: Property list container
- `.property-list`: List of properties
- `.mobile-card` / `.desktop-card`: Card visibility wrappers
- `.map-marker`: Map price markers
- `.sort-dropdown`: Sort menu

### Color Scheme
- **Primary Blue**: #006AFF
- **Hover Blue**: #0056CC
- **Border**: #E5E5E5
- **Background**: #F8F8F8
- **Text**: #333, #666, #999

## Usage

### Accessing the Page
Navigate to `/results` to view the property search results page.

### Mock Data
The component includes sample properties with:
- 6 properties displayed
- 76,500 total property count
- Price range: $85,000 - $180,000
- Coordinates for map markers
- Favorite status tracking

### Integration Points

#### API Integration (To Do)
1. **Fetch Results**: Replace mock `properties` array with API call
2. **Filter API**: Connect FilterBar dropdowns to search parameters
3. **Sort API**: Pass `sortBy` value to backend
4. **Favorites API**: Implement `handleToggleFavorite` with user favorites endpoint
5. **Map Data**: Fetch property coordinates for map markers

#### State Management (To Do)
For production, consider moving state to:
- **Context API**: Share filters/sort between components
- **Zustand**: Centralized search state
- **URL Params**: Persist filters in query string for shareability

## Future Enhancements

### Planned Features
- [ ] Working filter dropdowns with multi-select
- [ ] Map integration (Google Maps / Mapbox)
- [ ] Clickable map markers showing property details
- [ ] Pagination or infinite scroll
- [ ] Save search / Create alert functionality
- [ ] Favorite properties persistence
- [ ] Property detail page navigation
- [ ] Filter badges showing active filters
- [ ] Clear all filters button
- [ ] Property comparison feature

### Map Enhancements
- [ ] Clustering for high-density areas
- [ ] Custom map styles
- [ ] Draw area search tool ("Dibujar" button)
- [ ] Map bounds-based search
- [ ] Street view integration

### Performance
- [ ] Virtual scrolling for long property lists
- [ ] Lazy loading for images
- [ ] Debounced search input
- [ ] Optimized map marker rendering

## Testing Checklist

### Desktop (≥768px)
- [ ] FilterBar displays horizontally with all controls
- [ ] Map and list shown side-by-side (828px map, flexible list)
- [ ] Property cards use desktop layout (horizontal)
- [ ] Sort dropdown appears in list header
- [ ] Map markers display with price bubbles
- [ ] Hover states work on cards and markers

### Mobile (<768px)
- [ ] FilterBar hidden
- [ ] View toggle buttons visible in header
- [ ] List view shows mobile property cards
- [ ] Map view shows full-screen map
- [ ] Toggle switches between list and map
- [ ] Sort dropdown appears when in list view
- [ ] Property cards use mobile layout (vertical)

### Interactions
- [ ] View toggle changes between list/map
- [ ] Sort dropdown opens/closes correctly
- [ ] Sort selection updates and closes menu
- [ ] Favorite button toggles heart icon
- [ ] Property cards clickable (navigation pending)
- [ ] Map markers clickable (details pending)

## Notes

- **Window SSR**: Component uses 'use client' directive for client-side state
- **Mock Data**: Currently uses static data for development
- **Favorites**: Console logs only, requires backend integration
- **Map**: Gray placeholder, requires map library integration
- **Filters**: UI only, dropdown functionality not yet implemented
- **Responsive**: Tested at 390px (mobile) and 1440px (desktop) breakpoints
