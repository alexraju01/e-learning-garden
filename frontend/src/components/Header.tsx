import React from 'react';
import { useState } from 'react';


const Header = () => {
    const username = "user1";

  return (
    <header className="bg-white shadow-sm">
        <div>
            <h1 className="text-xl font-bold text-gray-900">Collabrium</h1>
        </div>
        <div>
            <span>Hello, ${username}</span>
            <button>Log Out</button>
        </div>
    </header>     
  );
};


export default Header;