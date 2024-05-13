import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import PrivateRoute from './utils/PrivateRoute'
import { AuthProvider } from './context/Auth';

import Home from './pages/Home';
import Login from './pages/authentication/Login';
import Profile from './pages/Profile';
import MyBooks from './pages/MyBooks';
import Discover from './pages/Discover';
import Book from './pages/Book';
import Register from './pages/authentication/Register';


function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Routes>
            <Route path='/register' element={<Register/>} />
            <Route path='/login' element={<Login/>} />
            <Route exact path='/' element={<PrivateRoute><Home/></PrivateRoute>} />
            <Route exact path='/mybooks' element={<PrivateRoute><MyBooks/></PrivateRoute>} />
            <Route exact path='/discover' element={<PrivateRoute><Discover/></PrivateRoute>} />
            <Route exact path='/book/:id' element={<PrivateRoute><Book/></PrivateRoute>} />
            <Route exact path='/profile/:username' element={<PrivateRoute><Profile/></PrivateRoute>} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  )
}

export default App;
