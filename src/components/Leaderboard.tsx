// src/components/Leaderboard.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function Leaderboard() {
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProfiles() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('xp', { ascending: false });
      if (error) console.error(error);
      else setProfiles(data);
    }
    fetchProfiles();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">Leaderboard</h2>
      <ul>
        {profiles.map((profile) => (
          <li key={profile.id} className="p-2 border-b flex items-center">
            <img
              src={profile.avatar_url || 'https://via.placeholder.com/40'}
              alt="Avatar"
              className="w-10 h-10 rounded-full mr-4"
            />
            <div>
              <p className="font-bold">{profile.username}</p>
              <p>Level {profile.level} • {profile.xp} XP</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Leaderboard;
