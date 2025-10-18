import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- HELPER FUNCTIONS (Outside Component) ---

// 1. DYNAMIC PRICING MODEL: Calculates wage based on worker's rating
const calculateBasePrice = (rating) => {
    const MIN_BASE_PRICE = 8000; // Base rate for a 1-star worker
    const PREMIUM_AMOUNT = 4000; // Premium added for 5 stars
    
    // Normalize rating (e.g., a 4.0 rating is 80% of the premium)
    const premiumFactor = Math.max(0, rating) / 5; 
    
    // Calculate final price, rounded to the nearest whole number
    const finalPrice = MIN_BASE_PRICE + (premiumFactor * PREMIUM_AMOUNT);
    
    return Math.round(finalPrice);
};

// 2. STAR RATING DISPLAY: Converts a numerical rating into star icons
const renderStars = (rating) => {
    // Round rating to the nearest half star
    const roundedRating = Math.round(rating * 2) / 2;
    const fullStars = Math.floor(roundedRating);
    const hasHalfStar = roundedRating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <>
            {Array(fullStars).fill(0).map((_, i) => <span key={`full-${i}`} className="text-warning">★</span>)}
            {hasHalfStar && <span className="text-warning">½</span>}
            {Array(emptyStars).fill(0).map((_, i) => <span key={`empty-${i}`} className="text-muted">★</span>)}
        </>
    );
};


const JobList = ({ isHouseHelpView = false }) => {
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // State for search bar
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data and apply initial sorting
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                // GET request to fetch all jobs
                const response = await axios.get('/api/jobs'); 
                
                // Sort the data received from the backend (highest rating first)
                const sortedJobs = response.data.sort((a, b) => {
                    const ratingA = a.workerRating || 0; 
                    const ratingB = b.workerRating || 0; 
                    return ratingB - ratingA; // Sort descending
                });

                setJobs(sortedJobs);
                setError(null);
            } catch (err) {
                console.error('Error fetching jobs:', err);
                setError('Could not load job listings. Ensure backend is running.');
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []); 

    // Filter jobs based on search term
    const filteredAndSortedJobs = jobs
        .filter(job => 
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            job.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.workerName.toLowerCase().includes(searchTerm.toLowerCase())
        );

    // Mock 'Invite' function
    const handleInvite = (workerId, jobTitle) => {
        alert(`INVITE SENT to Worker ID ${workerId} for job: ${jobTitle}. (Backend POST /api/invites required)`);
    };

    // --- Conditional Rendering ---
    if (loading) return <h2 className="text-center text-info mt-5">Loading job listings...</h2>;
    if (error) return <h2 className="text-center text-danger mt-5">Error: {error}</h2>;
    
    // If jobs are loaded but filter yields nothing:
    if (jobs.length > 0 && filteredAndSortedJobs.length === 0) {
        return <h2 className="text-center text-secondary mt-5">No workers match your search criteria.</h2>;
    }
    // If no jobs were fetched at all:
    if (jobs.length === 0) return <h2 className="text-center text-secondary mt-5">No jobs posted yet.</h2>;


    return (
        <div className="container mt-4">
            <h3 className="text-center text-info mb-4">
                Available Job Listings (Sorted by Top Rated)
            </h3>
            
            {/* === SEARCH BAR (New Feature) === */}
            <div className="row justify-content-center mb-4">
                <div className="col-md-8">
                    <input
                        type="text"
                        className="form-control form-control-lg shadow-sm"
                        placeholder="Search by worker name, service type, or job title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} // Update search state on input
                    />
                </div>
            </div>
            
            <div className="row justify-content-center"> 
                
                {filteredAndSortedJobs.map((job) => {
                    // Calculate the dynamic price based on the worker's rating
                    const currentWorkerRating = job.workerRating || 1; 
                    const dynamicBasePrice = calculateBasePrice(currentWorkerRating);

                    return (
                        <div className="col-md-6 mb-4" key={job._id}> 
                            <div className="card shadow-lg border-2 border-primary">
                                <div className="card-body p-4">
                                    
                                    {/* === PROFILE BAR (Insta-Style Top Section) === */}
                                    <div className="d-flex align-items-center mb-3 border-bottom pb-3">
                                        <div className="rounded-circle bg-light me-3 p-2" style={{ width: '50px', height: '50px', lineHeight: '30px', textAlign: 'center', fontSize: '24px' }}>
                                            👷
                                        </div>
                                        <div className="flex-grow-1">
                                            <h5 className="mb-0 fw-bold text-dark">{job.workerName || 'Verified Worker'}</h5>
                                            
                                            {/* Star Rating Display */}
                                            <div className="small">
                                                {renderStars(currentWorkerRating)} 
                                                <span className="ms-1 text-muted">({job.workerRatingCount || 0} reviews)</span>
                                            </div>
                                        </div>
                                        
                                        {/* Worker Type Badge */}
                                        <span className="badge bg-info text-dark p-2">
                                            {job.serviceType}
                                        </span>
                                    </div>

                                    {/* === JOB DETAILS & PRICE === */}
                                    <div className="p-2">
                                        <h6 className="card-subtitle mb-2 text-primary">Job: {job.title}</h6>
                                        <p className="card-text text-muted small">{job.description}</p>
                                        
                                        {/* Dynamic Base Price */}
                                        <h5 className="text-center text-secondary mt-3">
                                            Monthly Wage: <span className="text-success fw-bolder">₹{dynamicBasePrice}</span>
                                        </h5>
                                    </div>
                                    
                                    {/* === ACTION BUTTON (INVITE) === */}
                                    <div className="d-grid mt-3">
                                        {isHouseHelpView && (
                                            <button 
                                                onClick={() => handleInvite(job.workerId || 'WORKER_ID_PLACEHOLDER', job.title)} 
                                                className="btn btn-primary btn-lg shadow" 
                                            >
                                                Invite & Discuss Job
                                            </button>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default JobList;