import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Star,
  Shield,
  Globe,
  ArrowRight,
  GraduationCap,
  MessageSquare,
  Award,
  Calendar,
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Vetted Expert Tutors',
    description: 'Every tutor is screened and verified. Work with native speakers and certified Kiswahili educators.',
  },
  {
    icon: Calendar,
    title: 'Flexible Scheduling',
    description: 'Book sessions that fit your schedule. One-on-one or group lessons available at any time.',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Funds held in escrow until session completion. Full refunds for cancelled or disputed sessions.',
  },
  {
    icon: Award,
    title: 'Verified Certificates',
    description: 'Earn blockchain-verified certificates as you progress. Share credentials that cannot be forged.',
  },
  {
    icon: MessageSquare,
    title: 'AI Tutor Assistant',
    description: 'Get instant grammar corrections and practice suggestions from our Groq-powered AI companion.',
  },
  {
    icon: Globe,
    title: 'Learn Anywhere',
    description: 'Accessible on any device. Continue your Kiswahili journey wherever life takes you.',
  },
];

const stats = [
  { value: '500+', label: 'Expert Tutors' },
  { value: '10,000+', label: 'Students Enrolled' },
  { value: '4.9', label: 'Average Rating' },
  { value: '15+', label: 'Countries Served' },
];

export default function Landing() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            Professional Kiswahili Learning
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
            Master Kiswahili
            <br />
            <span className="text-blue-600">with Expert Guidance</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed mb-8 max-w-2xl">
            Connect with verified Kiswahili tutors for personalised, structured learning.
            From conversational fluency to professional proficiency — on your schedule.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Learning Today
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/tutors"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Users className="w-4 h-4" />
              Browse Tutors
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-b border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need to succeed</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            LughaPro combines expert tutoring, intelligent tools, and secure infrastructure to deliver a best-in-class learning experience.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="p-6 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How LughaPro works</h2>
            <p className="text-gray-500">Three simple steps to fluency</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', icon: GraduationCap, title: 'Choose your tutor', desc: 'Browse verified profiles, read reviews, and find the perfect match for your learning goals.' },
              { step: '02', icon: Calendar, title: 'Book a session', desc: 'Schedule at a time that works for you. Sessions are protected by escrow until completion.' },
              { step: '03', icon: Award, title: 'Earn your certificate', desc: 'Complete your learning journey and receive a blockchain-verified certificate to share with the world.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative">
                <div className="text-6xl font-bold text-gray-100 mb-3">{step}</div>
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-blue-600 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to speak Kiswahili?</h2>
          <p className="text-blue-100 mb-8 max-w-lg mx-auto">
            Join thousands of learners who have transformed their language skills with LughaPro's expert-guided approach.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
