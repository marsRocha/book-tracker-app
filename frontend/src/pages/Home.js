import React, { useState, useEffect, useContext } from 'react'
import AuthContext from '../context/Auth'

import Header from '../components/Header'
import { Link } from 'react-router-dom'

const Home = () => {
    let [books, setBooks] = useState([])
    let { authTokens, logoutUser, user } = useContext(AuthContext)

    useEffect(()=> {
        getProfile()
    }, [])

    let getRecomendations = async(userBooks) => {
        let response = await fetch('http://127.0.0.1:8000/api/bookRecomendations/', {
        method:'GET',
        headers:{
            'Content-Type':'application/json',
            'Authorization':'Bearer ' + String(authTokens.access)
        }
        })
        let data = await response.json()

        if(response.status === 200){
        
        data.forEach(book => {
            userBooks.forEach(userBook => {
            if (userBook.id == book.id){
                book.shelf = userBook.shelf
                return
            }
            });
        });

        setBooks(data)
        getUserRatings(data)

        }else if(response.statusText === 'Unauthorized'){
            logoutUser()
        }
    }

    let getProfile = async() => {
        let response = await fetch(`http://127.0.0.1:8000/api/profile/${user.username}`, {
            method:'GET',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            }
        })
        let data = await response.json()

        if(response.status === 200){
            // set book shelves
            data.want_read.forEach(book => { book.shelf = 1 });
            data.reading.forEach(book => { book.shelf = 2 });
            data.read.forEach(book => { book.shelf = 3 });
            // add books to list
            var allBooks = data.reading.concat(data.read, data.want_read)
            getRecomendations(allBooks)
        }else if(response.statusText === 'Unauthorized'){
            logoutUser()
        }
    }

    let addToShelf = async(e)=> {
        var shelf = parseInt(e.target.value)

        let response = await fetch(`http://127.0.0.1:8000/api/shelf/${e.target.name}`, {
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            },
            body:JSON.stringify({'shelf':shelf})
        })
        await response.json()

        if(response.status === 200){

            var updatedBooks = []
            books.forEach(book => {
                if (book.id == parseInt(e.target.name)){
                    book.shelf = shelf
                }
                updatedBooks.push(book)
            })

            updatedBooks.find(book => book.id === parseInt(e.target.name)).shelf = parseInt(shelf)
            // update interface
            setBooks(updatedBooks)
        }else{
            alert('Something went wrong!')
        }
    }

    let getUserRatings = async (books) => {
        let response = await fetch(`http://127.0.0.1:8000/api/profile/${user.username}/ratings/`, {
            method:'GET',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            }
        })
        let data = await response.json()

        if(response.status === 200){

            books.forEach(book => {
                var rating = data.find(rating => rating.book.id === book.id)
                if(rating)
                    book.rating = rating.rating
                else
                    book.rating = 0
            })
            setBooks(books)

            // fill in stars on book's overall rating interface
            var ratingStars = document.getElementsByClassName('ratingParent')

            Array.from(ratingStars).forEach(parent => {
                var i = 0
                var book_id
                var has_rating = false
                Array.from(parent.children).forEach(star => {
                    book_id = parseInt(star.id)
                    var book_rating = books.find(book => book.id === book_id).rating
                    has_rating = book_rating > 0

                    i++
                    if( i <= book_rating)
                        star.classList.add("checked");
                    else
                        star.className = 'fa fa-star'
                        
                })

                if(has_rating)
                    document.getElementById(`book-rating-desc-${book_id}`).innerHTML = 'Your rating'
                else
                    document.getElementById(`book-rating-desc-${book_id}`).innerHTML = 'Rate this book'
            })

        }else if(response.statusText === 'Unauthorized'){
            logoutUser()
        }
    }

    let postRating = async (e) => {
        var newRating = parseInt(e.target.value)
        var book_id = parseInt(e.target.id)

        let response = await fetch(`http://127.0.0.1:8000/api/ratings/${book_id}`, {
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            },
            body:JSON.stringify({'rating': newRating})
        })
        await response.json()

        if(response.status === 200){
                // up overall ratings and user's as well
                getUserRatings(books)

        }else if(response.statusText === 'Unauthorized'){
                logoutUser()
        }
    }

    return (
        <div>
            <Header/>
            <div className='container'>
                <h1>Welcome, {user.firstname} 👋</h1>
                <p style={{marginTop: '0'}}><i>Organize your reading!</i></p>
                <div style={{marginTop: '3rem'}}>
                    <hr/>
                    <div style={{fontWeight: '660', margin: '.1rem 0'}}>
                        <span>Here's some books for you to explore</span>
                    </div>
                    <div className='ul-book-card-container'>
                        <ul className='ul-book-card'>
                            {books.map(book => (
                                <li key={book.id}>
                                    <div className='book-card-a-container'>
                                        <div className='book-card'>
                                            <div className='book-card-container' style={{ padding: '.5rem'}}>
                                                <p style={{fontWeight: '660', margin: '.1rem 0'}}>{book.mainCategory.title}</p>
                                                <div className="listing_cover limit_height">
                                                    <div>
                                                        <img src={ book.image }/>
                                                    </div>
                                                    <div className='book-update-details'>
                                                        <Link to={`../book/${book.id}`} state={{ book_id: book.id }}>
                                                            <h3>{book.title}</h3>
                                                        </Link>
                                                        <p className='book-details-author'>by {book.authors[0].name}</p>
                                                        <div style={{maxWidth: '151px', textAlign: 'center'}}>
                                                          <div style={{marginTop: '1.5rem', marginBottom: '.5rem'}}>
                                                              { book.shelf < 1 ?
                                                                  <button className='round-button' value={1} name={book.id} onClick={addToShelf} style={{backgroundColor:'black', color: 'white'}}>Add book</button>
                                                              : 
                                                                  <select id="shelves" name={book.id} onChange={addToShelf} value={book.shelf}>
                                                                      <option value="1">Want To Read</option>
                                                                      <option value="2">Reading</option>
                                                                      <option value="3">Read</option>
                                                                      <option value="0">--Remove from Shelves--</option>
                                                                  </select>
                                                              }
                                                          </div>
                                                          <div >
                                                              <div className='ratingParent'>
                                                                  <button className="fa fa-star" name='star' id={book.id} value='1' onClick={postRating}></button>
                                                                  <button className="fa fa-star" name='star' id={book.id} value='2' onClick={postRating}></button>
                                                                  <button className="fa fa-star" name='star' id={book.id} value='3' onClick={postRating}></button>
                                                                  <button className="fa fa-star" name='star' id={book.id} value='4' onClick={postRating}></button>
                                                                  <button className="fa fa-star" name='star' id={book.id} value='5' onClick={postRating}></button>
                                                              </div>
                                                              <span id={`book-rating-desc-${book.id}`} style={{fontSize: '13px'}}>Rate this book</span>
                                                          </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home
