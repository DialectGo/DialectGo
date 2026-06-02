import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import '../assets/css/GameManagement.css';

export default function GameManagement() {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('user_game_progress')
        .select(`
          *,
          profiles(username),
          games(name)
        `);

      if (error) throw error;

      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching game data:', error.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredPlayers = players.filter((player) =>
    (player.profiles?.username || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalPlayers = players.length;

  const onlinePlayers = players.filter(
    (player) => player.current_hearts > 0
  ).length;

  const outOfLives = players.filter(
    (player) => player.current_hearts === 0
  ).length;

  const avgScore =
    players.length > 0
      ? Math.round(
          players.reduce(
            (sum, player) => sum + (player.total_xp || 0),
            0
          ) / players.length
        )
      : 0;

  if (loading) {
    return (
      <div className="loading-container">
        Loading game data...
      </div>
    );
  }

  return (
    <div className="game-management">
    <div className="game-container">

      {/* STATS */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Players</h3>
          <span>{totalPlayers}</span>
        </div>

        <div className="stat-card">
          <h3>Online Now</h3>
          <span>{onlinePlayers}</span>
        </div>

        <div className="stat-card">
          <h3>Avg Score</h3>
          <span>{avgScore}</span>
        </div>

        <div className="stat-card">
          <h3>Out of Lives</h3>
          <span>{outOfLives}</span>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-card">
        <div className="table-header">
          <h2>User Game Proper</h2>
          <span className="badge">
            {filteredPlayers.length}
          </span>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search player..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>Players</th>
              <th>Game</th>
              <th>Level</th>
              <th>Lives</th>
              <th>Avg Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => (
                <tr key={player.id}>
                  <td>
                    {player.profiles?.username || 'Guest'}
                  </td>

                  <td>
                    {player.games?.name || 'N/A'}
                  </td>

                  <td>
                    Level {player.current_level}
                  </td>

                  <td>
                    {player.current_hearts}
                  </td>

                  <td>
                    {player.total_xp || 0}
                  </td>

                  <td>
                    {player.current_hearts > 0
                      ? 'Online'
                      : 'Offline'}
                  </td>

                  <td>
                    <button className="btn green">
                      ✓
                    </button>

                    <button className="btn yellow">
                      ✎
                    </button>

                    <button className="btn red">
                      🗑
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">
                  No player records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}