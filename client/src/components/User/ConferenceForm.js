import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import './Profile.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';
import { Table } from 'react-bootstrap';
import EditModalConference from './EditModalConference';


const ConferenceForm = ({ partner }) => {
  const [formData, setFormData] = useState({
    partnerId: partner._id,
    venueName: '',
    address: '',
    gpsCoordinates: '',
    seatingCapacity: '',
    layoutOptions: '',
    pricingStructure: '',
    contactPerson: '',
    phoneNumber: '',
    emailAddress: ''
  });

  const [files, setFiles] = useState({
    venueImages: [],
    videoTours: [],
    floorPlans: []
  });

  const [showModal, setShowModal] = useState(false);
  const [conferences, setConferences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingConference, setEditingConference] = useState(null);
  const [currentEditedConference, setCurrentEditedConference] = useState(null);

  // const { conferences, isLoading, error } = useFetchConferences(partner._id);



  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (editingConference) {
      setEditingConference(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // Append form data
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    // Append files
    for (const key in files) {
      for (let i = 0; i < files[key].length; i++) {
        data.append(key, files[key][i]);
      }
    }

    try {
      const response = await axios.post(`${config.backendUrl}/api/conferences`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Success:', response.data);
      setShowModal(false);
      fetchConferences();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchConferences = async () => {
    try {
      const response = await axios.get(`${config.backendUrl}/api/conferences/${partner._id}`);
      setConferences(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching conferences:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConferences();
  }, []);

  const handleEdit = (id) => {
    const conferenceToEdit = conferences.find(c => c._id === id);
    setCurrentEditedConference(conferenceToEdit);
    setEditingConference(conferenceToEdit);
  };
  
  const handleSaveChanges = async (event) => {
    event.preventDefault();
    const updatedConference = { ...editingConference };
    
    // Update form fields here
    updatedConference.venueName = formData.venueName;
    updatedConference.address = formData.address;
    updatedConference.gpsCoordinates = formData.gpsCoordinates;
    updatedConference.seatingCapacity = formData.seatingCapacity;
    updatedConference.pricingStructure = formData.pricingStructure;
    updatedConference.contactPerson = formData.contactPerson;
    updatedConference.phoneNumber = formData.phoneNumber;
    updatedConference.emailAddress = formData.emailAddress;
  
    try {
      await axios.put(`${config.backendUrl}/api/conferences/${editingConference._id}`, updatedConference);
      setConferences(prevConferences =>
        prevConferences.map(conference =>
          conference._id === editingConference._id ? updatedConference : conference
        )
      );
      setShowModal(false);
      fetchConferences(); // Fetch updated conferences
    } catch (error) {
      console.error('Error updating conference:', error);
    }
  };
    
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this conference?")) {
      try {
        await axios.delete(`${config.backendUrl}/api/conferences/${id}`);
        setConferences(prevConferences => prevConferences.filter(conference => conference._id !== id));
        console.log('Conference deleted successfully');
      } catch (error) {
        console.error('Error deleting conference:', error);
      }
    }
  };
  
  

  return (
    <div className='conference_wrapper'>
      <header data-equalizer-watch className="freshTableHeader">
        {/* TITLE AND TITLE CHANGE */}
        <div className="freshTitileChart">
          <h2 className='h2TableTitle'>
            TABLE TITLE
            <button className="conference-pencil">
              <i className="fa fa-pencil" aria-hidden="true"></i>
            </button>
          </h2>
        </div>

        {/* MENU SEARCH INPUT FIELD */}
        <div className="fresh_input">
          <input
            type="text"
            className="conference-search_menu"
            placeholder="Search Menu Items"
          />
          <button className="search_conference_btn">Search</button>
        </div>
      </header>  

      <div className='conference_add_div'>
        <Button className='conference_add_btn' onClick={() => setShowModal(true)}> NEW </Button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} className='conference-modal'>
        <Modal.Header closeButton>
          <Modal.Title>New Conference Form</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} encType="multipart/form-data" className='conference-form-grid'>
            <div className='conference-input-grid'>
              <input type="text" name="venueName" placeholder="Venue Name" value={formData.venueName} onChange={handleInputChange} required className='conference-inputs' />

              <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} required className='conference-inputs' />

              <input type="text" name="gpsCoordinates" placeholder="GPS Coordinates" value={formData.gpsCoordinates} onChange={handleInputChange} className='conference-inputs' />

              <input type="number" name="seatingCapacity" placeholder="Seating Capacity" value={formData.seatingCapacity} onChange={handleInputChange} required className='conference-inputs' />

              <input type="text" name="pricingStructure" placeholder="Pricing Structure" value={formData.pricingStructure} onChange={handleInputChange} required className='conference-inputs' />
               
              <input type="text" name="contactPerson" placeholder="Contact Person" value={formData.contactPerson} onChange={handleInputChange} required className='conference-inputs' />

              <input type="text" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleInputChange} required className='conference-inputs' />

              <input type="email" name="emailAddress" placeholder="Email Address" value={formData.emailAddress} onChange={handleInputChange} required className='conference-inputs' />

            </div>

            <div className='checkbox-input-grid'>
              {/* Checkbox sections for various services */}
              {['avEquipment', 'cateringServices', 'wiFiAccess', 'airConditioning', 'parkingFacilities', 'bookingAvailability', 'eventPlanningAssistance', 'decorationServices', 'transportServices','securityServices'].map((service) => (
                <div className='checkbox_divs' key={service}>
                  <label htmlFor={service} className='check_box_label'>{service.replace(/([A-Z])/g,'$1').trim()}</label>
                  <div className='check_box_containers'>
                    <div className='yesNo-grids'>
                      <input type="checkbox" id={`yes-${service}`} name={service} value="yes" onChange={handleInputChange} />
                      <label htmlFor={`yes-${service}`}>Yes</label>
                    </div>
                    <div className='yesNo-grids'>
                      <input type="checkbox" id={`no-${service}`} name={service} value="no" onChange={handleInputChange} />
                      <label htmlFor={`no-${service}`}>No</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <select name="layoutOptions" value={formData.layoutOptions} onChange={handleInputChange}>
              <option value="">Layout Option</option>
              <option value="theatre">Theatre</option>
              <option value="classroom">Classroom</option>
              <option value="boardroom">Boardroom</option>
              <option value="roundtable">Round Table</option>
              <div className='checkbox-divs'>
                <label htmlFor="uShape">U-Shaped</label>
                <input type="radio" id="uShape" name="layoutOptions" value="uShape" onChange={handleInputChange} />
              </div>
              <div className='checkbox-divs'>
                <label htmlFor="hollowSquare">Hollow Square</label>
                <input type="radio" id="hollowSquare" name="layoutOptions" value="hollowSquare" onChange={handleInputChange} />
              </div>
            </select>

            <select name="paymentOptions" value={formData.paymentOptions} onChange={handleInputChange} required>
              <option value="">Payment Option</option>
              <option value="creditCard">Credit Card</option>
              <option value="debitCard">Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="bankTransfer">Bank Transfer</option>
              <option value="cash">Cash</option>
            </select>

            <input type="file" name="venueImages" multiple onChange={handleFileChange} />
            <input type="file" name="videoTours" multiple onChange={handleFileChange} />
            <input type="file" name="floorPlans" multiple onChange={handleFileChange} />

            <Button type="submit" className='conference_submit_btn'>Submit</Button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
      <EditModalConference 
        show={!!currentEditedConference}
        handleClose={() => setCurrentEditedConference(null)}
        conference={currentEditedConference}
        handleFileChange={setFiles}
        fetchConferences={fetchConferences}
      />
      {/* <div className='conference_table_headers'>
        <div className="headerDiv">Images</div>
        <div className="headerDiv">Name</div>
        <div className="headerDiv">GPS</div>
        <div className="headerDiv">Capacity</div>
        <div className="headerDiv">Price</div>
        <div className="headerDiv">Contact</div>
        <div className="headerDiv">Email</div>
        <div className="headerDiv">Layout</div>
        <div className="headerDiv">Availability</div>
      </div> */}

      <Table striped bordered hover responsive size="sm">
        <thead>
          <tr>
            <th>Images</th>
            <th>Name</th>
            <th>GPS</th>
            <th>Capacity</th>
            <th>Price</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Layout</th>
            <th>Availability</th>
          </tr>
        </thead>
        <tbody>
          {!isLoading && conferences.map(conference => (
            <tr key={conference._id}>
              <td>{conference.venueImages && conference.venueImages.length > 0 ? "Images" : ""}</td>
              <td>{conference.venueName}</td>
              <td>{conference.gpsCoordinates}</td>
              <td>{conference.seatingCapacity}</td>
              <td>{conference.pricingStructure}</td>
              <td>{conference.contactPerson}</td>
              <td>{conference.emailAddress}</td>
              <td>{conference.layoutOptions}</td>
              <td>{conference.bookingAvailability}</td>
              <td> 
            <button className={`btn btn-sm ${currentEditedConference?._id === conference._id ? 'btn-primary' : 'btn-secondary'} mr-2`} onClick={() => handleEdit(conference._id)}>
    {currentEditedConference?._id === conference._id ? 'Save' : 'Edit'}
  </button>
  <button className="btn btn-sm btn-danger ml-2" onClick={() => handleDelete(conference._id)}>
    Delete
  </button>
          </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <EditModalConference show={!!currentEditedConference} handleClose={() => setCurrentEditedConference(null)} conference={currentEditedConference} handleFileChange={handleFileChange} />

    </div>
  );
};

export default ConferenceForm;
