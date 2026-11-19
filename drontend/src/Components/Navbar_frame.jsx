import React from 'react'
import "./navbar_frame.css"
import {NavLink} from "react-router-dom"


const Navbar_frame = () => {
  return (
    <div className='navbar_frame_'>

        <div className="app_LOGO">
            <img src="" alt="" />
        </div>

        <div className="Route_list">
            <ul>

                <NavLink to="/" className={"navlink"}>home</NavLink>
                <NavLink to="/Aboutus" className={"navlink"}>about</NavLink>
                <NavLink to="/Dashboard" className={"navlink"}>Dashboard</NavLink>

            </ul>
        </div>
      
    </div>
  )
}

export default Navbar_frame
