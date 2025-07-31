import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Uncoverles</h1>
        <p className="text-lg text-gray-600 mb-8">Multiplayer Medical Diagnosis Game</p>

        <div className="space-x-4">
          <Link to="/play" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 inline-block">
            Play Game
          </Link>
          <Link to="/guidebook" className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 inline-block">
            Guidebook
          </Link>
        </div>
      </div>
    </div>
  );
}
