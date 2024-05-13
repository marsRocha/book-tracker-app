import React, { useState, useEffect, useContext } from 'react'
import AuthContext from '../context/Auth'

import Header from '../components/Header'
import { Link } from 'react-router-dom'
import { PaginatedList } from 'react-paginated-list'

const MyBooks = () => {
    let [profile, setProfile] = useState([])
    let [books, setBooks] = useState([])
    let { authTokens, user, logoutUser } = useContext(AuthContext)
  
    let getProfile = async() => {
        let response = await fetch(`http://127.0.0.1:8000/api/profile/${user.username}/books/`, {
            method:'GET',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            }
        })
        let data = await response.json()

        if(response.status === 200){
            setProfile(data)

            // set book shelves
            data.want_read.forEach(book => { book.shelf = 1 });
            data.reading.forEach(book => { book.shelf = 2 });
            data.read.forEach(book => { book.shelf = 3 });
            // add books to list
            var allBooks = data.reading.concat(data.read, data.want_read)
            setBooks(allBooks)

        }else if(response.statusText === 'Unauthorized'){
            logoutUser()
        }
    }

    let updateList = (e) => {
        let searchParam = e.target.value
        var filteredBooks

        if(searchParam == 0)
            filteredBooks = profile.reading.concat(profile.read, profile.want_read)
        else if (searchParam == 1)
            filteredBooks = profile.reading
        else if (searchParam == 2)
            filteredBooks = profile.want_read
        else if (searchParam == 3)
            filteredBooks = profile.read
        setBooks(filteredBooks)
    }

    useEffect(()=> {
        getProfile()
    }, [])
  
    return (
    <div>
        <Header/>
        <br/>
        <div>
            <button className='round-button' value='0' onClick={updateList}>All ({profile.reading ? profile.reading.length + profile.want_read.length + profile.read.length : 0})</button>
            <button className='round-button' value='1' onClick={updateList}>Reading ({profile.reading ? profile.reading.length : 0})</button>
            <button className='round-button' value='2' onClick={updateList}>Want to Read ({profile.want_read ? profile.want_read.length : 0})</button>
            <button className='round-button' value='3' onClick={updateList}>Read ({profile.read ? profile.read.length : 0})</button>
        </div>
        <div>
            {books.length > 0 ?
                <PaginatedList
                list={books}
                itemsPerPage={8}
                renderList={(books) => (
                    <div className='ul-book-card-container'>
                        <ul className='ul-book-card'>
                        {books.map((book) => {
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
                                                <div className='book-details-footer'>
                                                    <p>Shelf <b style={{fontWeight: '600', margin: '0'}}>{book.shelf == 1 ? 'Want to Read' : book.shelf == 2 ? 'Reading' : 'Read'}</b></p>
                                                </div>
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
            :
            <div className='container'>
                <hr/>
                <p>
                    <i>You have no books. You can find some on
                        <span> </span>
                        <Link to={`../discover`} style={{color: 'black'}}>
                            <span>Discover</span>
                        </Link>!
                    </i>
                </p>
            </div>
            }
        </div>
    </div>
    )
}

export default MyBooks