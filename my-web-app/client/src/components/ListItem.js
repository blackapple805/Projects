import React from 'react';

const ListItem = ({ item, onDelete }) => (
  <div>
    {item.name}
    <button onClick={() => onDelete(item.id)}>Delete</button>
  </div>
);

export default ListItem;
