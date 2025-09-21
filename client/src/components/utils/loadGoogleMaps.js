export const loadGoogleMapsScript = () => {
    return new Promise((resolve, reject) => {
        if (typeof window.google === 'object' && typeof window.google.maps === 'object') {
            // Already loaded
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_API_KEY}`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
    });
};