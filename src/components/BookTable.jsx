import React, { useEffect, useState } from 'react';
import { useBooks } from '../context/BookContext';
import BookDetails from './BookDetails';
import $ from 'jquery';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import 'datatables.net-buttons-dt/css/buttons.dataTables.min.css';
import 'datatables.net';
import 'datatables.net-buttons';
import 'datatables.net-buttons-dt';

const BookTable = () => {
  const { books, loading, error, fetchBooks, toggleFavorite } = useBooks();
  const [dataTable, setDataTable] = useState(null);
  const [searchQuery, setSearchQuery] = useState('javascript');
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  const [noteFormData, setNoteFormData] = useState({
    bookId: '',
    note: '',
    rating: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [bookNotes, setBookNotes] = useState({});

  useEffect(() => {
    fetchBooks(searchQuery);
    loadNotesFromStorage();
  }, [searchQuery]);

  useEffect(() => {
    if (books.length > 0 && !dataTable) {
      initializeDataTable();
    } else if (dataTable) {
      dataTable.destroy();
      initializeDataTable();
    }

    return () => {
      if (dataTable) {
        dataTable.destroy();
      }
    };
  }, [books, filterFavorites]);

  // Load notes from localStorage
  const loadNotesFromStorage = () => {
    const savedNotes = localStorage.getItem('bookNotes');
    if (savedNotes) {
      setBookNotes(JSON.parse(savedNotes));
    }
  };

  // Save notes to localStorage
  const saveNotesToStorage = (notes) => {
    localStorage.setItem('bookNotes', JSON.stringify(notes));
  };

  const handleViewDetails = (bookId) => {
    setSelectedBookId(bookId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBookId(null);
  };

  const handleAddNote = (bookId) => {
    const book = books.find(b => b.id === bookId);
    setNoteFormData({
      bookId: bookId,
      bookTitle: book?.title || 'Unknown Title',
      note: bookNotes[bookId]?.note || '',
      rating: bookNotes[bookId]?.rating || ''
    });
    setFormErrors({});
    setShowAddNoteForm(true);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!noteFormData.note.trim()) {
      errors.note = 'Note is required';
    } else if (noteFormData.note.length < 10) {
      errors.note = 'Note must be at least 10 characters long';
    } else if (noteFormData.note.length > 500) {
      errors.note = 'Note must be less than 500 characters';
    }

    if (!noteFormData.rating) {
      errors.rating = 'Rating is required';
    } else if (noteFormData.rating < 1 || noteFormData.rating > 5) {
      errors.rating = 'Rating must be between 1 and 5';
    }

    return errors;
  };

  const handleSubmitNote = (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const updatedNotes = {
      ...bookNotes,
      [noteFormData.bookId]: {
        note: noteFormData.note.trim(),
        rating: parseInt(noteFormData.rating),
        dateAdded: new Date().toISOString(),
        bookTitle: noteFormData.bookTitle
      }
    };

    setBookNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    setShowAddNoteForm(false);
    setFormErrors({});
    
    // Refresh DataTable to show note indicator
    if (dataTable) {
      dataTable.destroy();
      initializeDataTable();
    }
  };

  const handleDeleteNote = (bookId) => {
    const updatedNotes = { ...bookNotes };
    delete updatedNotes[bookId];
    setBookNotes(updatedNotes);
    saveNotesToStorage(updatedNotes);
    
    // Refresh DataTable
    if (dataTable) {
      dataTable.destroy();
      initializeDataTable();
    }
  };

  const getFilteredBooks = () => {
    if (!filterFavorites) return books;
    return books.filter(book => book.favorite);
  };

  const initializeDataTable = () => {
    const filteredBooks = getFilteredBooks();
    
    const table = $('#books-table').DataTable({
      data: filteredBooks.map(book => [
        book.title || 'No title',
        book.author_name ? book.author_name.join(', ') : 'Unknown',
        book.first_publish_year || 'Unknown',
        book.favorite 
          ? `<i class="bi bi-star-fill text-warning cursor-pointer" data-id="${book.id}" title="Remove from favorites"></i>`
          : `<i class="bi bi-star cursor-pointer" data-id="${book.id}" title="Add to favorites"></i>`,
        bookNotes[book.id] 
          ? `<div class="d-flex align-items-center">
              <span class="badge bg-info me-2" title="Has note">
                <i class="bi bi-sticky"></i> Note
              </span>
              <span class="text-warning me-2" title="Rating: ${bookNotes[book.id].rating}/5">
                ${'★'.repeat(bookNotes[book.id].rating)}${'☆'.repeat(5-bookNotes[book.id].rating)}
              </span>
            </div>`
          : '<span class="text-muted">No note</span>',
        `<div class="btn-group" role="group">
          <button class="btn btn-sm btn-outline-primary view-details" data-id="${book.id}" title="View details">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline-success add-note" data-id="${book.id}" title="${bookNotes[book.id] ? 'Edit note' : 'Add note'}">
            <i class="bi bi-sticky"></i>
          </button>
          ${bookNotes[book.id] ? 
            `<button class="btn btn-sm btn-outline-danger delete-note" data-id="${book.id}" title="Delete note">
              <i class="bi bi-trash"></i>
            </button>` : ''
          }
        </div>`
      ]),
      columns: [
        { title: 'Title', width: '30%' },
        { title: 'Author', width: '25%' },
        { title: 'Year', width: '10%' },
        { title: 'Favorite', width: '10%', orderable: false },
        { title: 'Notes/Rating', width: '15%', orderable: false },
        { title: 'Actions', width: '10%', orderable: false }
      ],
      dom: 'Bfrtip',
      buttons: ['copy', 'csv', 'excel'],
      pageLength: 10,
      responsive: true,
      order: [[0, 'asc']]
    });

    // Event handlers
    $('#books-table').on('click', '.bi-star, .bi-star-fill', function() {
      const bookId = $(this).data('id');
      toggleFavorite(bookId);
    });

    $('#books-table').on('click', '.view-details', function() {
      const bookId = $(this).data('id');
      handleViewDetails(bookId);
    });

    $('#books-table').on('click', '.add-note', function() {
      const bookId = $(this).data('id');
      handleAddNote(bookId);
    });

    $('#books-table').on('click', '.delete-note', function() {
      const bookId = $(this).data('id');
      if (confirm('Are you sure you want to delete this note?')) {
        handleDeleteNote(bookId);
      }
    });

    setDataTable(table);
  };

  if (loading) return (
    <div className="text-center my-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading books...</span>
      </div>
      <p className="mt-2">Loading books...</p>
    </div>
  );

  if (error) return (
    <div className="alert alert-danger m-4">
      <i className="bi bi-exclamation-triangle-fill"></i> Error: {error}
    </div>
  );

  const filteredBooks = getFilteredBooks();

  return (
    <>
      <div className="container mt-4">
        {/* Search and Filter Controls */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search books by topic, title, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchBooks(searchQuery)}
              />
              <button 
                className="btn btn-primary" 
                onClick={() => fetchBooks(searchQuery)}
              >
                <i className="bi bi-search"></i> Search
              </button>
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex align-items-center justify-content-end gap-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="favoritesFilter"
                  checked={filterFavorites}
                  onChange={(e) => setFilterFavorites(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="favoritesFilter">
                  <i className="bi bi-star-fill text-warning"></i> Show Favorites Only
                </label>
              </div>
              <small className="text-muted">
                Showing {filteredBooks.length} of {books.length} book{books.length !== 1 ? 's' : ''}
              </small>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-primary">{books.length}</h5>
                <p className="card-text small text-muted">Total Books</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-warning">{books.filter(b => b.favorite).length}</h5>
                <p className="card-text small text-muted">Favorites</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-success">{Object.keys(bookNotes).length}</h5>
                <p className="card-text small text-muted">With Notes</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-info">
                  {Object.keys(bookNotes).length > 0 
                    ? (Object.values(bookNotes).reduce((sum, note) => sum + note.rating, 0) / Object.keys(bookNotes).length).toFixed(1)
                    : '0.0'
                  }
                </h5>
                <p className="card-text small text-muted">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Books Table */}
        <div className="card">
          <div className="card-body">
            <table 
              id="books-table" 
              className="table table-striped table-hover" 
              style={{ width: '100%' }}
            ></table>
          </div>
        </div>
      </div>

      {/* Add/Edit Note Modal */}
      {showAddNoteForm && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => e.target === e.currentTarget && setShowAddNoteForm(false)}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-sticky"></i> {bookNotes[noteFormData.bookId] ? 'Edit Note' : 'Add Note'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowAddNoteForm(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmitNote}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Book:</label>
                    <p className="text-muted">{noteFormData.bookTitle}</p>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="rating" className="form-label">
                      Rating <span className="text-danger">*</span>
                    </label>
                    <select 
                      className={`form-select ${formErrors.rating ? 'is-invalid' : ''}`}
                      id="rating"
                      value={noteFormData.rating}
                      onChange={(e) => setNoteFormData({...noteFormData, rating: e.target.value})}
                    >
                      <option value="">Select a rating</option>
                      <option value="1">1 Star - Poor</option>
                      <option value="2">2 Stars - Fair</option>
                      <option value="3">3 Stars - Good</option>
                      <option value="4">4 Stars - Very Good</option>
                      <option value="5">5 Stars - Excellent</option>
                    </select>
                    {formErrors.rating && (
                      <div className="invalid-feedback">{formErrors.rating}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="note" className="form-label">
                      Note <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className={`form-control ${formErrors.note ? 'is-invalid' : ''}`}
                      id="note"
                      rows="4"
                      placeholder="Write your thoughts about this book..."
                      value={noteFormData.note}
                      onChange={(e) => setNoteFormData({...noteFormData, note: e.target.value})}
                      maxLength="500"
                    ></textarea>
                    <div className="form-text">
                      {noteFormData.note.length}/500 characters
                    </div>
                    {formErrors.note && (
                      <div className="invalid-feedback">{formErrors.note}</div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowAddNoteForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    <i className="bi bi-check-lg"></i> {bookNotes[noteFormData.bookId] ? 'Update Note' : 'Save Note'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Book Details Modal */}
      <BookDetails 
        bookId={selectedBookId}
        show={showModal}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default BookTable;