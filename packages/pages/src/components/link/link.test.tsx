import React from 'react';
import { render } from '@testing-library/react';
import { Link } from './link';

describe('Link', () => {
  it('renders component when given href + children', () => {
    render(
      <Link href='https://yext.com'>
        Click Me
      </Link>
    );
  })

  it('renders component when given partial cta and children', () => {
    render(
      <Link cta={{ link: 'https://yext.com' }}>
        Click Me
      </Link>
    );
  })

  it('renders component when given full cta prop and no children', () => {
    render(
      <Link cta={{ link: 'https://yext.com', label: "Click Me" }} />
    );
  })

  it('renders component when given full cta prop and no children', () => {
    render(
      <Link cta={{ link: 'https://yext.com' }} />
    );
  })
});


// TODO: Add tests
// Check target="_blank" present on newTab
// Check obfuscated label
// Check obfuscated href
// Check children is label if present
// Check fallback to link for label
