import { Search, Star, MapPin, Filter, BookOpen } from 'lucide-react';

const tutors = [
  {
    id: 1,
    name: 'Dr. Amina Osei',
    title: 'Certified Kiswahili Linguist',
    location: 'Nairobi, Kenya',
    rating: 4.9,
    reviews: 128,
    rate: 45,
    tags: ['Beginner', 'Conversational', 'Business'],
    available: true,
  },
  {
    id: 2,
    name: 'Juma Mwangi',
    title: 'Native Speaker & Educator',
    location: 'Dar es Salaam, Tanzania',
    rating: 4.8,
    reviews: 97,
    rate: 35,
    tags: ['Grammar', 'Pronunciation', 'Beginner'],
    available: true,
  },
  {
    id: 3,
    name: 'Fatima Hassan',
    title: 'University Lecturer',
    location: 'Mombasa, Kenya',
    rating: 5.0,
    reviews: 64,
    rate: 60,
    tags: ['Advanced', 'Academic', 'Literature'],
    available: false,
  },
];

function TutorCard({ tutor }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900">{tutor.name}</h3>
            {tutor.available ? (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 rounded-full">Available</span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">Booked</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{tutor.title}</p>
          <div className="flex items-center gap-1 mt-1 text-sm text-gray-400">
            <MapPin className="w-3.5 h-3.5" />
            {tutor.location}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium text-gray-700">{tutor.rating}</span>
            <span className="text-sm text-gray-400">({tutor.reviews} reviews)</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tutor.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
        <span className="text-sm font-semibold text-gray-900">${tutor.rate}<span className="text-gray-400 font-normal">/hr</span></span>
        <button className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          View Profile
        </button>
      </div>
    </div>
  );
}

export default function TutorListing() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Kiswahili Tutor</h1>
        <p className="text-gray-500">Connect with verified expert tutors for personalised learning sessions</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search by name, specialty, or keyword..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Tutor grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tutors.map(tutor => (
          <TutorCard key={tutor.id} tutor={tutor} />
        ))}
      </div>
    </div>
  );
}
