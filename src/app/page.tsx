import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-primary-50 to-primary-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">NYC Entertainment List Keeper</h1>
          <div>
            <Link 
              href="/auth/signin" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Discover and organize NYC entertainment spots
            </h2>
            <p className="mt-4 text-xl text-gray-500">
            Create lists of your favorite venues, track where you&apos;ve been, and see where your friends are going.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Get Started
              </Link>
              <Link
                href="/map"
                className="ml-4 inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
              >
                Explore Map
              </Link>
            </div>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <FeatureCard 
                title="Create Custom Lists" 
                description="Organize venues by category: restaurants, bars, theaters, parks, and more."
              />
              <FeatureCard 
                title="Interactive Maps" 
                description="See all your favorite spots on a map and discover new places nearby."
              />
              <FeatureCard 
                title="Social Sharing" 
                description="Share your lists with friends and see what spots they recommend."
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} NYC Entertainment List Keeper. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-base text-gray-500">{description}</p>
    </div>
  );
}