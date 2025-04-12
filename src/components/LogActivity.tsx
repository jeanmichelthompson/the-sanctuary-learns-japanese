/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { supabase } from '../supabaseClient';

interface LogActivityProps {
  userId: string;
  profile: any; // so we can reference profile.xp if needed
}

function LogActivity({ userId, profile }: LogActivityProps) {
  const [activityType, setActivityType] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Convert the duration string to a number
    const parsedDuration = parseFloat(duration) || 0;
    const xpEarned = Math.floor(parsedDuration * 10);

    // 1) Insert new study log
    const { error } = await supabase.from('study_logs').insert({
      user_id: userId,
      activity_type: activityType,
      description,
      duration: parsedDuration,
      xp_earned: xpEarned,
      logged_at: new Date().toISOString(),
    });

    // 2) Update the user's XP in their profile (optional, but recommended)
    if (!error) {
      await supabase
        .from('profiles')
        .update({ xp: (profile?.xp ?? 0) + xpEarned })
        .eq('id', userId);

      alert('Study activity logged! Earned ' + xpEarned + ' XP');

      // Reset form fields
      setActivityType('');
      setDescription('');
      setDuration('');
    } else {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
      <div className="flex flex-col">
        <label className="font-semibold mb-1">Activity Type</label>
        <select
          className="border border-gray-300 rounded p-2"
          value={activityType}
          onChange={(e) => setActivityType(e.target.value)}
          required
        >
          <option value="">Select an activity</option>
          <option value="Reading">Reading</option>
          <option value="Listening">Listening</option>
          <option value="Grammar">Grammar</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="font-semibold mb-1">Description/Notes</label>
        <textarea
          className="border border-gray-300 rounded p-2"
          placeholder="Description of your study session"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex flex-col">
        <label className="font-semibold mb-1">Duration (minutes)</label>
        <input
          type="number"
          className="border border-gray-300 rounded p-2"
          min="1"
          step="1"
          placeholder="30"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-black py-2 px-4 rounded mt-2"
      >
        Log Activity
      </button>
    </form>
  );
}

export default LogActivity;
