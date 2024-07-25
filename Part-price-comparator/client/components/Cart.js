import React from 'react';

function Cart({ cartItem, updateVolume, toggleCart }) {
  if (!cartItem) {
    return (
      <div className="cart">
        <button className="close-btn" onClick={toggleCart}>Close</button>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    updateVolume(newVolume);
  };

  return (
    <div className="cart">
      <button className="close-btn" onClick={toggleCart}>Close</button>
      <h2>My Cart</h2>
      <table>
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Manufacturer</th>
            <th>Data Provider</th>
            <th>Volume</th>
            <th>Unit Price</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{cartItem.manufacturerPartNumber}</td>
            <td>{cartItem.manufacturer}</td>
            <td>{cartItem.dataProvider}</td>
            <td>
              <input
                type="number"
                value={cartItem.volume}
                onChange={handleVolumeChange}
              />
            </td>
            <td>{cartItem.unitPrice}</td>
            <td>{cartItem.totalPrice}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Cart;
