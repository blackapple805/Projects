import React from 'react';
import { Navbar, Form, FormControl, Button } from 'react-bootstrap';
import './Header.css';

const Header = ({ onSearch }) => {
  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.elements.search.value;
    onSearch(query);
  };

  return (
    <Navbar bg="dark" variant="dark" className="justify-content-between">
      <Navbar.Brand href="#home">Job Fetcher</Navbar.Brand>
      <Form inline onSubmit={handleSearch}>
        <FormControl
          type="text"
          placeholder="Search"
          className="mr-sm-2"
          name="search"
        />
        <Button variant="outline-info" type="submit">Search</Button>
      </Form>
    </Navbar>
  );
};

export default Header;
