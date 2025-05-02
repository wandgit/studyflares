import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import MainLayout from './MainLayout'

describe('MainLayout', () => {
  it('renders navigation', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    )
    
    // Check if navigation is present
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div data-testid="test-content">Test Content</div>
        </MainLayout>
      </BrowserRouter>
    )
    
    // Check if child content is rendered
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })
})
