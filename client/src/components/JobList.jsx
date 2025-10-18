import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- HELPER FUNCTIONS (Outside Component) ---

// 1. DYNAMIC PRICING MODEL: Calculates wage based on worker's rating
const calculateBasePrice = (rating) => {
    const MIN_BASE_PRICE = 8000; 
    const PREMIUM_AMOUNT = 4000; 
    
    // Calculate final price, rounded to the nearest whole number
    const premiumFactor = Math.max(0, rating) / 5; 
    const finalPrice = MIN_BASE_PRICE + (premiumFactor * PREMIUM_AMOUNT);
    
    return Math.round(finalPrice);
};

// 2. STAR RATING DISPLAY: Converts a numerical rating into star icons
const renderStars = (rating) => {
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
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // States for Secure Invite Flow
    const [disclosedContact, setDisclosedContact] = useState({}); // Stores {jobId: "1234567890"}
    const [inviteStatus, setInviteStatus] = useState({}); // Stores {jobId: "SENT" / "ACCEPTED"}


    // Fetch data and apply initial sorting
    useEffect(() => {
        const fetchJobs = async () => {
            try {
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
            (job.workerName && job.workerName.toLowerCase().includes(searchTerm.toLowerCase()))
        );

    // Mock 'Invite' function (Secure Flow Handler)
    const handleInvite = async (workerId, jobId) => {
        // Phase 1: Send the initial invite request to the backend
        try {
            // NOTE: workerId/residentId placeholders are sent to the backend
            const inviteResponse = await axios.post('/api/invites', { workerId, residentId: 'RESIDENT_123', jobId });
            
            setInviteStatus(prev => ({ ...prev, [jobId]: 'SENT' }));
            
            // Phase 2: Simulate fetching contact status based on response
            // We assume the backend immediately confirms acceptance for this MVP demo:
            const mobileNumber = inviteResponse.data.workerMobile || '9988776655'; 

            if (mobileNumber) {
                // Success: Worker accepted - Disclose Number
                setDisclosedContact(prev => ({ ...prev, [jobId]: mobileNumber }));
                setInviteStatus(prev => ({ ...prev, [jobId]: 'ACCEPTED' }));
                alert(`Invite SUCCESSFUL! Worker ACCEPTED. Mobile: ${mobileNumber}`);
            } else {
                setInviteStatus(prev => ({ ...prev, [jobId]: 'PENDING' }));
            }

        } catch (error) {
            console.error('Invite Error:', error);
            alert('Could not send invite or verify acceptance.');
        }
    };

    // --- Conditional Rendering ---
    if (loading) return <h2 className="text-center text-info mt-5">Loading job listings...</h2>;
    if (error) return <h2 className="text-center text-danger mt-5">Error: {error}</h2>;
    
    if (jobs.length > 0 && filteredAndSortedJobs.length === 0) {
        return <h2 className="text-center text-secondary mt-5">No workers match your search criteria.</h2>;
    }
    if (jobs.length === 0) return <h2 className="text-center text-secondary mt-5">No jobs posted yet.</h2>;


    return (
        <div className="container mt-4">
            <h3 className="text-center text-info mb-4">
                Available Job Listings (Sorted by Top Rated)
            </h3>
            
            {/* === SEARCH BAR === */}
            <div className="row justify-content-center mb-4">
                <div className="col-md-8">
                    <input
                        type="text"
                        className="form-control form-control-lg shadow-sm"
                        placeholder="Search by worker name, service type, or job title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
            </div>
            
            <div className="row justify-content-center"> 
                
                {filteredAndSortedJobs.map((job) => {
                    // Calculate dynamic price and look up current contact status
                    const currentWorkerRating = job.workerRating || 1; 
                    const dynamicBasePrice = calculateBasePrice(currentWorkerRating);
                    const mobileNumber = disclosedContact[job.jobId];
                    const status = inviteStatus[job.jobId] || 'NONE'; 

                    return (
                        <div className="col-md-6 mb-4" key={job._id}> 
                            <div className="card shadow-lg border-2 border-primary">
                                <div className="card-body p-4">
                                    
                                    {/* === PROFILE BAR (Top Section) === */}
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
                                    
                                    {/* === ACTION BUTTON (CONDITIONAL INVITE) === */}
                                    <div className="d-grid mt-3">
                                        {mobileNumber ? (
                                            // State 3: Show phone number if disclosed
                                            <div className="alert alert-success fw-bold text-center p-2">
                                                📞 Contact: {mobileNumber}
                                            </div>
                                        ) : status === 'SENT' || status === 'PENDING' ? (
                                             // State 2: Show pending status
                                             <button disabled className="btn btn-warning">
                                                 Invitation Sent (Awaiting Acceptance...)
                                             </button>
                                        ) : (
                                             // State 1: Show initial invite button
                                             <button 
                                                 onClick={() => handleInvite(job.workerId || job._id, job._id)} 
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