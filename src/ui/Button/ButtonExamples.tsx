'use client';

import Button from './Button';
// import { ChevronUpIcon, MapIcon, PencilIcon, CheckIcon, ChevronLeftIcon } from '@heroicons/react/24/solid';

/**
 * Button Component Examples - 5 Figma Button Styles
 * 
 * This component demonstrates all 5 button variants with their different states
 * from the Metroprop design system
 */

export default function ButtonExamples() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#f9f9f9' }}>
      <h1>Button Component - All Variants</h1>
      <p>Demonstration of all 5 button styles from Metroprop design system</p>

      {/* ============================================ */}
      {/* 1. PRIMARY BUTTON */}
      {/* ============================================ */}
      <section style={{ marginBottom: '60px' }}>
        <h2>1. Primary Button (Botón Principal)</h2>
        <p>Solid blue button used for main actions. Has 2 types with different colors.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div>
            <h3>Type 1 - Light Blue (#006AFF)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <p>Default</p>
                <Button 
                  label="Principal" 
                  variant="primary" 
                  buttonType="1"
                  state="default"
                />
              </div>
              <div>
                <p>Hover</p>
                <Button 
                  label="Principal" 
                  variant="primary" 
                  buttonType="1"
                  state="hover"
                />
              </div>
              <div>
                <p>Selected</p>
                <Button 
                  label="Principal" 
                  variant="primary" 
                  buttonType="1"
                  state="selected"
                />
              </div>
              <div>
                <p>Click</p>
                <Button 
                  label="Principal" 
                  variant="primary" 
                  buttonType="1"
                  state="click"
                />
              </div>
              <div>
                <p>Disabled</p>
                <Button 
                  label="Principal" 
                  variant="primary" 
                  buttonType="1"
                  state="disabled"
                  disabled
                />
              </div>
            </div>
          </div>

          <div>
            <h3>Type 2 - Dark Blue (#0041D9)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <p>Default</p>
                <Button 
                  label="Principal" 
                  variant="primary" 
                  buttonType="2"
                  state="default"
                />
              </div>
              <div>
                <p>Hover</p>
                <Button 
                  label="Principal" 
                  variant="primary" 
                  buttonType="2"
                  state="hover"
                />
              </div>
              <div>
                <p>Selected</p>
                <Button 
                  label="Principal" 
                  variant="primary" 
                  buttonType="2"
                  state="selected"
                />
              </div>
              <div>
                <p>Click</p>
                <Button 
                  label="Principal" 
                  variant="primary" 
                  buttonType="2"
                  state="click"
                />
              </div>
              <div>
                <p>Disabled</p>
                <Button 
                  label="Principal" 
                  variant="primary" 
                  buttonType="2"
                  state="disabled"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 2. SECONDARY BUTTON */}
      {/* ============================================ */}
      <section style={{ marginBottom: '60px' }}>
        <h2>2. Secondary Button (Botón Secundario)</h2>
        <p>Outlined button with border. Used for secondary actions. Has 2 types.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div>
            <h3>Type 1 - Border Light Blue</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <p>Default</p>
                <Button 
                  label="Secundario" 
                  variant="secondary" 
                  buttonType="1"
                  state="default"
                />
              </div>
              <div>
                <p>Hover</p>
                <Button 
                  label="Secundario" 
                  variant="secondary" 
                  buttonType="1"
                  state="hover"
                />
              </div>
              <div>
                <p>Selected</p>
                <Button 
                  label="Secundario" 
                  variant="secondary" 
                  buttonType="1"
                  state="selected"
                />
              </div>
              <div>
                <p>Click</p>
                <Button 
                  label="Secundario" 
                  variant="secondary" 
                  buttonType="1"
                  state="click"
                />
              </div>
              <div>
                <p>Disabled</p>
                <Button 
                  label="Secundario" 
                  variant="secondary" 
                  buttonType="1"
                  state="disabled"
                  disabled
                />
              </div>
            </div>
          </div>

          <div>
            <h3>Type 2 - Border Dark Blue</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <p>Default</p>
                <Button 
                  label="Secundario" 
                  variant="secondary" 
                  buttonType="2"
                  state="default"
                />
              </div>
              <div>
                <p>Hover</p>
                <Button 
                  label="Secundario" 
                  variant="secondary" 
                  buttonType="2"
                  state="hover"
                />
              </div>
              <div>
                <p>Selected</p>
                <Button 
                  label="Secundario" 
                  variant="secondary" 
                  buttonType="2"
                  state="selected"
                />
              </div>
              <div>
                <p>Click</p>
                <Button 
                  label="Secundario" 
                  variant="secondary" 
                  buttonType="2"
                  state="click"
                />
              </div>
              <div>
                <p>Disabled</p>
                <Button 
                  label="Secundario" 
                  variant="secondary" 
                  buttonType="2"
                  state="disabled"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 3. TERTIARY BUTTON */}
      {/* ============================================ */}
      <section style={{ marginBottom: '60px' }}>
        <h2>3. Tertiary Button (Botón Terciario)</h2>
        <p>Light gray button with subtle border. Used for less prominent actions.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <p>Default</p>
            <Button 
              label="Terciario" 
              variant="tertiary"
              state="default"
            />
          </div>
          <div>
            <p>Hover</p>
            <Button 
              label="Terciario" 
              variant="tertiary"
              state="hover"
            />
          </div>
          <div>
            <p>Click</p>
            <Button 
              label="Terciario" 
              variant="tertiary"
              state="click"
            />
          </div>
          <div>
            <p>Disabled</p>
            <Button 
              label="Terciario" 
              variant="tertiary"
              state="disabled"
              disabled
            />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 4. TEXT BUTTON */}
      {/* ============================================ */}
      <section style={{ marginBottom: '60px' }}>
        <h2>4. Text Button (Botón de Texto)</h2>
        <p>Simple text button with optional underline. Has 2 types. Also includes checkbox variant.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div>
            <h3>Type 1 - Regular</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <p>Default</p>
                <Button 
                  label="label" 
                  variant="text" 
                  buttonType="1"
                  state="default"
                />
              </div>
              <div>
                <p>Hover</p>
                <Button 
                  label="label" 
                  variant="text" 
                  buttonType="1"
                  state="hover"
                />
              </div>
              <div>
                <p>Selected</p>
                <Button 
                  label="label" 
                  variant="text" 
                  buttonType="1"
                  state="selected"
                />
              </div>
            </div>
          </div>

          <div>
            <h3>Type 2 - Semi Bold</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <p>Default</p>
                <Button 
                  label="label" 
                  variant="text" 
                  buttonType="2"
                  state="default"
                />
              </div>
              <div>
                <p>Hover</p>
                <Button 
                  label="label" 
                  variant="text" 
                  buttonType="2"
                  state="hover"
                />
              </div>
              <div>
                <p>Selected</p>
                <Button 
                  label="label" 
                  variant="text" 
                  buttonType="2"
                  state="selected"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 5. BACK BUTTON */}
      {/* ============================================ */}
      <section style={{ marginBottom: '60px' }}>
        <h2>5. Back Button (Botón Volver)</h2>
        <p>Navigation button with left chevron icon. Used for going back.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <p>Default</p>
            <Button 
              label="label" 
              variant="back"
              state="default"
              //icon={<ChevronLeftIcon />}
            />
          </div>
          <div>
            <p>Hover</p>
            <Button 
              label="label" 
              variant="back"
              state="hover"
              //icon={<ChevronLeftIcon />}
            />
          </div>
          <div>
            <p>Click</p>
            <Button 
              label="label" 
              variant="back"
              state="click"
              //icon={<ChevronLeftIcon />}
            />
          </div>
          <div>
            <p>Disabled</p>
            <Button 
              label="label" 
              variant="back"
              state="disabled"
              disabled
              //icon={<ChevronLeftIcon />}
            />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* USAGE EXAMPLES */}
      {/* ============================================ */}
      <section style={{ marginBottom: '60px' }}>
        <h2>Usage Examples</h2>
        
        <div style={{ marginBottom: '30px' }}>
          <h3>With Icons</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button 
              label="Principal" 
              variant="primary" 
              // icon={<ChevronUpIcon />}
            />
            <Button 
              label="Secundario" 
              variant="secondary" 
              //icon={<MapIcon />}
            />
            <Button 
              label="Terciario" 
              variant="tertiary" 
              // icon={<PencilIcon />}
            />
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3>Full Width</h3>
          <Button 
            label="Principal Full Width" 
            variant="primary"
            fullWidth
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3>Different Sizes</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button 
              label="Small" 
              variant="primary"
              size="small"
            />
            <Button 
              label="Medium" 
              variant="primary"
              size="medium"
            />
            <Button 
              label="Large" 
              variant="primary"
              size="large"
            />
          </div>
        </div>

        <div>
          <h3>Disabled</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button 
              label="Principal Disabled" 
              variant="primary"
              disabled
            />
            <Button 
              label="Secundario Disabled" 
              variant="secondary"
              disabled
            />
            <Button 
              label="Terciario Disabled" 
              variant="tertiary"
              disabled
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Implementation Guide</h2>
        <pre style={{ 
          backgroundColor: '#f0f0f0', 
          padding: '15px', 
          borderRadius: '4px',
          overflowX: 'auto'
        }}>
{`// Import Button
import Button from '@/ui/Button';

// Primary Button
<Button 
  label="Click me"
  variant="primary"
  buttonType="1"
  state="default"
  onClick={() => console.log('clicked')}
/>

// Secondary Button  
<Button
  label="Secondary"
  variant="secondary"
  buttonType="1"
/>

// Tertiary Button
<Button
  label="Tertiary"
  variant="tertiary"
/>

// Text Button
<Button
  label="Text Button"
  variant="text"
  buttonType="1"
/>

// Back Button
<Button
  label="Go Back"
  variant="back"
  icon={<ChevronLeftIcon />}
/>

// With Icon
<Button
  label="Download"
  variant="primary"
  icon={<DownloadIcon />}
  iconPosition="right"
/>

// Full Width
<Button
  label="Submit"
  variant="primary"
  fullWidth
/>

// Disabled
<Button
  label="Disabled"
  variant="primary"
  disabled
/>

// Loading
<Button
  label="Loading..."
  variant="primary"
  loading
/>`}
        </pre>
      </section>
    </div>
  );
}
