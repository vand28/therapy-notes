'use client';

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TherapyNotes</h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link
              href="/login"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium"
            >
              Get Started
            </Link>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Modern Session Management
            <br />
            <span className="text-blue-600 dark:text-blue-400">for Therapy Professionals</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Save hours every week on documentation. Give parents unprecedented visibility
            into their child's progress. Built specifically for OT and Speech therapists.
          </p>

          <div className="flex justify-center gap-4 mb-16">
            <Link
              href="/signup"
              className="px-8 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-semibold text-lg"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-lg border border-gray-300 dark:border-gray-600"
            >
              Sign In
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-transparent dark:border-gray-700">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Save Time</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Cut note-taking time from 15 minutes to 3 minutes with smart templates
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-transparent dark:border-gray-700">
              <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Parent Portal</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Give parents real-time visibility into their child's progress
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-transparent dark:border-gray-700">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Track Progress</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Visual goal tracking with progress charts and milestones
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
