import React from 'react';
import { useBooks } from '../context/BookContext';

const BookDetails = ({ bookId, show, onClose }) => {
  const { books, toggleFavorite } = useBooks();
  
  // Find the book by ID
  const book = books.find(b => b.id === bookId);
  
  if (!book) return null;

  const handleFavoriteToggle = () => {
    toggleFavorite(bookId);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div 
      className="modal fade show d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleBackdropClick}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Book Details</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-4 text-center">
                {book.cover_i ? (
                  <img 
                    src={`https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`}
                    alt={book.title}
                    className="img-fluid rounded shadow"
                    style={{ maxHeight: '300px' }}
                  />
                ) : (
                  <div className="bg-light d-flex align-items-center justify-content-center rounded" style={{ height: '300px', width: '200px', margin: '0 auto' }}>
                    <i className="bi bi-book text-muted" style={{ fontSize: '3rem' }}></i>
                  </div>
                )}
              </div>
              <div className="col-md-8">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h3 className="mb-0">{book.title || 'No Title Available'}</h3>
                  <button 
                    className={`btn btn-outline-warning ${book.favorite ? 'active' : ''}`}
                    onClick={handleFavoriteToggle}
                  >
                    <i className={`bi ${book.favorite ? 'bi-star-fill' : 'bi-star'}`}></i>
                    {book.favorite ? ' Remove from Favorites' : ' Add to Favorites'}
                  </button>
                </div>
                
                <div className="mb-3">
                  <h6 className="text-muted mb-1">Author(s)</h6>
                  <p className="mb-0">
                    {book.author_name ? book.author_name.join(', ') : 'Unknown Author'}
                  </p>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6 className="text-muted mb-1">First Published</h6>
                    <p className="mb-0">{book.first_publish_year || 'Unknown'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted mb-1">Number of Pages</h6>
                    <p className="mb-0">{book.number_of_pages_median || 'Unknown'}</p>
                  </div>
                </div>

                {book.isbn && (
                  <div className="mb-3">
                    <h6 className="text-muted mb-1">ISBN</h6>
                    <p className="mb-0">{book.isbn[0]}</p>
                  </div>
                )}

                {book.publisher && (
                  <div className="mb-3">
                    <h6 className="text-muted mb-1">Publisher(s)</h6>
                    <p className="mb-0">{book.publisher.slice(0, 3).join(', ')}</p>
                  </div>
                )}

                {book.language && (
                  <div className="mb-3">
                    <h6 className="text-muted mb-1">Language(s)</h6>
                    <p className="mb-0">{book.language.join(', ').toUpperCase()}</p>
                  </div>
                )}

                {book.subject && (
                  <div className="mb-3">
                    <h6 className="text-muted mb-1">Subjects</h6>
                    <div className="d-flex flex-wrap gap-1">
                      {book.subject.slice(0, 10).map((subject, index) => (
                        <span key={index} className="badge bg-secondary">
                          {subject}
                        </span>
                      ))}
                      {book.subject.length > 10 && (
                        <span className="badge bg-light text-dark">
                          +{book.subject.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <h6 className="text-muted mb-1">Open Library Key</h6>
                  <p className="mb-0">
                    <a 
                      href={`https://openlibrary.org${book.key}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      View on Open Library <i className="bi bi-box-arrow-up-right"></i>
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            {book.key && (
              <a 
                href={`https://openlibrary.org${book.key}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Read Online <i className="bi bi-book"></i>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;