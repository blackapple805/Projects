// /server/api/controllers/itemsController.js

// Dummy items array for illustration
let items = [{ id: 1, name: 'Sample item 1' }, { id: 2, name: 'Sample item 2' }];

const listItems = (req, res) => {
  res.json(items);
};

const createItem = (req, res) => {
  // Create an item based on the request body
  const newItem = { id: items.length + 1, name: req.body.name };
  items.push(newItem);
  res.status(201).json(newItem);
};

const deleteItem = (req, res) => {
  // Delete an item based on the id parameter
  items = items.filter(item => item.id !== parseInt(req.params.id));
  res.status(204).send();
};

module.exports = {
  listItems,
  createItem,
  deleteItem
};
