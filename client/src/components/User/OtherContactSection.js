// import React, { useState, useRef, useContext, useEffect } from 'react';
// import './Profile.css'; 
// import config from '../../config';
// import { PartnerContext } from '../../contexts/PartnerContext'; 

// const OtherContactsSection = ({ partnerId }) => {
//   const [editMode, setEditMode] = useState(false);
//   const [contactDetails, setContactDetails] = useState({
//     email: [],
//     phoneNumbers: [],
//     faxNumbers: []
//   });
//   const [error, setError] = useState(null); // State for error handling
//   const sectionRef = useRef(null);
//   const { updateContactDetails } = useContext(PartnerContext);

//   useEffect(() => {
//     const fetchContactDetails = async () => {
//       try {
//         const response = await fetch(`${config.backendUrl}/api/contacts/${partnerId}`);
//         if (!response.ok) {
//           if (response.status === 404) {
//             // If 404, initialize with default values
//             setContactDetails({
//               email: ['', '', ''],
//               phoneNumbers: ['', '', ''],
//               faxNumbers: ['', '', '']
//             });
//             setError('No contact details found. You can add new details.');
//             return;
//           } else {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//           }
//         }
//         const data = await response.json();
//         console.log('Fetched contact details:', data); // Log the data to verify

//         // Ensure each field has exactly 3 entries
//         setContactDetails({
//           email: (data.email || []).concat(Array(3).fill('')).slice(0, 3),
//           phoneNumbers: (data.phoneNumbers || []).concat(Array(3).fill('')).slice(0, 3),
//           faxNumbers: (data.faxNumbers || []).concat(Array(3).fill('')).slice(0, 3),
//         });
//       } catch (error) {
//         console.error('Error fetching contact details:', error);
//         setError('Error fetching contact details. Please try again later.');
//       }
//     };

//     fetchContactDetails();
//   }, [partnerId]);

//   const toggleEditSection = () => {
//     setEditMode(!editMode);
    
//     if (!editMode) {
//       // Ensure each field has exactly 3 entries when entering edit mode
//       setContactDetails(prevDetails => ({
//         email: (prevDetails.email || []).concat(Array(3).fill('')).slice(0, 3),
//         phoneNumbers: (prevDetails.phoneNumbers || []).concat(Array(3).fill('')).slice(0, 3),
//         faxNumbers: (prevDetails.faxNumbers || []).concat(Array(3).fill('')).slice(0, 3),
//       }));
//     }
//   };

//   const saveSection = async () => {
//     setEditMode(false);
//     const inputs = sectionRef.current.querySelectorAll('input');
//     const updatedData = Array.from(inputs).reduce((acc, input) => {
//       if (input.name) {
//         if (!acc[input.name]) acc[input.name] = [];
//         if (input.value.trim()) { // Only add non-empty values
//           acc[input.name].push(input.value.trim());
//         }
//       }
//       return acc;
//     }, {});
  
//     // Filter out empty fields on the frontend as well
//     Object.keys(updatedData).forEach((key) => {
//       if (updatedData[key].length === 0) {
//         delete updatedData[key];
//       }
//     });
  
//     try {
//       const contactResponse = await fetch(`${config.backendUrl}/api/contacts/${partnerId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(updatedData),
//       });
//       if (!contactResponse.ok) {
//         throw new Error(`HTTP error! Status: ${contactResponse.status}`);
//       }
//       const contactData = await contactResponse.json();
//       console.log('Contact response:', contactData); // Log the response to verify
  
//       // Update the contact state in the context
//       updateContactDetails(updatedData);
  
//     } catch (error) {
//       console.error('Error updating contact:', error);
//     }
//   };
  
//   return (
//     <div className="other_contacts_div account_details" id="otherContactsSection" ref={sectionRef}>

//       <h3 className="other_contacts_title other_titles">OTHER CONTACTS</h3>

//       {error && <p className="error-message">{error}</p>}
//       <div className="other_contact_grid">

//         {['Email', 'Phone Number', 'FAX'].map((contactType) => (
//           <div className="other_contacts" key={contactType}>

//             <h4 className="other_titles other_sub_titles">{contactType}</h4>

//             <div className="other_contact_list">

//               <ul className="other_ul">
//                 {(contactType === 'Email' ? contactDetails.email :
//                   contactType === 'Phone Number' ? contactDetails.phoneNumbers :
//                   contactType === 'FAX' ? contactDetails.faxNumbers : []
//                 ).map((detail, index) => (

//                   <li className="other_li" key={index}>

//                     <input
//                       type="text"
//                       name={contactType === 'Email' ? 'email' : contactType === 'Phone Number' ? 'phoneNumbers' : 'faxNumbers'} 
//                       defaultValue={detail}
//                       disabled={!editMode}
//                       className='other_contact_phone'
//                     />

//                   </li>
//                 ))}

//               </ul>
//             </div>

//           </div>

//         ))}
//       </div>
      
//       <button
//         className="editButton contactNumBtn"
//         onClick={toggleEditSection}
//         style={{ display: editMode ? 'none' : 'inline-block' }}
//       >
//         {contactDetails.email.length === 0 && contactDetails.phoneNumbers.length === 0 && contactDetails.faxNumbers.length === 0 ? 'Add' : 'Edit'}
//       </button>

