import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from '../../context/Auth'

const Register = () => {
  const [firstname, setFirstname] = useState("Brian");
  const [surname, setSurname] = useState("Mosby");
  const [email, setEmail] = useState("brian@brian.com");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const { registerUser } = useContext(AuthContext);

  const handleSubmit = async e => {
    e.preventDefault()
    registerUser(firstname, surname, email, username, password, password2)
  };

  return (
    <div className="container">
      <h1>Register</h1>
      <div style={{margin: '3rem auto', maxWidth: '500px'}}>
        <div style={{textAlign: 'left'}}>
          <form onSubmit={handleSubmit}>
            <p className="form-label"><label>Firstname</label></p>
            <div style={{display: 'flex'}}>
              <input className='round-input' type='text' name='firstname' required placeholder="Enter Firstname" value={'Brian'} onChange={e => setFirstname(e.target.value)}/>
            </div>
            <p className="form-label"><label>Surname</label></p>
            <div style={{display: 'flex'}}>
              <input className='round-input' type='text' name='surname' required placeholder="Enter Surname" value={'Mobsy'} onChange={e => setSurname(e.target.value)}/>
            </div>
            <p className="form-label"><label>Email</label></p>
            <div style={{display: 'flex'}}>
              <input className='round-input' type='email' name='email' required placeholder="Enter Email" value={'brian@brian.com'} onChange={e => setEmail(e.target.value)}/>
            </div>
            <p className="form-label"><label>Username</label></p>
            <div style={{display: 'flex'}}>
              <input className='round-input' type='text' name='username' required placeholder="Enter Username" onChange={e => setUsername(e.target.value)}/>
            </div>
            <p className="form-label"><label htmlFor="password">Password</label></p>
            <div style={{display: 'flex'}}>
              <input className='round-input' type='password' name='password' required placeholder="Enter Password" onChange={e => setPassword(e.target.value)}/>
            </div>
            <p className="form-label"><label>Confirm Password</label></p>
            <div style={{display: 'flex'}}>
              <input className='round-input' type="password" id="confirm-password" required placeholder="Enter Password" onChange={e => setPassword2(e.target.value)}/>
            </div>
            <p style={{marginTop: '2rem', textAlign: 'center'}}><input className='round-button-form' type='submit' value='Register'/></p>
            <p>{password2 !== password ? "Passwords do not match" : ""}</p>
          </form>
          <p style={{ marginTop: '3rem', textAlign: 'center'}}>
            <Link to={`../login`} style={{color: 'black'}}>
              <span>Go to Login</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register