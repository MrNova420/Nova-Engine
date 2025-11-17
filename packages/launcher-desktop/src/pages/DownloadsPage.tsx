/**
 * DownloadsPage - Manages game downloads and updates
 */

import { Link } from 'react-router-dom';

export default function DownloadsPage() {
  return (
    <div className="page downloads-page">
      <header className="page-header">
        <h1>Downloads & Updates</h1>
        <nav className="main-nav">
          <Link to="/">Home</Link>
          <Link to="/library">Library</Link>
          <Link to="/downloads" className="active">
            Downloads
          </Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </header>

      <main className="page-content">
        <div className="empty-state">
          <h2>No active downloads</h2>
          <p>Download games from Nova Hub to play offline</p>
        </div>
      </main>
    </div>
  );
}
