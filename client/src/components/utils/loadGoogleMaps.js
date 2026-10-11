// export const loadGoogleMapsScript = () => {
//     return new Promise((resolve, reject) => {
//         if (typeof window.google === 'object' && typeof window.google.maps === 'object') {
//             // Already loaded
//             resolve();
//             return;
//         }

//         const script = document.createElement('script');
//         script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_API_KEY}`;
//         script.async = true;
//         script.defer = true;
//         script.onload = () => resolve();
//         script.onerror = (err) => reject(err);
//         document.head.appendChild(script);
//     });
// };

export const loadGoogleMapsScript = () => {
    return new Promise((resolve, reject) => {
        if (
            typeof window.google === 'object' &&
            typeof window.google.maps === 'object'
        ) {
            resolve();
            return;
        }

        // Reuse an existing script if another component is loading Maps.
        const existingScript = document.querySelector(
            'script[data-google-maps-loader="true"]'
        );

        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(), { once: true });
            existingScript.addEventListener('error', reject, { once: true });
            return;
        }

        const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;

        if (!apiKey) {
            reject(new Error('Missing REACT_APP_GOOGLE_API_KEY environment variable'));
            return;
        }

        const script = document.createElement('script');
        script.dataset.googleMapsLoader = 'true';
        script.src =
            `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Maps'));
        document.head.appendChild(script);
    });
};