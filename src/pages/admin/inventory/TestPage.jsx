// Test page to verify if React is rendering correctly
import React from 'react';

const TestPage = () => {
  console.log('[TestPage] Component is rendering');
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-red-600">TEST PAGE</h1>
      <p className="text-lg mt-4">If you can see this, React is working!</p>
      <div className="bg-blue-500 text-white p-4 rounded-lg mt-4">
        <p>Tailwind CSS is also working!</p>
      </div>
    </div>
  );
};

export default TestPage;
