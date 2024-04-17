import React, { useState } from 'react';

function App() {
  const [items, setItems] = useState([]);

  const addItem = item => {
    setItems([...items, item]);
  };

  return (
    <div>
      <h1>Item Manager</h1>
      <input type="text" placeholder="Add new item" onKeyDown={e => {
        if (e.key === 'Enter' && e.target.value) {
          addItem(e.target.value);
          e.target.value = '';
        }
      }} />
      <ul>
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    </div>
  );
}

export default App;
