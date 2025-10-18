import React from 'react';

/**
 * Reusable component to display status messages using Bootstrap alerts.
 * @param {string} message - The text message to display.
 * @param {string} type - The alert type: 'success', 'danger', 'info', or 'warning'.
 */
const NotificationBox = ({ message, type = 'info' }) => {
    // Return null if there is no message to display
    if (!message) {
        return null;
    }

    // Determine the Bootstrap class based on the 'type' prop
    const alertClass = `alert alert-${type} mt-3 mb-3 text-center`;

    return (
        <div className="row justify-content-center">
            <div className="col-md-10">
                <div className={alertClass} role="alert">
                    {message}
                </div>
            </div>
        </div>
    );
};

export default NotificationBox;