import React, { createContext, useContext, useReducer, useEffect } from 'react';

const BookContext = createContext();

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_BOOKS: 'SET_BOOKS',
  SET_ERROR: 'SET_ERROR',
  TOGGLE_FAVORITE: 'TOGGLE_FAVORITE',
  LOAD_FAVORITES: 'LOAD_FAVORITES'
};

// Initial state
const initialState = {
  books: [],
  loading: false,
  error: null,
  favorites: []
};

// Reducer function
const bookReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null
      };

    case ACTIONS.SET_BOOKS:
      // Merge books with favorites from localStorage
      const booksWithFavorites = action.payload.map(book => ({
        ...book,
        id: book.key, // Use the book's key as ID
        favorite: state.favorites.includes(book.key)
      }));
      
      return {
        ...state,
        books: booksWithFavorites,
        loading: false,
        error: null
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case ACTIONS.LOAD_FAVORITES:
      return {
        ...state,
        favorites: action.payload
      };

    case ACTIONS.TOGGLE_FAVORITE:
      const bookId = action.payload;
      const isCurrentlyFavorite = state.favorites.includes(bookId);
      
      let newFavorites;
      if (isCurrentlyFavorite) {
        newFavorites = state.favorites.filter(id => id !== bookId);
      } else {
        newFavorites = [...state.favorites, bookId];
      }

      // Save to localStorage
      localStorage.setItem('bookFavorites', JSON.stringify(newFavorites));

      // Update books array
      const updatedBooks = state.books.map(book => 
        book.id === bookId 
          ? { ...book, favorite: !isCurrentlyFavorite }
          : book
      );

      return {
        ...state,
        books: updatedBooks,
        favorites: newFavorites
      };

    default:
      return state;
  }
};

// BookProvider component
export const BookProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookReducer, initialState);

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('bookFavorites');
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites);
        dispatch({ type: ACTIONS.LOAD_FAVORITES, payload: favorites });
      } catch (error) {
        console.error('Error loading favorites from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem('bookFavorites');
      }
    }
  }, []);

  // Fetch books function
  const fetchBooks = async (query = 'javascript', limit = 50) => {
    if (!query.trim()) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Search query cannot be empty' });
      return;
    }

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodedQuery}&limit=${limit}&fields=key,title,author_name,first_publish_year,cover_i,isbn,publisher,language,subject,number_of_pages_median`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.docs || data.docs.length === 0) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: 'No books found for your search query' });
        return;
      }

      dispatch({ type: ACTIONS.SET_BOOKS, payload: data.docs });
    } catch (error) {
      console.error('Error fetching books:', error);
      dispatch({ 
        type: ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to fetch books. Please check your internet connection and try again.' 
      });
    }
  };

  // Toggle favorite function
  const toggleFavorite = (bookId) => {
    dispatch({ type: ACTIONS.TOGGLE_FAVORITE, payload: bookId });
  };

  // Get favorites function
  const getFavoriteBooks = () => {
    return state.books.filter(book => book.favorite);
  };

  // Clear all favorites function
  const clearAllFavorites = () => {
    localStorage.removeItem('bookFavorites');
    dispatch({ type: ACTIONS.LOAD_FAVORITES, payload: [] });
    
    // Update all books to remove favorite status
    const updatedBooks = state.books.map(book => ({ ...book, favorite: false }));
    dispatch({ type: ACTIONS.SET_BOOKS, payload: updatedBooks });
  };

  const value = {
    books: state.books,
    loading: state.loading,
    error: state.error,
    favorites: state.favorites,
    fetchBooks,
    toggleFavorite,
    getFavoriteBooks,
    clearAllFavorites
  };

  return (
    <BookContext.Provider value={value}>
      {children}
    </BookContext.Provider>
  );
};

// Custom hook to use the BookContext
export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};