import React, { useState } from 'react';
import axios from 'axios';
import NavBar from './components/NavBar';
import Cart from './components/Cart';
import './App.css';

function App() {
  const [partNumber, setPartNumber] = useState('');
  const [volume, setVolume] = useState('');
  const [results, setResults] = useState([]);
  const [cartItem, setCartItem] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/search', { partNumber, volume });
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addToCart = (item) => {
    setCartItem(item);
    setIsCartOpen(true);
  };

  const updateVolume = async (newVolume) => {
    if (!cartItem) return;

    try {
      const response = await axios.post('http://localhost:5000/api/search', { partNumber: cartItem.manufacturerPartNumber, volume: newVolume });
      const updatedItem = response.data.find(item => item.dataProvider === cartItem.dataProvider);
      if (updatedItem) {
        setCartItem({
          ...cartItem,
          volume: newVolume,
          unitPrice: updatedItem.unitPrice,
          totalPrice: updatedItem.unitPrice * newVolume
        });
      }
    } catch (error) {
      console.error('Error updating volume:', error);
    }
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <div>
      <NavBar toggleCart={toggleCart} />
      <form onSubmit={handleSubmit}>
        <label>
          Part Number:
          <input type="text" value={partNumber} onChange={(e) => setPartNumber(e.target.value)} required />
        </label>
        <label>
          Volume:
          <input type="number" value={volume} onChange={(e) => setVolume(e.target.value)} required />
        </label>
        <button type="submit">Enter</button>
      </form>
      {results.length > 0 && (
        <table className="results-table">
          <thead>
            <tr>
              <th>Part Number</th>
              <th>Manufacturer</th>
              <th>Data Provider</th>
              <th>Volume</th>
              <th>Unit Price (At the given volume)</th>
              <th>Total Price (Unit Price * Volume)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>{result.manufacturerPartNumber}</td>
                <td>{result.manufacturer}</td>
                <td>{result.dataProvider}</td>
                <td>{result.volume}</td>
                <td>{result.unitPrice}</td>
                <td>{result.totalPrice}</td>
                <td>
                  <button onClick={() => addToCart(result)}>Add to Cart</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {isCartOpen && (
        <Cart cartItem={cartItem} updateVolume={updateVolume} toggleCart={toggleCart} />
      )}
    </div>
  );
}

export default App;
