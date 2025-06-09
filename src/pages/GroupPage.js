// src/pages/GroupPage.js
import React, { useState } from 'react';
import axios from 'axios';

function GroupPage() {
  const [groupName, setGroupName] = useState('');

  const createGroup = async () => {
    try {
      const res = await axios.post('http://localhost:8080/api/groups?name=' + groupName);
      alert('Group created: ' + res.data.name);
    } catch (e) {
      console.error(e);
      alert('Failed to create group');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Create Group</h1>
      <input
        className="border p-2 mr-2"
        placeholder="Group Name"
        value={groupName}
        onChange={e => setGroupName(e.target.value)}
      />
      <button onClick={createGroup} className="bg-blue-500 text-white px-4 py-2 rounded">
        Create
      </button>
    </div>
  );
}

export default GroupPage;
