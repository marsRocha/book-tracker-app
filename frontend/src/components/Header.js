import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import AuthContext from '../context/Auth'
import Login from '../pages/authentication/Login'

const Header = () => {
  let { logoutUser, user } = useContext(AuthContext)
  return (
    <div>
      <header>
        <nav>
          <ul className='navbar'>
            <li>
              <Link to='/'>Home</Link>
            </li>
            <li>
              <Link to='/mybooks'>My Books</Link>
            </li>
            <li>
              <Link to='/discover'>Discover</Link>
            </li>
            <li>
              <Link to={`/profile/${user.username}`} state={{ user_name: user.username }}>Profile</Link>
            </li>
            <li>
              <p onClick={logoutUser} style={{margin: 0}}>Logout</p>
            </li>
          </ul>
        </nav>
      </header>
    </div>
  )
}

export default Header
