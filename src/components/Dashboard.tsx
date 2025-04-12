/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Dashboard.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import LogActivity from './LogActivity';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProfile() {
        // Only query if a user exists
        if (user) {
          // Query the profile for the current user's id.
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle(); // returns null if no row found
      
          if (error) {
            console.error("Error fetching profile:", error);
          } else if (!data) {
            // No profile found, so upsert (create) a profile row.
            console.log("No profile found for user. Upserting a new profile.");
            const { data: upsertedData, error: upsertError } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                username: user.email, // using the email as the default username
                xp: 0,
                level: 1,
                study_hours: 0,
              })
              .select('*')
              .maybeSingle();
            
            if (upsertError) {
              console.error("Error upserting profile:", upsertError);
            } else if (upsertedData) {
              setProfile(upsertedData);
            }
          } else {
            // If a profile is returned, set it.
            setProfile(data);
          }
        }
    }
      
    async function fetchActivities() {
      const { data, error } = await supabase.from('study_logs').select('*').order('logged_at', { ascending: false });
      if (error) console.error(error);
      else setActivities(data);
    }
    async function fetchMilestones() {
      // For simplicity, fetch all milestones.
      const { data, error } = await supabase.from('milestones').select('*');
      if (error) console.error(error);
      else setMilestones(data);
    }

    fetchProfile();
    fetchActivities();
    fetchMilestones();
  }, [user]);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Profile card */}
      <div className="flex items-center mb-6 p-4 bg-white shadow rounded">
        <img
          src={profile.avatar_url || 'https://via.placeholder.com/64'}
          alt="Avatar"
          className="rounded-full w-16 h-16 mr-4"
        />
        <div>
          <h2 className="text-xl font-bold mb-1">{profile.username}</h2>
          <p className="text-sm text-gray-600">
            Level {profile.level} | {profile.xp} XP
          </p>
          <p className="text-sm text-gray-600">
            Total Study Hours: {profile.study_hours}
          </p>
        </div>
      </div>
  
      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Log Activity + Recent Activity */}
        <div className="flex flex-col space-y-6">
          <div className="bg-white shadow rounded p-4">
            <h3 className="text-lg font-semibold mb-2">Log Study Activity</h3>
            <LogActivity userId={profile.id} profile={profile} />
          </div>
  
          <div className="bg-white shadow rounded p-4">
            <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
            {activities.length === 0 ? (
              <p className="text-gray-500">No activities yet.</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="border-b py-2">
                  <p className="font-semibold">{activity.activity_type}</p>
                  <p>{activity.description}</p>
                  <small className="text-gray-500">
                    {new Date(activity.logged_at).toLocaleString()}
                  </small>
                </div>
              ))
            )}
          </div>
        </div>
  
        {/* Right column: Milestones */}
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-lg font-semibold mb-2">Milestones</h3>
          {milestones.length === 0 ? (
            <p className="text-gray-500">No milestones yet.</p>
          ) : (
            milestones.map((ms) => (
              <div
                key={ms.id}
                className="border p-2 my-2 flex justify-between items-center"
              >
                <div>
                  <h4 className="font-semibold">{ms.title}</h4>
                  <p>{ms.description}</p>
                  <p className="text-sm text-gray-600">
                    XP Reward: {ms.xp_reward}
                  </p>
                  {ms.badge && (
                    <span className="bg-yellow-200 text-gray-800 px-2 rounded text-sm mt-1 inline-block">
                      {ms.badge}
                    </span>
                  )}
                </div>
                <button
                  className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                  onClick={async () => {
                    const { error } = await supabase
                      .from('user_milestones')
                      .insert({ user_id: profile.id, milestone_id: ms.id });
                    if (error) alert(error.message);
                    else alert('Milestone claimed!');
                  }}
                >
                  Claim
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );  
}

export default Dashboard;
