import React, { useState } from 'react';
import { PlusCircle, BookOpen, XCircle, Sparkles } from 'lucide-react';

// Main App component
const App = () => {
  // State to manage the list of flashcards
  const [flashcards, setFlashcards] = useState([]);
  // State to manage the input for new term
  const [newTerm, setNewTerm] = useState('');
  // State to manage the input for new definition
  const [newDefinition, setNewDefinition] = useState('');
  // State to control which view is active (create or view)
  const [activeView, setActiveView] = useState('create'); // 'create' or 'view'
  // State to manage loading status for Gemini API call
  const [isGeneratingDefinition, setIsGeneratingDefinition] = useState(false);
  // State for error messages
  const [errorMessage, setErrorMessage] = useState('');

  // Function to add a new flashcard
  const addFlashcard = () => {
    if (newTerm.trim() && newDefinition.trim()) {
      setFlashcards([...flashcards, { term: newTerm, definition: newDefinition }]);
      setNewTerm(''); // Clear the input field after adding
      setNewDefinition(''); // Clear the input field after adding
      setErrorMessage(''); // Clear any previous error messages
    } else {
      setErrorMessage('Please enter both a term and a definition.');
    }
  };

  // Function to delete a flashcard
  const deleteFlashcard = (indexToDelete) => {
    setFlashcards(flashcards.filter((_, index) => index !== indexToDelete));
  };

  // Function to generate a definition using Gemini API
  const generateDefinition = async () => {
    if (!newTerm.trim()) {
      setErrorMessage('Please enter a term before generating a definition.');
      return;
    }

    setIsGeneratingDefinition(true);
    setErrorMessage(''); // Clear previous errors

    try {
      let chatHistory = [];
      const prompt = `Provide a concise definition for the term "${newTerm}".`;
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // If you want to use models other than gemini-2.0-flash or imagen-3.0-generate-002, provide an API key here. Otherwise, leave this as-is.
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error.message || response.statusText}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setNewDefinition(text); // Set the generated definition
      } else {
        setErrorMessage('Could not generate a definition. Please try again.');
      }
    } catch (error) {
      console.error("Error generating definition:", error);
      setErrorMessage(`Failed to generate definition: ${error.message}`);
    } finally {
      setIsGeneratingDefinition(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 font-sans text-gray-800 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <script src="https://cdn.tailwindcss.com"></script>

      {/* Header and Navigation */}
      <header className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-4 mb-8 flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold text-indigo-700 mb-4 sm:mb-0">Quizely</h1>
        <nav className="flex space-x-4">
          <button
            onClick={() => { setActiveView('create'); setErrorMessage(''); }}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
              activeView === 'create'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Create Flashcard
          </button>
          <button
            onClick={() => { setActiveView('view'); setErrorMessage(''); }}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ${
              activeView === 'view'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            <BookOpen className="w-5 h-5 mr-2" />
            View Flashcards
          </button>
        </nav>
      </header>

      {/* Conditional Rendering based on activeView */}
      {activeView === 'create' && (
        <section className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-6">Create New Flashcard</h2>
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Enter Term"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
            />
            <div className="relative">
              <textarea
                placeholder="Enter Definition"
                value={newDefinition}
                onChange={(e) => setNewDefinition(e.target.value)}
                rows="4"
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none resize-y w-full"
              ></textarea>
              <button
                onClick={generateDefinition}
                disabled={isGeneratingDefinition}
                className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-300 flex items-center
                  ${isGeneratingDefinition
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-purple-500 text-white hover:bg-purple-600 shadow-md'
                  }`}
              >
                {isGeneratingDefinition ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1" />
                    Generate Definition
                  </>
                )}
              </button>
            </div>
            <button
              onClick={addFlashcard}
              className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-md flex items-center justify-center"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Flashcard
            </button>
          </div>
        </section>
      )}

      {activeView === 'view' && (
        <section className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-6">Your Flashcards</h2>
          {flashcards.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No flashcards yet. Go to "Create Flashcard" to add some!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashcards.map((card, index) => (
                <div
                  key={index}
                  className="bg-indigo-50 rounded-lg p-5 shadow-sm border border-indigo-200 relative group"
                >
                  <h3 className="text-lg font-medium text-indigo-800 mb-2">{card.term}</h3>
                  <p className="text-gray-700 text-sm">{card.definition}</p>
                  <button
                    onClick={() => deleteFlashcard(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    aria-label="Delete flashcard"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default App;
