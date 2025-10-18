// client/src/App.js
import React, { useState, useEffect } from 'react';
import './App.css'; 
import axios from 'axios';

// Import components from React-Bootstrap
import { Navbar, Container, Nav, Button, Row, Col, Card, Form, Alert, ListGroup } from 'react-bootstrap';

// Import icons from react-icons
import { BsCheckCircleFill, BsCalendarFill, BsChatFill, BsGearFill, BsStarFill } from 'react-icons/bs'; 

// --- Global API URL (replace with your local backend URL) ---
const API_URL = 'http://localhost:5000/api/profiles'; // Make sure your server is running here

// --- 1. Navbar Component ---
const AppNavbar = () => {
  return (
    <Navbar bg="white" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand href="#home" className="fw-bold text-primary">
          MyComplex Helper
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            <Button variant="light" className="me-2">Log In</Button>
            <Button variant="primary">Sign Up</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

// --- 2. Hero Section Component ---
const HeroSection = ({ onSearch }) => { 
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault(); 
    onSearch(searchTerm); 
  };
  
  return (
    <Container className="text-center my-5 py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <h1 className="display-3 fw-bold text-secondary">MyComplex Helper</h1>
          <h2 className="display-6 text-primary fw-semibold">Connecting Communities</h2>
          <p className="lead text-body my-4">
            A next-generation mobile platform connecting house help professionals,
            residents, and society management within residential complexes.
          </p>

          <Row className="justify-content-center my-4">
            <Col md={8} lg={6}>
              <Form className="d-flex" onSubmit={handleSearch}>
                <Form.Control
                  type="search"
                  placeholder="Search by name or service (e.g., Cook, Maid)..."
                  className="me-2 py-2"
                  aria-label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
                <Button variant="primary" className="px-4" type="submit">Search</Button>
              </Form>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

// --- 3. Features Section Component ---
const FeaturesSection = () => {
  const features = [
    {
      icon: <BsCheckCircleFill size={30} className="text-primary" />,
      title: 'Verified Profiles',
      text: 'All professionals are verified by the RWA for your safety.',
    },
    {
      icon: <BsCalendarFill size={30} className="text-primary" />,
      title: 'Easy Scheduling',
      text: 'Book services instantly with a simple availability calendar.',
    },
    {
      icon: <BsChatFill size={30} className="text-primary" />,
      title: 'Direct Communication',
      text: 'Chat directly with house help to manage tasks.',
    },
    {
      icon: <BsGearFill size={30} className="text-primary" />,
      title: 'RWA Integration',
      text: 'Fully integrated with society security and management.',
    },
  ];

  return (
    <div className="bg-light-blue py-5">
      <Container>
        <Row className="g-4">
          {features.map((feature, index) => (
            <Col md={6} lg={3} key={index}>
              <Card className="h-100 shadow-sm border-0 p-3">
                <Card.Body>
                  <div className="mb-3">{feature.icon}</div>
                  <Card.Title as="h3" className="fw-bold text-secondary h5">
                    {feature.title}
                  </Card.Title>
                  <Card.Text className="text-body">{feature.text}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

// --- 4. Search Results Component (The new, correct list view) ---
const SearchResults = ({ results }) => {
  if (!results) return null;

  if (results.length === 0) {
    return (
      <Container className="my-5">
        <Alert variant="info">No profiles found matching your search.</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2 className="mb-4 text-secondary">Search Results ({results.length})</h2>
      <ListGroup>
        {results.map((profile) => (
          <ListGroup.Item key={profile.id} className="d-flex justify-content-between align-items-center flex-wrap">
            
            {/* Left Side: Photo, Name, Job */}
            <div className="d-flex align-items-center me-3 mb-2 mb-md-0">
              <img
                src={profile.photo_url || 'https://via.placeholder.com/60'}
                alt={profile.name}
                style={{ width: '60px', height: '60px', borderRadius: '50%', marginRight: '15px' }}
              />
              <div>
                <h5 className="mb-0 fw-bold text-secondary">
                  {profile.name} {profile.is_verified && <BsCheckCircleFill className="text-success ms-1" title="Verified"/>}
                </h5>
                <p className="mb-0 text-muted">{profile.service}</p>
              </div>
            </div>
            
            {/* Right Side: Price, Rating, Button */}
            <div className="text-end">
                {/* DISPLAY BASE PRICE */}
                {profile.base_price && (
                    <h5 className="text-success fw-bold mb-1">
                        ₹{profile.base_price.toLocaleString('en-IN')}
                        <small className="text-muted ms-1 fw-normal">/ month (est.)</small>
                    </h5>
                )}

               <div className="mb-2">
                 {profile.average_rating > 0 ? (
                    <span className="text-warning fw-bold">
                      <BsStarFill style={{ marginBottom: '4px' }}/> {profile.average_rating.toFixed(1)}
                    </span>
                 ) : (
                    <span className="text-muted">No rating</span>
                 )}
                 <small className="text-muted ms-1">({profile.rating_count || 0} reviews)</small>
               </div>
               <Button variant="primary" size="sm">Invite for ₹50</Button>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

// --- 5. Main App (Contains all state and logic) ---
function App() {
  const [allProfiles, setAllProfiles] = useState([]); // Store all profiles fetched
  const [searchResults, setSearchResults] = useState(null); // Store filtered results, null initially
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all profiles on initial load
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get(API_URL);
        setAllProfiles(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error("Error fetching profiles:", err);
      }
    };
    fetchProfiles();
  }, []);

  // Function to filter profiles based on search term
  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setSearchResults(null); // Show features section if search term is empty
      return;
    }
    const lowerCaseTerm = searchTerm.toLowerCase();
    const filtered = allProfiles.filter(profile =>
      (profile.name && profile.name.toLowerCase().includes(lowerCaseTerm)) ||
      (profile.service && profile.service.toLowerCase().includes(lowerCaseTerm))
    );
    setSearchResults(filtered);
  };

  if (loading) return <Container className="text-center my-5"><p>Loading profiles...</p></Container>;
  if (error) return <Container className="text-center my-5"><Alert variant="danger">Error: {error}</Alert></Container>;

  return (
    <div>
      <AppNavbar />
      <HeroSection onSearch={handleSearch} /> {/* Pass the search handler down */}
      
      {/* Conditionally render SearchResults OR FeaturesSection */}
      {searchResults !== null ? (
         <SearchResults results={searchResults} />
      ) : (
         <FeaturesSection />
      )}
    </div>
  );
}

export default App;