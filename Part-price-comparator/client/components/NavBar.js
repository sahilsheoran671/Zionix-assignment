import React from 'react';

function NavBar({ toggleCart }) {
  return (
    <nav className="navbar">
      <h1>Part Price Comparator</h1>
      <button onClick={toggleCart}>My Cart</button>
    </nav>
  );
}

export default NavBar;
