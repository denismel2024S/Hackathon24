import React from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export function Reset() {
    const handleClear = () => {
        MySwal.fire({
            title: 'Confirm Sign Out',
            text: 'Are you sure you want to sign out?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, sign out',
            heightAuto: false        // Prevent adjusting the body's height
            
        }).then((result) => {
            if (result.isConfirmed) {
                // Clear localStorage and reload the page
                window.localStorage.clear();
                window.location.reload();
            }
        });
    };

    return (
        <button className="resetButton" onClick={handleClear}>
            Sign Out
        </button>
    );
}
