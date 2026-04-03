import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header/Header';
import LandingPage from './pages/LandingPage/LandingPage';
import PhotoAlbumPage from './pages/PhotoAlbumPage/PhotoAlbumPage';
import FamilyTreePage from './pages/FamilyTreePage/FamilyTreePage';
import Footer from './components/common/Footer/Footer';
import ScrollToTop from '@/components/common/ScrollToTop/ScrollToTop';

const App = () => {
    return (
        <Router
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}
        >
            <ScrollToTop />
            <Header />
            <Routes>
                <Route path='/' element={<LandingPage />} />
                <Route path='/photo-album' element={<PhotoAlbumPage />} />
                <Route path='/family-tree' element={<FamilyTreePage />} />
            </Routes>
            <Footer />
        </Router>
    );
};

export default App;
