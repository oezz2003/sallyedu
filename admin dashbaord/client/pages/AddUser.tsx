import React, { useState } from 'react';

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem('users') || '[]');
  } catch {
    return [];
  }
};

const saveUsers = (users: any[]) => {
  localStorage.setItem('users', JSON.stringify(users));
};

const AddUser: React.FC = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    avatar: '',
    role: 'viewer',
  });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let users = getUsers();
    if (users.find(u => u.username === form.username)) {
      setMessage('Username already exists!');
      return;
    }
    users.push(form);
    saveUsers(users);
    setMessage('User added!');
    setForm({ username: '', password: '', name: '', email: '', avatar: '', role: 'viewer' });
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4">Add User</h2>
      {message && <div className="mb-2 text-green-600">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label>Username</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            required
          />
        </div>

        <div>
          <label>Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border px-2 py-1 pr-10 rounded"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div>
          <label>Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            required
          />
        </div>

        <div>
          <label>Avatar (one letter)</label>
          <input
            name="avatar"
            value={form.avatar}
            maxLength={1}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
            required
          />
        </div>

        <div>
          <label>Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border px-2 py-1 rounded"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Add User
        </button>
      </form>
    </div>
  );
};

export default AddUser;
