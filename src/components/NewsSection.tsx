export default function NewsSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display text-white">Latest News</h2>
      
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
        <h3 className="text-white font-semibold text-lg mb-4">Week 1 Highlights</h3>
        <video controls width="100%" className="rounded-lg">
          <source src="/videos/week1-highlights.mp4" type="video/mp4" />
          <p className="text-white">Your browser doesn't support video playback.</p>
        </video>
      </div>
    </div>
  );
}