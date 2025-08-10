import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegionPicker from '@/components/region/RegionPicker'
import { useWeatherStore } from '@/lib/stores/weather'
import { usePreferences } from '@/lib/stores/preferences'

// Mock the stores
jest.mock('@/lib/stores/weather')
jest.mock('@/lib/stores/preferences')

const mockUseWeatherStore = useWeatherStore as jest.MockedFunction<typeof useWeatherStore>
const mockUsePreferences = usePreferences as jest.MockedFunction<typeof usePreferences>

describe('RegionPicker', () => {
  const mockSetSelectedRegion = jest.fn()
  const mockAddRecentRegion = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseWeatherStore.mockReturnValue({
      selectedRegion: null,
      setSelectedRegion: mockSetSelectedRegion,
      isLoading: { current: false, hourly: false, daily: false },
      error: { current: null, hourly: null, daily: null },
      setLoading: jest.fn(),
      setError: jest.fn(),
    })

    mockUsePreferences.mockReturnValue({
      units: 'metric',
      unitPreferences: {
        temperature: 'celsius',
        windSpeed: 'ms',
        precipitation: 'mm'
      },
      language: 'ko',
      recentRegions: [],
      favoriteRegions: [],
      addRecentRegion: mockAddRecentRegion,
      toggleFavoriteRegion: jest.fn(),
      setUnits: jest.fn(),
      setUnitPreferences: jest.fn(),
      setLanguage: jest.fn(),
    })
  })

  it('renders region picker button', () => {
    render(<RegionPicker />)
    
    const button = screen.getByRole('button', { name: /지역을 선택하세요/i })
    expect(button).toBeInTheDocument()
  })

  it('shows selected region name when region is selected', () => {
    mockUseWeatherStore.mockReturnValue({
      selectedRegion: {
        id: 'seoul',
        name: 'Seoul',
        fullName: 'Seoul, South Korea',
        level: 'city',
        coordinates: { lat: 37.5665, lon: 126.9780 }
      },
      setSelectedRegion: mockSetSelectedRegion,
      isLoading: { current: false, hourly: false, daily: false },
      error: { current: null, hourly: null, daily: null },
      setLoading: jest.fn(),
      setError: jest.fn(),
    })

    render(<RegionPicker />)
    
    const button = screen.getByRole('button', { name: /Seoul/i })
    expect(button).toBeInTheDocument()
  })

  it('opens popover when button is clicked', async () => {
    const user = userEvent.setup()
    render(<RegionPicker />)
    
    const button = screen.getByRole('button', { name: /지역을 선택하세요/i })
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/지역 검색/i)).toBeInTheDocument()
    })
  })

  it('shows search input in popover', async () => {
    const user = userEvent.setup()
    render(<RegionPicker />)
    
    const button = screen.getByRole('button', { name: /지역을 선택하세요/i })
    await user.click(button)
    
    const searchInput = screen.getByPlaceholderText(/지역 검색/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('displays list of Korean cities', async () => {
    const user = userEvent.setup()
    render(<RegionPicker />)
    
    const button = screen.getByRole('button', { name: /지역을 선택하세요/i })
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/Seoul/i)).toBeInTheDocument()
      expect(screen.getByText(/Busan/i)).toBeInTheDocument()
      expect(screen.getByText(/Daegu/i)).toBeInTheDocument()
    })
  })

  it('allows searching for regions', async () => {
    const user = userEvent.setup()
    render(<RegionPicker />)
    
    const button = screen.getByRole('button', { name: /지역을 선택하세요/i })
    await user.click(button)
    
    const searchInput = screen.getByPlaceholderText(/지역 검색/i)
    await user.type(searchInput, 'seoul')
    
    await waitFor(() => {
      expect(screen.getByText(/Seoul/i)).toBeInTheDocument()
    })
  })

  it('calls setSelectedRegion when a region is selected', async () => {
    const user = userEvent.setup()
    render(<RegionPicker />)
    
    const button = screen.getByRole('button', { name: /지역을 선택하세요/i })
    await user.click(button)
    
    await waitFor(() => {
      const seoulOption = screen.getByText(/Seoul/i)
      fireEvent.click(seoulOption)
    })
    
    expect(mockSetSelectedRegion).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'seoul',
        name: 'Seoul'
      })
    )
  })

  it('calls addRecentRegion when a region is selected', async () => {
    const user = userEvent.setup()
    render(<RegionPicker />)
    
    const button = screen.getByRole('button', { name: /지역을 선택하세요/i })
    await user.click(button)
    
    await waitFor(() => {
      const seoulOption = screen.getByText(/Seoul/i)
      fireEvent.click(seoulOption)
    })
    
    expect(mockAddRecentRegion).toHaveBeenCalledWith('seoul')
  })

  it('closes popover after region selection', async () => {
    const user = userEvent.setup()
    render(<RegionPicker />)
    
    const button = screen.getByRole('button', { name: /지역을 선택하세요/i })
    await user.click(button)
    
    await waitFor(() => {
      const seoulOption = screen.getByText(/Seoul/i)
      fireEvent.click(seoulOption)
    })
    
    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/지역 검색/i)).not.toBeInTheDocument()
    })
  })

  it('shows empty state when no search results', async () => {
    const user = userEvent.setup()
    render(<RegionPicker />)
    
    const button = screen.getByRole('button', { name: /지역을 선택하세요/i })
    await user.click(button)
    
    const searchInput = screen.getByPlaceholderText(/지역 검색/i)
    await user.type(searchInput, 'nonexistentcity')
    
    await waitFor(() => {
      expect(screen.getByText(/검색 결과가 없습니다/i)).toBeInTheDocument()
    })
  })

  it('has proper accessibility attributes', () => {
    render(<RegionPicker />)
    
    const button = screen.getByRole('button', { name: /지역을 선택하세요/i })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveAttribute('role', 'combobox')
  })

  it('focuses search input when popover opens', async () => {
    const user = userEvent.setup()
    render(<RegionPicker />)
    
    const button = screen.getByRole('button', { name: /지역을 선택하세요/i })
    await user.click(button)
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/지역 검색/i)
      expect(searchInput).toHaveFocus()
    })
  })
})
