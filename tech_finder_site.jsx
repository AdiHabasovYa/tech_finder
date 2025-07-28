import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-blue-300 flex flex-col items-center justify-center">
      <img src="/logo.png" alt="Logo" className="w-20 h-20 mb-4" />
      <h1 className="text-4xl font-bold text-blue-900 mb-4">Tech-Finder</h1>
      <input
        type="text"
        placeholder="Choose your Software"
        className="text-center py-2 px-4 rounded-md shadow mb-6 w-96"
      />
      <div className="flex gap-8 text-xl text-teal-700">
        <Link to="/cloud">Cloud</Link>
        <Link to="/security">Security</Link>
        <Link to="/db">DB</Link>
        <Link to="/support">Support</Link>
        <Link to="/workos">Work OS</Link>
      </div>
    </div>
  );
}

function CloudStep1() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-blue-300 flex flex-col items-center justify-center">
      <h2 className="text-5xl text-teal-800 mb-4">Cloud</h2>
      <div className="text-lg text-indigo-900 mb-4">Business needs?</div>
      <div className="flex flex-wrap justify-center gap-4">
        {['Production', 'Development', 'Data Analyst', 'Testing'].map(item => (
          <Link to="/cloud/step2" key={item} className="border px-6 py-2 rounded-md text-teal-700 hover:bg-teal-100">
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
}

function CloudStep2() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-blue-300 flex flex-col items-center justify-center">
      <h2 className="text-5xl text-teal-800 mb-4">Cloud</h2>
      <div className="text-lg text-indigo-900 mb-4">Technological Needs?</div>
      <div className="flex flex-wrap justify-center gap-4">
        {['Virtual Machine', 'Storage', 'Data base', 'BI', 'Machine Learning', 'Networking', 'Data Analytics', 'Security', 'DevOps'].map(item => (
          <button key={item} className="border px-6 py-2 rounded-md text-teal-700 hover:bg-teal-100">
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cloud" element={<CloudStep1 />} />
        <Route path="/cloud/step2" element={<CloudStep2 />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}
