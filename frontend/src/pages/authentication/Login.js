import React, { useContext } from 'react'
import { Link } from 'react-router-dom';
import AuthContext from '../../context/Auth';

const Login = () => {
  let { loginUser} = useContext(AuthContext)

  const handleSubmit = e => {
    e.preventDefault()
    const username = e.target.username.value;
    const password = e.target.password.value;
    username.length > 0 && loginUser(username, password);
  };

  return (
    <div className='container'>
      <h1>Login </h1>
      <div style={{margin: '3rem auto', maxWidth: '500px'}}>
        <div style={{textAlign: 'left'}}>
          <form onSubmit={loginUser}>
            <p className="form-label"><label htmlFor='username'>Username</label></p>
            <div style={{display: 'flex'}}>
              <input className='round-input' type='text' name='username' placeholder='Enter Username'/>
            </div>
            <p className="form-label"><label htmlFor="password">Password</label></p>
            <div style={{display: 'flex'}}>
              <input className='round-input' type='password' name='password' placeholder='Enter Password'/>
            </div>
            <p style={{marginTop: '2rem', textAlign: 'center'}}><input className='round-button-form' type='submit' value='Login'/></p>
          </form>
          <p style={{ marginTop: '3rem', textAlign: 'center'}}>
            <Link to={`../register`} style={{color: 'black'}}>
              <span>Create Account</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
