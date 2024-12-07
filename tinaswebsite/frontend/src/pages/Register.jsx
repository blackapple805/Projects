// frontend/src/pages/Register.jsx
import { useState } from 'react';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState(null);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/users/register', formData);
      setMessage(res.data.message);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage('An error occurred, please try again.');
      }
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {message && <p className="mb-4">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Name</label>
          <input name="name" value={formData.name} onChange={handleChange} className="border p-2 w-full" required />
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="border p-2 w-full" required />
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="border p-2 w-full" required />
        </div>
        <button type="submit" className="bg-black text-white py-2 px-4">Register</button>
      </form>
    </div>
  );
}

export default Register;
