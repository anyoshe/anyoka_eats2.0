import React from 'react';
import './OutsideCatering.css';

const Catering = () => {
    return (
        <div className="containerContainer">
            <div className="container">
                {/* FIRST TILE */}
                <div className="tile tile_one">
                    <h3>Outdoor Catering</h3>
                    <input type="file" className="cateringPictures" />

                    <div className="picture_dispaly_div">
                        <ul className="picture_dispaly_ul">
                            <li className="picture_li">
                                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/53819/9.png" alt="Catering" />
                            </li>
                            <li className="picture_li">
                                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/53819/2.png" alt="Catering" />
                            </li>
                            <li className="picture_li">
                                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/53819/3.png" alt="Catering" />
                            </li>
                            <li className="picture_li">
                                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/53819/1.png" alt="Catering" />
                            </li>
                            <li className="picture_li">
                                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/53819/4.png" alt="Catering" />
                            </li>
                            <li className="picture_li">
                                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/53819/5.png" alt="Catering" />
                            </li>
                            <li className="picture_li">
                                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/53819/7.png" alt="Catering" />
                            </li>
                            <li className="picture_li">
                                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/53819/8.png" alt="Catering" />
                            </li>
                            <li className="picture_li">
                                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/53819/6.png" alt="Catering" />
                            </li>
                        </ul>
                    </div>
                </div>

                {/* NAME/LOCATION/DESCRIPTION DISPLAY DIV */}
                <div className="tile tile_two">
                    <div className="name_location">
                        <div className="entry_div">
                            <p className="entry_P">Business Name :</p>
                            <p className="entry">Lorem, ipsum dolor</p>
                        </div>

                        {/* <div className="entry_div">
                            <p className="entry_P">Location :</p>
                            <p className="entry">Lorem, ipsum dolor</p>
                        </div> */}
                    </div>

                    {/* DESCRIPTION DIV */}
                    <div className="description_div">
                        <h2 className="desc_about">About The Business</h2>
                        <textarea
                            name="bussinessDescription"
                            id="bizDescription"
                            placeholder="(Give a Brief Description About Your Business And Reservation Or Details For Your Customers To Know)"
                        ></textarea>
                    </div>
                </div>

                {/* THIRD TILE */}
                <div className="tile tile_three">
                    <h2 className="event_types">Type Of Events</h2>
                    <ul className="event_ul">
                        <li className="event_li">List Item</li>
                        <li className="event_li">List Item</li>
                        <li className="event_li">List Item</li>
                        <li className="event_li">List Item</li>
                        <li className="event_li">List Item</li>
                        <li className="event_li">List Item</li>
                        <li className="event_li">List Item</li>
                        <li className="event_li">List Item</li>
                        <li className="event_li">List Item</li>
                        <li className="event_li">List Item</li>
                    </ul>
                </div>
            </div>   
        </div>
    );
};

export default Catering;