import React, { useState, useEffect, useContext } from 'react'
import AuthContext from '../context/Auth'

import Header from '../components/Header'
import { PaginatedList } from 'react-paginated-list'
import { Link } from 'react-router-dom'

const Discover = () => {
    let [categories, setCategories] = useState([])
    let [query, setQuery] = useState('')
    let [books, setBooks] = useState([])
    let { authTokens, logoutUser, user } = useContext(AuthContext)
  
    useEffect(()=> {
      getCategories()
    }, [])
  
    let getCategories = async() => {
      let response = await fetch('http://127.0.0.1:8000/api/categories/', {
        method:'GET',
        headers:{
          'Content-Type':'application/json',
          'Authorization':'Bearer ' + String(authTokens.access)
        }
      })
      let data = await response.json()
  
      if(response.status === 200){
        setCategories(data)
      }else if(response.statusText === 'Unauthorized'){
        logoutUser()
      }
    }
  
    let getBooksbyCategory = async(e) => {
      e.preventDefault()
      let response = await fetch(`http://127.0.0.1:8000/api/searchCategory/${e.target.value}`, {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization':'Bearer ' + String(authTokens.access)
        }
      })
      let data = await response.json()
  
      if(response.status === 200){
        setBooks(data)
        setQuery(e.target.name)
      }else if(response.statusText === 'Unauthorized'){
        logoutUser()
      }
    }

    let getBooksByQuery = async(e) => {
      e.preventDefault()
      let response = await fetch('http://127.0.0.1:8000/api/search/', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization':'Bearer ' + String(authTokens.access)
        },
        body:JSON.stringify({'query':e.target.query.value})
      })
      let data = await response.json()
  
      if(response.status === 200){
        setBooks(data)
        setQuery(e.target.query.value)
      }else if(response.statusText === 'Unauthorized'){
        logoutUser()
      }
    }

    let cleanSearch = () => {
      setQuery('')
      setBooks([])
      // clean input text from search bar
      document.getElementById('query').value = ''
    }
  
  return (
    <div>
        <Header/>
        <div className='container'>          
          <h1>Find a new <i>favorite</i> Book!</h1>
          <div style={{marginTop: '2rem'}}>
            <form onSubmit={getBooksByQuery}>
              <div className="search_bar_container">
                <div style={{ float: 'left'}}>
                  <i className="fa fa-search"></i>
                </div>
                  <input type="text" id="query" name="query" placeholder="Title or author"/>
                <div style={{ float: 'right'}}>
                  <input type="submit" id='search' value="Search"/>
                </div>
              </div>
            </form>
          </div>
          {query == '' ? 
            <div style={{margin: '.5rem 1rem'}}>
              {categories ? categories.map((category) =>(
                  <button className='round-button' key={category.id} name={category.title} value={category.id} onClick={getBooksbyCategory}>{category.title}</button>
                  ))
              : null}
            </div>
          :
            <div style={{margin: '.5rem auto', textAlign: 'left', maxWidth: '1000px'}}>
              <button className='round-result' onClick={cleanSearch}>X&emsp;|&emsp;results for:&emsp;<i>{query}</i></button>
            </div>
          }
        </div>
        <div>
          {books.length > 0 ?
            <PaginatedList
              list={books}
              itemsPerPage={8}
              renderList={(books) => (
                <div className='ul-book-card-container'>
                  <ul className='ul-book-card'>
                    {books.map(book => {
                      return (
                        <li key={book.id}>
                          <div className='book-card'>
                            <hr/>
                            <div className='book-card-b-container'>
                              <div className="listing_cover limit_height">
                                <div>
                                  <img src={ book.image }/>
                                </div>
                                <div className='book-update-details'>
                                    <Link to={`../book/${book.id}`} state={{ book_id: book.id }}>
                                        <h3>{book.title}</h3>
                                    </Link>
                                    <p className='book-details-author'>by {book.authors[0].name}</p>
                                    <p>{book.rating} <span className='fa fa-star'></span> . {book.ratingsCount} rating(s) . {book.year}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            />
          : null}
          {query != '' && books.length < 1 ? <p><i>No results found</i></p> : null}
        </div> 
    </div>
  )
}

export default Discover