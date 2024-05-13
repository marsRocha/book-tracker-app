import React, { useState, useEffect, useContext } from 'react'
import AuthContext from '../context/Auth'

import Header from '../components/Header'
import { Link, useLocation } from 'react-router-dom'

const Book = () => {
    const location = useLocation()

    let [profile, setProfile] = useState([])
    let [book, setBook] = useState([])
    let [rating, setRating] = useState(0)
    let [ratings, setRatings] = useState([])
    let [myRating, setMyRating] = useState(0)
    let [reviews, setReviews] = useState([])
    let [myReview, setMyReview] = useState(false)
    let [shelf, setShelf] = useState(0)
    let {authTokens, logoutUser, user } = useContext(AuthContext)


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
            setProfile(data)
            getBook(data)
        }else if(response.statusText === 'Unauthorized'){
            logoutUser()
        }
    }

    let addToShelf = async (e)=> {
        e.preventDefault()
        let response = await fetch(`http://127.0.0.1:8000/api/shelf/${book.id}`, {
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            },
            body:JSON.stringify({'shelf':e.target.value})
        })
        let data = await response.json()

        if(response.status === 200){
            setShelf(data.shelf)
        }else{
            alert('Something went wrong!')
        }

    }

    let getBook = async (p) => {
        let response = await fetch(`http://127.0.0.1:8000/api/book/${location.state.book_id}`, {
            method:'GET',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            }
        })
        let data = await response.json()

        if(response.status === 200){
            setBook(data)

            // check if is inside a shelf
            if(p.want_read.some(b => b.id === data.id))
                setShelf(1)
            else if(p.reading.some(b => b.id === data.id))
                setShelf(2)
            else if(p.read.some(b => b.id === data.id))
                setShelf(3)
        }else if(response.statusText === 'Unauthorized'){
            logoutUser()
        }
    }

    let getReviews = async () => {
        let response = await fetch(`http://127.0.0.1:8000/api/reviews/${location.state.book_id}`, {
            method:'GET',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            }
        })
        let data = await response.json()

        if(response.status === 200){
            setReviews(data)
            // check for user's review
            data.forEach(review => {
                if(review.user.id === user.id){
                    setMyReview(true)
                    return
                }
            });
        }else if(response.statusText === 'Unauthorized'){
            logoutUser()
        }
    }

    let getRatings = async () => {
        let response = await fetch(`http://127.0.0.1:8000/api/ratings/${location.state.book_id}`, {
            method:'GET',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            }
        })
        let data = await response.json()

        if(response.status === 200){
            setRatings(data)

            var mr = 0;
            if(data.length > 0){
                var med = 0
                // calculate book's median rating
                data.forEach(rating => {
                    med += parseInt(rating.rating)
                });
                setRating(med/(data.length))

                // get user's rating
                data.forEach(rating => {
                    console.log(rating.user)
                    console.log(user.id)

                    if(rating.user === user.id){
                        mr = rating.rating
                        return
                    }
                });

                console.log('mr'+mr)
                setMyRating(mr)

            }
            else{
                setRating(0)
                setMyRating(0)
            }

            // fill in stars on book's overall rating interface
            let ratingStars = document.getElementsByName('star')
            var i = 0;
            ratingStars.forEach(star => {
                i++
                if( i <= med)
                    star.classList.add("checked");
                else
                    star.className = 'fa fa-star'
            });

            // fill in stars on user's rating interface
            let myRatingStars = document.getElementsByName('myStar')
            i = 0;
            myRatingStars.forEach(star => {
                i++
                if( i <= mr)
                    star.classList.add("checked");
                else
                    star.className = 'fa fa-star'
            });

        }else if(response.statusText === 'Unauthorized'){
            logoutUser()
        }
    }

    let postRating = async (e) => {
        let response = await fetch(`http://127.0.0.1:8000/api/ratings/${location.state.book_id}`, {
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            },
            body:JSON.stringify({'rating':e.target.value})
        })
        await response.json()

        if(response.status === 200){
            // up overall ratings and user's as well
            getRatings()
        }else if(response.statusText === 'Unauthorized'){
            logoutUser()
        }
    }

    let postReview = async (e) => {
        e.preventDefault();
        let response = await fetch(`http://127.0.0.1:8000/api/review/${location.state.book_id}`, {
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + String(authTokens.access)
            },
            body:JSON.stringify({'review':e.target.review.value})
        })
        let data = await response.json()

        if(response.status === 200){
            getReviews();
        }else if(response.statusText === 'Unauthorized'){
            logoutUser();
        }
    }

  useEffect(()=> {
    getProfile()
    getRatings()
    getReviews()
  }, [])

  return (
  <div>

    <Header/>

    <div className='mainDiv'>
        <div className='coverDiv'>
        <div style={{ 'maxWidth': '350px', 'margin': 'auto'}}>
            <img style={{"height": "100%", "width": "100%", "objectFit": "contain"}} src={book.image} alt={book.title}/>
        </div>
            <div className='cover-title-author'>
                <h1>{book.title}</h1>
                {book.authors ? book.authors.map((author) =>(
                    <h3 key={`author${author.id}`} style={{ margin: '.3rem 0', fontWeight: '400'}}>{author.name}</h3>
                    )) : null}
            </div>
            <div className='statistics'>
                <div>
                    <span className="fa fa-star" id='star1' name='star'></span>
                    <span className="fa fa-star" id='star2' name='star'></span>
                    <span className="fa fa-star" id='star3' name='star'></span>
                    <span className="fa fa-star" id='star4' name='star'></span>
                    <span className="fa fa-star" id='star5' name='star'></span>
                    <span className='fa'>{rating}</span>
                </div>
                <div>
                    <span>{ratings.length} ratings</span>
                    <span> • </span>
                    <span>{reviews.length} reviews</span>
                </div>
                <div style={{marginTop: '1.5rem', marginBottom: '.5rem'}}>
                    { shelf < 1 ?
                        <button className='round-button' value={1} onClick={addToShelf} style={{backgroundColor:'black', color: 'white'}}>Add book</button>
                    : 
                        <select id="shelves" onChange={addToShelf} value={shelf}>
                            <option value="1">Want To Read</option>
                            <option value="2">Reading</option>
                            <option value="3">Read</option>
                            <option value="0">--Remove from Shelves--</option>
                        </select>
                    }
                </div>
                <div>
                    <div className='rating-click-form'>
                        <button className="fa fa-star" id='star1' name='myStar' value='1' onClick={postRating}></button>
                        <button className="fa fa-star" id='star2' name='myStar' value='2' onClick={postRating}></button>
                        <button className="fa fa-star" id='star3' name='myStar' value='3' onClick={postRating}></button>
                        <button className="fa fa-star" id='star4' name='myStar' value='4' onClick={postRating}></button>
                        <button className="fa fa-star" id='star5' name='myStar' value='5' onClick={postRating}></button>
                    </div>
                    <span>{myRating === 0 ? 'Rate this book' :'Your rating'}</span>
                </div>
            </div>
        </div>
        <div className='infoDiv'>
            <hr className='info-hr'/>
            <div className='info-title-author'>
                <h1>{book.title}</h1>
                {book.authors ? book.authors.map((author) =>(
                    <h3 key={`author${author.id}`} style={{ margin: '.3rem 0', fontWeight: '400'}}>{author.name}</h3>
                    )) : null}
            </div>
            <div className='container'>
                <div style={{textAlign: 'justify'}}>
                    <span>{book.description}</span>
                </div>
                <div style={{textAlign: 'left', marginTop: '1rem'}}>
                    <h4 style={{fontWeight: '660', marginBottom: '.6rem'}}>This Edition</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '25% auto',  margin: '.3rem 0' }}>
                        <div> <span style={{fontWeight: '600'}}>Genres</span></div>
                        <div>
                            <i>
                                {book.categories ? book.categories.map((category) =>(
                                <span key={`category${category.id}`} style={{fontWeight: '600'}}>{category.title}</span>
                                )) : null}
                            </i>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '25% auto',  margin: '.3rem 0' }}>
                        <div> <span style={{fontWeight: '600'}}>Pages</span></div>
                        <div><i>{book.pageCount}</i></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '25% auto', margin: '.3rem 0' }}>
                        <div> <span style={{fontWeight: '600'}}>Published</span></div>
                        <div><i>{book.publish_date} by {book.publisher}</i></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '25% auto', margin: '.3rem 0' }}>
                        <div> <span style={{fontWeight: '600'}}>Language</span></div>
                        <div><i>{book.language}</i></div>
                    </div>
                </div>
            </div>
            <hr/>
            <div className='container'>
                <h4 style={{fontWeight: '660', margin: '0', textAlign: 'left'}}>{reviews.length} Community Reviews</h4>
                {reviews.length > 0 ?
                    <ul style={{listStyleType: 'none', margin: '2rem 0', padding: '0', textAlign: 'left'}}>
                        {reviews.map(review => (
                            <li key={`review${review.id}`}>
                                <Link to={`../profile/${review.user.username}`} state={{ user_name: review.user.username }} style={{color: 'black'}}>
                                    <p><i className="fa fa-user-circle-o" aria-hidden="true"></i> <b>{review.user.first_name}</b></p>
                                </Link>
                                <p style={{ marginBottom: '0.3rem'}}>{review.review}</p>
                                <small style={{ marginTop: '0.1rem', color: 'grey'}}>{review.date_published}</small>
                                <hr/>
                            </li>
                        ))}
                    </ul>
                : 
                    <div>
                        <p><i>This book has no reviews. Be the first to review it!</i></p>
                    </div>
                }
                {!myReview ? 
                <div>
                    <div style={{ textAlign: 'left'}}>
                        <h4 style={{fontWeight: '660', marginBottom: '.6rem'}}><i>Add Review</i></h4>
                    </div>
                    <form onSubmit={postReview}>
                        <textarea type="text" name="review" style={{width: '100%'}}></textarea>
                        <p><input className='round-button' type="submit" value="Submit"/></p>
                    </form>
                </div>
                : null }
            </div>
        </div>
    </div>
  </div>
  )
}

export default Book