//       <button
//         className="saveButton contactNumBtn"
//         style={{ display: editMode ? 'inline-block' : 'none' }}
//         onClick={saveSection}
//       >
//         Save
//       </button>

//     </div>
//   );
// };

// export default OtherContactsSection;
import React, { useState, useRef, useContext, useEffect } from 'react';
import './Profile.css'; 
import config from '../../config';
import { PartnerContext } from '../../contexts/PartnerContext'; 

const OtherContactsSection = ({ partnerId }) => {
  const [editMode, setEditMode] = useState(false);
  const [contactDetails, setContactDetails] = useState({
    email: [],
    phoneNumbers: [],
    faxNumbers: []
  });
  const [error, setError] = useState(null); // State for error handling
  const sectionRef = useRef(null);
  const { updateContactDetails } = useContext(PartnerContext);

  useEffect(() => {
    const fetchContactDetails = async () => {
      try {
        const response = await fetch(`${config.backendUrl}/api/contacts/${partnerId}`);
        if (!response.ok) {
          if (response.status === 404) {
            // If 404, initialize with default values
            setContactDetails({
              email: ['', '', ''],
              phoneNumbers: ['', '', ''],
              faxNumbers: ['', '', '']
            });
            setError('No contact details found. You can add new details.');
            return;
          } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        }
        const data = await response.json();
        console.log('Fetched contact details:', data); // Log the data to verify

        // Ensure each field has exactly 3 entries
        setContactDetails({
          email: (data.email || []).concat(Array(3).fill('')).slice(0, 3),
          phoneNumbers: (data.phoneNumbers || []).concat(Array(3).fill('')).slice(0, 3),
          faxNumbers: (data.faxNumbers || []).concat(Array(3).fill('')).slice(0, 3),
        });
      } catch (error) {
        console.error('Error fetching contact details:', error);
        setError('Error fetching contact details. Please try again later.');
      }
    };

    // Fetch data on mount and persist state on refresh
    fetchContactDetails();
  }, [partnerId]);

  const toggleEditSection = () => {
    setEditMode(!editMode);
    
    if (!editMode) {
      // Ensure each field has exactly 3 entries when entering edit mode
      setContactDetails(prevDetails => ({
        email: (prevDetails.email || []).concat(Array(3).fill('')).slice(0, 3),
        phoneNumbers: (prevDetails.phoneNumbers || []).concat(Array(3).fill('')).slice(0, 3),
        faxNumbers: (prevDetails.faxNumbers || []).concat(Array(3).fill('')).slice(0, 3),
      }));
    }
  };

  const saveSection = async () => {
    setEditMode(false);
    const inputs = sectionRef.current.querySelectorAll('input');
    const updatedData = Array.from(inputs).reduce((acc, input) => {
      if (input.name) {
        if (!acc[input.name]) acc[input.name] = [];
        if (input.value.trim()) { // Only add non-empty values
          acc[input.name].push(input.value.trim());
        }
      }
      return acc;
    }, {});

    // Filter out empty fields on the frontend as well
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key].length === 0) {
        delete updatedData[key];
      }
    });

    try {
      const contactResponse = await fetch(`${config.backendUrl}/api/contacts/${partnerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (!contactResponse.ok) {
        throw new Error(`HTTP error! Status: ${contactResponse.status}`);
      }
      const contactData = await contactResponse.json();
      console.log('Contact response:', contactData); // Log the response to verify

      // Update the contact state in the context
      updateContactDetails(updatedData);

    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };
  
  return (
    <div className="other_contacts_div account_details" id="otherContactsSection" ref={sectionRef}>

      <h3 className="other_contacts_title other_titles">OTHER CONTACTS</h3>

      {error && <p className="error-message">{error}</p>}
      <div className="other_contact_grid">

        {['Email', 'Phone Number', 'FAX'].map((contactType) => (
          <div className="other_contacts" key={contactType}>

            <h4 className="other_titles other_sub_titles">{contactType}</h4>

            <div className="other_contact_list">

              <ul className="other_ul">
                {(contactType === 'Email' ? contactDetails.email :
                  contactType === 'Phone Number' ? contactDetails.phoneNumbers :
                  contactType === 'FAX' ? contactDetails.faxNumbers : []
                ).map((detail, index) => (

                  <li className="other_li" key={index}>

                    <input
                      type="text"
                      name={contactType === 'Email' ? 'email' : contactType === 'Phone Number' ? 'phoneNumbers' : 'faxNumbers'} 
                      defaultValue={detail}
                      disabled={!editMode}
                      className='other_contact_phone'
                    />

                  </li>
                ))}

              </ul>
            </div>

          </div>

        ))}
      </div>
      
      <button
        className="editButton contactNumBtn"
        onClick={toggleEditSection}
        style={{ display: editMode ? 'none' : 'inline-block' }}
      >
        {contactDetails.email.length === 0 && contactDetails.phoneNumbers.length === 0 && contactDetails.faxNumbers.length === 0 ? 'Add' : 'Edit'}
      </button>

      <button
        className="saveButton contactNumBtn"
        style={{ display: editMode ? 'inline-block' : 'none' }}
        onClick={saveSection}
      >
        Save
      </button>

    </div>
  );
};

export default OtherContactsSection;
