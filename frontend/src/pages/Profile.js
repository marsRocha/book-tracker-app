import React, { useState, useEffect, useContext } from 'react'
import { PaginatedList } from 'react-paginated-list'
import { Link, useLocation } from 'react-router-dom'

import Header from '../components/Header'
import AuthContext from '../context/Auth'

const Profile = () => {
  const location = useLocation()

  let [listNum, setListNum] = useState(0)
  let [updates, setUpdates] = useState([])
  let [reviews, setReviews] = useState([])
  let [ratings, setRatings] = useState([])
  let [profile, setProfile] = useState([])
  let { authTokens, logoutUser, user } = useContext(AuthContext)

  useEffect(()=> {
    getProfile()
    getUpdates()
    getReviews()
  }, [])

  // run code every time listNum changes
  useEffect(()=> {
    setRatingsOnPage(listNum)
  }, [listNum])

  let getProfile = async() => {
    let response = await fetch(`http://127.0.0.1:8000/api/profile/${location.state.user_name}`, {
        method:'GET',
        headers:{
            'Content-Type':'application/json',
            'Authorization':'Bearer ' + String(authTokens.access)
        }
    })
    let data = await response.json()

    if(response.status === 200){
        setProfile(data)
    }else if(response.statusText === 'Unauthorized'){
        logoutUser()
    }
  }

  let getUpdates = async() => {
    let response = await fetch(`http://127.0.0.1:8000/api/updates/${location.state.user_name}`, {
      method:'GET',
      headers:{
          'Content-Type':'application/json',
          'Authorization':'Bearer ' + String(authTokens.access)
      }
    })
    let data = await response.json()

    if(response.status === 200){
      setUpdates(data)
      getUserRatings(data, 'update-ratingParent')
    }else if(response.statusText === 'Unauthorized'){
      logoutUser()
    }
  }

  let getReviews = async() => {
    let response = await fetch(`http://127.0.0.1:8000/api/profile/${location.state.user_name}/reviews/`, {
      method:'GET',
      headers:{
          'Content-Type':'application/json',
          'Authorization':'Bearer ' + String(authTokens.access)
      }
    })
    let data = await response.json()

    if(response.status === 200){
      setReviews(data)
    }else if(response.statusText === 'Unauthorized'){
      logoutUser()
    }
  }

  let getUserRatings = async (updates, parentDiv) => {
    let response = await fetch(`http://127.0.0.1:8000/api/profile/${location.state.user_name}/ratings/`, {
        method:'GET',
        headers:{
            'Content-Type':'application/json',
            'Authorization':'Bearer ' + String(authTokens.access)
        }
    })
    let data = await response.json()

    if(response.status === 200){
      setRatings(data)

      if(data.length > 0){
        // fill in stars on book's overall rating interface
        if(parentDiv === 'update-ratingParent') {

          updates.forEach(update => {
            var rating = data.find(rating => rating.book.id === update.book.id)
            if(rating)
              update.book.rating = rating.rating
            else
              update.book.rating = 0
          })
          setUpdates(updates)

            var ratingStars = document.getElementsByClassName('update-ratingParent') 
            Array.from(ratingStars).forEach(parent => {
              var i = 0
              Array.from(parent.children).forEach(star => {
                var book_id = parseInt(star.id)
                var book_rating = updates.find(update => update.book.id === book_id).book.rating

                i++
                if( i <= book_rating)
                  star.classList.add("checked");
                else
                  star.className = 'fa fa-star'
              })
            })
        }
        else {
          // fill in stars on book's overall rating interface
          var ratingStars = document.getElementsByClassName('rating-ratingParent')
          
          Array.from(ratingStars).forEach(parent => {
            var i = 0
            Array.from(parent.children).forEach(star => {
              var book_id = parseInt(star.id)
              var book_rating = data.find(rating => rating.book.id === book_id).rating
              
              i++
              if( i <= book_rating)
                star.classList.add("checked");
              else
                star.className = 'fa fa-star'
            })
          })
        }
      }

    }else if(response.statusText === 'Unauthorized'){
        logoutUser()
    }
  }

  function setRatingsOnPage(num) {

    setListNum(num)

    if(num == 0){   
      getUserRatings(updates, 'update-ratingParent')
    }
    else if( num == 2){
      // fill in stars on book's overall rating interface
      var ratingStars = document.getElementsByClassName('rating-ratingParent')
      
      Array.from(ratingStars).forEach(parent => {
        var i = 0
        Array.from(parent.children).forEach(star => {
          var book_id = parseInt(star.id)
          var book_rating = ratings.find(rating => rating.book.id === book_id).rating
          
          i++
          if( i <= book_rating)
            star.classList.add("checked");
          else
            star.className = 'fa fa-star'
        })
      })
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
        var parentDiv = e.target.parentElement.className
        // up overall ratings and user's as well
        getUserRatings(updates, parentDiv)
    }else if(response.statusText === 'Unauthorized'){
        logoutUser()
    }
  }

  return (
  <div>

    <Header/>

    <div>
        <div style={{maxWidth: '700px', margin: 'auto'}}>
            <div style={{marginTop: '3rem'}}>
                <h1 style={{lineHeight: '1', marginBottom: '0', color: 'black'}}><b>{ profile.user ? profile.user.first_name : '' }</b></h1>
                <h3 id="username" style={{marginTop: '0'}}>@{ profile.user ? profile.user.username : '' }</h3>
            </div>
            <div className='user_stats' style={{display: 'grid', gridTemplateColumns: '33% 34% 33%'}}>
              <div>
                  <p style={{marginBottom: '0'}}>{profile.allBooks ? profile.allBooks : 0}</p>
                  <p style={{marginTop: '.4rem'}}>Books</p>
              </div>
              <div>
                  <p style={{marginBottom: '0'}}>{reviews ? reviews.length : 0}</p>
                  <p style={{marginTop: '.4rem'}}>Reviews</p>
              </div>
              <div>
                  <p style={{marginBottom: '0'}}>{ratings ? ratings.length : 0}</p>
                  <p style={{marginTop: '.4rem'}}>Ratings</p>
              </div>
            </div>
        </div>
        <hr></hr>
        <div>
          <button className='round-button' onClick={() => setRatingsOnPage(0)}>Updates</button>
          <button className='round-button' onClick={() => setRatingsOnPage(1)}>Reviews</button>
          <button className='round-button' onClick={() => setRatingsOnPage(2)}>Ratings</button>
        </div>
        {listNum == 0 ?
          <PaginatedList
            list={updates}
            itemsPerPage={8}
            renderList={(updates) => (
              <div className='ul-book-card-container'>
                <ul className='ul-book-card-one-col'>
                  {updates.length > 0 ? updates.map(update => (
                      <li key={update.id}>
                          <div className='book-card'>
                            <div className='book-card-b-container'>
                              <p>
                                <Link to={`../profile/${user.username}`} style={{color: 'black'}}>
                                  <span> <b>{user.firstname}</b></span>
                                </Link>
                                <span> {update.content}</span>
                              </p>
                              <div className="listing_cover limit_height">
                                  <div>
                                      <img src={ update.book.image }/>
                                  </div>
                                  <div className='book-update-details'>
                                    <Link to={`../book/${update.book.id}`} state={{ book_id: update.book.id }}>
                                      <h3>{update.book.title}</h3>
                                    </Link>
                                    <p className='book-details-author'>by {update.book.authors[0].name}</p>
                                    <div>
                                      <div className='update-ratingParent'>
                                        <button className="fa fa-star" name='star' id={update.book.id} value='1' onClick={postRating}></button>
                                        <button className="fa fa-star" name='star' id={update.book.id} value='2' onClick={postRating}></button>
                                        <button className="fa fa-star" name='star' id={update.book.id} value='3' onClick={postRating}></button>
                                        <button className="fa fa-star" name='star' id={update.book.id} value='4' onClick={postRating}></button>
                                        <button className="fa fa-star" name='star' id={update.book.id} value='5' onClick={postRating}></button>
                                      </div>
                                      <span>{update.book.rating === 0 ? 'Rate this book' :'Your rating'}</span>
                                    </div>
                                    <div className='book-details-footer'>
                                      <p style={{fontSize: '14px'}}>Added on {update.date_published}</p>
                                    </div>
                                  </div>
                              </div>
                            </div>
                            <hr/>
                          </div>
                      </li>
                  )) : <li><p><i>You have no Updates</i></p></li>}
                </ul>
              </div>
            )}
          />
        : listNum == 1 ?
          <PaginatedList
              list={reviews}
              itemsPerPage={8}
              renderList={(reviews) => (
                <div className='ul-book-card-container'>
                  <ul className='ul-book-card-one-col'>
                    {reviews.length > 0 ? reviews.map(review => (
                      <li key={review.id}>
                        <div className='book-card'>
                          <div className='book-card-b-container'>
                            <p>
                              <Link to={`../profile/${user.username}`} style={{color: 'black'}}>
                                <span> <b>{user.firstname}</b></span>
                              </Link>
                              <span> reviewed a book {review.rating}</span>
                            </p>
                            <div className="listing_cover limit_height">
                                <div>
                                    <img src={ review.book.image }/>
                                </div>
                                <div className='book-update-details'>
                                  <Link to={`../book/${review.book.id}`} state={{ book_id: review.book.id }}>
                                    <h3>{review.book.title}</h3>
                                  </Link>
                                  <p className='book-details-author'>by {review.book.authors[0].name}</p>
                                  <p style={{fontWeight: '660', margin: '0'}}>Review</p>
                                  <p style={{marginTop: '0'}}>{review.review}</p>
                                  <div className='book-details-footer'>
                                    <p style={{fontSize: '14px'}}>Reviewed on {review.date_published}</p>
                                  </div>
                                </div>
                            </div>
                            </div>
                            <hr/>
                          </div>
                        </li>
                    )) : <li><p><i>You have no Reviews</i></p></li>}
                  </ul>
                </div>
              )}
            />
        : 
          <PaginatedList
            list={ratings}
            itemsPerPage={8}
            renderList={(ratings) => (
              <div className='ul-book-card-container'>
                <ul className='ul-book-card-one-col'>
                  {ratings.length > 0 ? ratings.map(rating => (
                    <li key={rating.id}>
                      <div className='book-card'>
                        <div className='book-card-b-container'>
                          <p>
                            <Link to={`../profile/${user.username}`} style={{color: 'black'}}>
                              <span> <b>{user.firstname}</b></span>
                            </Link>
                            <span> rated a book</span>
                          </p>
                          <div className="listing_cover limit_height">
                              <div>
                                  <img src={ rating.book.image }/>
                              </div>
                              <div className='book-update-details'>
                                <Link to={`../book/${rating.book.id}`} state={{ book_id: rating.book.id }}>
                                  <h3>{rating.book.title}</h3>
                                </Link>
                                <p className='book-details-author'>by {rating.book.authors[0].name}</p>
                                <div>
                                  <div className='rating-ratingParent'>
                                    <button className="fa fa-star" name='star' id={rating.book.id} value='1' onClick={postRating}></button>
                                    <button className="fa fa-star" name='star' id={rating.book.id} value='2' onClick={postRating}></button>
                                    <button className="fa fa-star" name='star' id={rating.book.id} value='3' onClick={postRating}></button>
                                    <button className="fa fa-star" name='star' id={rating.book.id} value='4' onClick={postRating}></button>
                                    <button className="fa fa-star" name='star' id={rating.book.id} value='5' onClick={postRating}></button>
                                  </div>
                                  <span>Your rating</span>
                                </div>
                                <div className='book-details-footer'>
                                  <p style={{fontSize: '14px'}}>Rated on {rating.date_published}</p>
                                </div>
                              </div>
                          </div>
                          </div>
                          <hr/>
                        </div>
                      </li>
                  )) : <li><p><i>You have not rated a book</i></p></li>}
                </ul>
              </div>
            )}
          />
        }
    </div>
  </div>
  )
}

export default Profile
