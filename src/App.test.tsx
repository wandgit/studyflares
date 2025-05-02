import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    // The root element should be in the document
    expect(document.getElementById('root')).toBeInTheDocument()
  })

  it('renders main navigation', () => {
    render(<App />)
    // Check if basic navigation elements are present
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders home page by default', () => {
    render(<App />)
    // Check if home page content is visible
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
