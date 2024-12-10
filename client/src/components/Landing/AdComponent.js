import React from "react";
import PropTypes from "prop-types";
import './AdComponent.css';

// Helper function to determine video source type
const getVideoEmbedUrl = (url) => {
  // Check for YouTube URL
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0] || url.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Check for Vimeo URL
  if (url.includes("vimeo.com")) {
    const videoId = url.split("vimeo.com/")[1];
    return `https://player.vimeo.com/video/${videoId}`;
  }

  // Default to <video> tag if URL is a direct video file (mp4)
  return url;
};

// AdComponent handles both video and flyer (image or video) adverts.
const AdComponent = ({ type, content, altText, link, heading, description, width }) => {
  return (
    <div className="ad-component" style={{ width }}>
      {/* Optional Heading */}
      {heading && <h2 className="ad-heading">{heading}</h2>}

      {/* Optional Description */}
      {description && <p className="ad-description">{description}</p>}

      {/* Render Video Ad */}
      {type === "video" && (
        <div className="video-ad-container">
          {content.includes("youtube.com") || content.includes("youtu.be") || content.includes("vimeo.com") ? (
            <iframe
              width="100%"
              height="auto"
              src={getVideoEmbedUrl(content)}
              title="Ad Video"
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <video width="100%" height="auto" controls autoPlay loop>
              <source src={content} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
       
         
        </div>
      )}

      {/* Render Flyer Ad */}
      {type === "flyer" && (
        <div className="flyer-ad-container">
          {content.endsWith(".mp4") ? (
            <video width="100%" height="auto" autoPlay loop muted>
              <source src={content} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <a href={link} target="_blank" rel="noopener noreferrer">
              <img src={content} alt={altText} className="flyer-ad-image" />
            </a>
          )}
          {/* CTA Button for Flyer */}
          <div className="ad-cta">
            <a href={link} target="_blank" rel="noopener noreferrer" className="cta-button">
              Learn More
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

// PropTypes for type safety
AdComponent.propTypes = {
  type: PropTypes.oneOf(["video", "flyer"]).isRequired, // Advert type (video or flyer)
  content: PropTypes.string.isRequired, // Video URL or Image URL
  altText: PropTypes.string, // For flyer ads (optional)
  link: PropTypes.string.isRequired, // Link to where users can go for more info
  heading: PropTypes.string, // Heading for the advert (optional)
  description: PropTypes.string, // Description for the advert (optional)
  width: PropTypes.string, // Custom width for the ad component (optional)
};

export default AdComponent;


// import React from "react";
// import PropTypes from "prop-types";
// import './AdComponent.css';

// // Helper function to determine video source type
// const getVideoEmbedUrl = (url) => {
//   // Check for YouTube URL
//   if (url.includes("youtube.com") || url.includes("youtu.be")) {
//     const videoId = url.split("youtu.be/")[1]?.split("?")[0] || url.split("v=")[1]?.split("&")[0];
//     return `https://www.youtube.com/embed/${videoId}`;
//   }
  
//   // Check for Vimeo URL
//   if (url.includes("vimeo.com")) {
//     const videoId = url.split("vimeo.com/")[1];
//     return `https://player.vimeo.com/video/${videoId}`;
//   }

//   // Default to <video> tag if URL is a direct video file (mp4)
//   return url;
// };

// // AdComponent will handle both video and flyer (image or video) adverts.
// const AdComponent = ({ type, content, altText, link, heading, description }) => {
//   return (
//     <div className="ad-component">
//       {heading && <h2 className="ad-heading">{heading}</h2>}
//       {description && <p className="ad-description">{description}</p>}
      
//       {type === "video" ? (
//         <div className="video-ad-container">
//           {/* Check if content is a video file or URL, and display accordingly */}
//           {content.includes("youtube.com") || content.includes("youtu.be") || content.includes("vimeo.com") ? (
//             <iframe
//               width="100%"
//               height="auto"
//               src={getVideoEmbedUrl(content)}
//               title="Ad Video"
//               frameBorder="0"
//               allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
//               allowFullScreen
//             ></iframe>
//           ) : (
//             <video width="100%" height="auto" controls autoPlay loop>
//               <source src={content} type="video/mp4" />
//               Your browser does not support the video tag.
//             </video>
//           )}
//         </div>
//       ) : type === "flyer" ? (
//         <div className="flyer-ad-container">
//           {content.endsWith(".mp4") ? (
//             // Animated flyer (MP4)
//             <video width="100%" height="auto" autoPlay loop muted>
//               <source src={content} type="video/mp4" />
//               Your browser does not support the video tag.
//             </video>
//           ) : (
//             // Static flyer (image)
//             <a href={link} target="_blank" rel="noopener noreferrer">
//               <img src={content} alt={altText} className="flyer-ad-image" />
//             </a>
//           )}
//         </div>
//       ) : null}

//       {/* Optional: You can add a call-to-action (CTA) button */}
//       <div className="ad-cta">
//         <a href={link} target="_blank" rel="noopener noreferrer" className="cta-button">
//           Learn More
//         </a>
//       </div>
//     </div>
//   );
// };

// // PropTypes for type safety
// AdComponent.propTypes = {
//   type: PropTypes.oneOf(["video", "flyer"]).isRequired, // Advert type (video or flyer)
//   content: PropTypes.string.isRequired, // Video URL or Image URL
//   altText: PropTypes.string, // For flyer ads (optional)
//   link: PropTypes.string.isRequired, // Link to where users can go for more info
//   heading: PropTypes.string, // Heading for the advert (optional)
//   description: PropTypes.string, // Description for the advert (optional)
// };

// export default AdComponent;
