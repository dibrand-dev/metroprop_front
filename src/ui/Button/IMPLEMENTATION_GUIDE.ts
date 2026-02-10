/**
 * BUTTON COMPONENT - Implementation Summary
 * 
 * This file provides a comprehensive guide to the enhanced Button component
 * that implements all 5 designs from Figma Metroprop design system.
 * 
 * ===========================================================================
 * 5 BUTTON VARIANTS IMPLEMENTED
 * ===========================================================================
 * 
 * 1. PRIMARY BUTTON (Botón Principal)
 *    - Solid blue buttons with 2 types
 *    - Type 1: Light Blue (#006AFF)
 *    - Type 2: Dark Blue (#0041D9)
 *    - States: default, hover, selected, click, disabled
 * 
 * 2. SECONDARY BUTTON (Botón Secundario)
 *    - Outlined buttons with colored borders
 *    - Type 1: Light Blue border (#006AFF)
 *    - Type 2: Dark Blue border (#0041D9)
 *    - States: default, hover, selected, click, disabled
 * 
 * 3. TERTIARY BUTTON (Botón Terciario)
 *    - Light gray background with subtle border
 *    - Single type, no sub-variations
 *    - States: default, hover, click, disabled
 * 
 * 4. TEXT BUTTON (Botón de Texto)
 *    - Simple text with optional underline
 *    - Type 1: Regular weight (400)
 *    - Type 2: Semi-bold weight (600)
 *    - States: default, hover, selected
 * 
 * 5. BACK BUTTON (Botón Volver)
 *    - Navigation button with chevron icon
 *    - Single type, no sub-variations
 *    - States: default, hover, click, disabled
 * 
 * ===========================================================================
 * FILES MODIFIED
 * ===========================================================================
 * 
 * 1. src/ui/Button/Button.tsx
 *    - Enhanced component with new props
 *    - Added variant types: 'tertiary', 'text', 'back'
 *    - Added state control: 'default', 'hover', 'active', 'disabled', 'selected', 'click'
 *    - Added buttonType: '1' | '2' for variants that have multiple styles
 * 
 * 2. src/ui/Button/Button.scss
 *    - Complete style system for all 5 button variants
 *    - State-based styling with btn-state-{state} classes
 *    - Type-based variations with btn-type-{type} classes
 *    - Color tokens matching Metroprop design system
 * 
 * 3. src/ui/Button/README.md
 *    - Complete documentation
 *    - Props reference
 *    - Usage examples
 *    - Design token documentation
 * 
 * 4. src/ui/Button/ButtonExamples.tsx
 *    - Interactive examples of all variants
 *    - All states displayed for each variant
 *    - Code snippets for reference
 * 
 * ===========================================================================
 * COLOR SCHEME
 * ===========================================================================
 * 
 * Primary Colors:
 * - Light Blue: #006AFF
 * - Dark Blue: #0041D9
 * - Tertiary: #0132A4
 * 
 * Background Colors:
 * - White: #FFFFFF
 * - Light Gray: #F5F5F5
 * - Light Blue: #EBF2FD
 * 
 * Text Colors:
 * - Primary: #1E1E1E
 * - Secondary: #7A7A7A
 * 
 * Disabled:
 * - Gray: #7A7A7A
 * - Border Gray: #A6A6A6, #B0B0B0
 * 
 * ===========================================================================
 * COMPONENT PROPS
 * ===========================================================================
 * 
 * Required:
 * - label: string
 * 
 * Style Props:
 * - variant: 'primary' | 'secondary' | 'tertiary' | 'text' | 'back' | 'outline' | 'danger'
 * - buttonType: '1' | '2' (for variants with multiple styles)
 * - state: 'default' | 'hover' | 'active' | 'disabled' | 'selected' | 'click'
 * - size: 'small' | 'medium' | 'large'
 * - fullWidth: boolean
 * 
 * Interaction:
 * - onClick: () => void
 * - disabled: boolean
 * - loading: boolean
 * 
 * Content:
 * - icon: ReactNode
 * - iconPosition: 'left' | 'right'
 * 
 * HTML:
 * - type: 'button' | 'submit' | 'reset'
 * - id: string
 * - name: string
 * - className: string
 * 
 * Accessibility:
 * - ariaLabel: string
 * 
 * ===========================================================================
 * USAGE EXAMPLES
 * ===========================================================================
 * 
 * 1. PRIMARY BUTTON
 * ─────────────────
 * 
 * // Type 1 (Light Blue)
 * <Button 
 *   label="Create" 
 *   variant="primary" 
 *   buttonType="1"
 *   onClick={handleCreate}
 * />
 * 
 * // Type 2 (Dark Blue)
 * <Button 
 *   label="Save" 
 *   variant="primary" 
 *   buttonType="2"
 *   onClick={handleSave}
 * />
 * 
 * // With Icon
 * <Button 
 *   label="Save" 
 *   variant="primary"
 *   icon={<SaveIcon />}
 *   iconPosition="left"
 * />
 * 
 * 
 * 2. SECONDARY BUTTON
 * ───────────────────
 * 
 * // Type 1 (Light Blue Border)
 * <Button 
 *   label="Cancel" 
 *   variant="secondary" 
 *   buttonType="1"
 *   onClick={handleCancel}
 * />
 * 
 * // Type 2 (Dark Blue Border)
 * <Button 
 *   label="Dismiss" 
 *   variant="secondary" 
 *   buttonType="2"
 * />
 * 
 * 
 * 3. TERTIARY BUTTON
 * ──────────────────
 * 
 * <Button 
 *   label="Edit" 
 *   variant="tertiary"
 *   onClick={handleEdit}
 * />
 * 
 * <Button 
 *   label="Delete" 
 *   variant="tertiary"
 *   icon={<TrashIcon />}
 * />
 * 
 * 
 * 4. TEXT BUTTON
 * ──────────────
 * 
 * // Type 1 (Regular Weight)
 * <Button 
 *   label="Learn more" 
 *   variant="text" 
 *   buttonType="1"
 * />
 * 
 * // Type 2 (Semi-Bold Weight)
 * <Button 
 *   label="View all" 
 *   variant="text" 
 *   buttonType="2"
 * />
 * 
 * 
 * 5. BACK BUTTON
 * ──────────────
 * 
 * import { ChevronLeftIcon } from '@heroicons/react/24/solid';
 * 
 * <Button 
 *   label="Back" 
 *   variant="back"
 *   icon={<ChevronLeftIcon />}
 *   onClick={handleGoBack}
 * />
 * 
 * 
 * ===========================================================================
 * STATE MANAGEMENT
 * ===========================================================================
 * 
 * The component supports explicit state control for preview/testing:
 * 
 * <Button 
 *   label="Hover State" 
 *   variant="primary"
 *   state="hover"  // Force hover state for preview
 * />
 * 
 * <Button 
 *   label="Disabled State" 
 *   variant="primary"
 *   state="disabled"
 *   disabled
 * />
 * 
 * <Button 
 *   label="Selected State" 
 *   variant="secondary"
 *   state="selected"
 * />
 * 
 * <Button 
 *   label="Click State" 
 *   variant="secondary"
 *   state="click"
 * />
 * 
 * ===========================================================================
 * INTEGRATION WITH EXISTING CODE
 * ===========================================================================
 * 
 * The new Button component is fully backward compatible with existing code.
 * Old button usage will continue to work:
 * 
 * // Old usage (still works)
 * <Button 
 *   label="Click me"
 *   variant="primary"
 *   onClick={handleClick}
 * />
 * 
 * // New enhanced usage
 * <Button 
 *   label="Click me"
 *   variant="primary"
 *   buttonType="1"  // New: specify button type
 *   state="hover"   // New: control state explicitly
 *   size="medium"   // New: control size
 * />
 * 
 * ===========================================================================
 * RESPONSIVE DESIGN
 * ===========================================================================
 * 
 * Button sizes are controlled with the size prop:
 * 
 * <Button label="Small" variant="primary" size="small" />
 * <Button label="Medium" variant="primary" size="medium" />
 * <Button label="Large" variant="primary" size="large" />
 * 
 * Full width buttons:
 * 
 * <Button 
 *   label="Full Width Button" 
 *   variant="primary"
 *   fullWidth
 * />
 * 
 * ===========================================================================
 * ACCESSIBILITY
 * ===========================================================================
 * 
 * The component includes accessibility features:
 * 
 * // Custom aria label
 * <Button 
 *   label="Submit Form" 
 *   variant="primary"
 *   ariaLabel="Submit contact form"
 *   onClick={handleSubmit}
 * />
 * 
 * // Loading state with aria-busy
 * <Button 
 *   label="Saving..."
 *   variant="primary"
 *   loading
 *   disabled
 * />
 * 
 * // Disabled state
 * <Button 
 *   label="Unavailable" 
 *   variant="primary"
 *   disabled
 * />
 * 
 * ===========================================================================
 * STYLING APPROACH
 * ===========================================================================
 * 
 * The component uses SCSS with:
 * - Nested selectors for variant combinations
 * - CSS classes for state management
 * - Design tokens from Metroprop system
 * - No Tailwind CSS (uses SCSS only)
 * 
 * Class structure:
 * .btn
 *   .btn-{variant}
 *     .btn-{type}
 *       .btn-state-{state}
 * 
 * ===========================================================================
 * TESTING ALL VARIANTS
 * ===========================================================================
 * 
 * To view all button variants with their states:
 * 
 * import ButtonExamples from '@/ui/Button/ButtonExamples';
 * 
 * export default function TestPage() {
 *   return <ButtonExamples />;
 * }
 * 
 * This will display:
 * - All 5 button variants
 * - All states for each variant
 * - Icon examples
 * - Size examples
 * - Usage examples
 * 
 * ===========================================================================
 * FIGMA DESIGNS REFERENCE
 * ===========================================================================
 * 
 * All 5 designs have been implemented from:
 * 
 * 1. Primary Button: node-id=5-5190
 *    https://www.figma.com/design/NccW8WOFeZzrGndM9nF179?node-id=5-5190
 * 
 * 2. Secondary Button: node-id=7-1784
 *    https://www.figma.com/design/NccW8WOFeZzrGndM9nF179?node-id=7-1784
 * 
 * 3. Tertiary Button: node-id=48-3013
 *    https://www.figma.com/design/NccW8WOFeZzrGndM9nF179?node-id=48-3013
 * 
 * 4. Text Button: node-id=7-1810
 *    https://www.figma.com/design/NccW8WOFeZzrGndM9nF179?node-id=7-1810
 * 
 * 5. Back Button: node-id=488-3162
 *    https://www.figma.com/design/NccW8WOFeZzrGndM9nF179?node-id=488-3162
 * 
 * ===========================================================================
 */

export const BUTTON_IMPLEMENTATION_GUIDE = {
  variants: {
    primary: {
      description: "Solid blue button for main actions",
      types: ["1 (Light Blue #006AFF)", "2 (Dark Blue #0041D9)"],
      states: ["default", "hover", "selected", "click", "disabled"]
    },
    secondary: {
      description: "Outlined button for secondary actions",
      types: ["1 (Light Blue Border)", "2 (Dark Blue Border)"],
      states: ["default", "hover", "selected", "click", "disabled"]
    },
    tertiary: {
      description: "Light gray button for less prominent actions",
      types: ["single type"],
      states: ["default", "hover", "click", "disabled"]
    },
    text: {
      description: "Text-only button with optional underline",
      types: ["1 (Regular weight)", "2 (Semi-bold weight)"],
      states: ["default", "hover", "selected"]
    },
    back: {
      description: "Navigation button with chevron icon",
      types: ["single type"],
      states: ["default", "hover", "click", "disabled"]
    }
  }
};
