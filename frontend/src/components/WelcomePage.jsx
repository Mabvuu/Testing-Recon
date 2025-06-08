// src/components/WelcomePage.jsx
import React from 'react'

const WelcomePage = () => {
  return (
    <div
      className="pt-30 flex justify-end items-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/b.jpg')" }}
    >
      {/* Outer white box */}
      <div className="w-full max-w-sm bg-white rounded-md shadow-xl mr-8 p-8">
        {/* Inner olive-bordered container */}
        <div className="p-4 border-2 border-[#556B2F] rounded-md bg-white">
          <h1 className="text-2xl font-semibold text-[#556B2F] mb-2">
            ✨ Welcome to <span className="italic">Oliver Compass</span>! ✨
          </h1>
          <h5 className="text-[#556B2F] mb-4">
            Zimbabwe’s Premier Web Reconciliation Platform
          </h5>
          <p className="text-[#556B2F] mb-6">
            No more payment puzzles—Oliver Compass aligns every payment with its matching record,  
            giving you sparkling accuracy, total transparency, and peace of mind. 😊
          </p>
          <div className="flex justify-center">
            <img
              src="/images/logo1.png"
              alt="Oliver Compass Logo"
              className="h-48 w-auto"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage
