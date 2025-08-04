import { useState, useEffect } from "react";
import { getHouse, createHouse, joinHouse } from "../api";

export default function House() {
  const [house, setHouse] = useState(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("🏠 Fetching house data...");
    setLoading(true);
    getHouse()
      .then((response) => {
        console.log("✅ House data received:", response);
        setHouse(response.data);
        setError(null);
      })
      .catch((err) => {
        console.error("❌ House fetch error:", err);
        setHouse(null);
        setError(err.message || "Failed to fetch house data");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    console.log("🏠 Creating house:", { name, address, description });
    try {
      const response = await createHouse({ name, address, description });
      console.log("✅ House created:", response);
      setHouse(response.data);
      setError(null);
    } catch (err) {
      console.error("❌ House creation error:", err);
      alert("Failed to create house: " + (err.message || "Unknown error"));
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    console.log("🔑 Joining house with code:", inviteCode);
    try {
      const response = await joinHouse(inviteCode);
      console.log("✅ House joined:", response);
      setHouse(response.data);
      setError(null);
    } catch (err) {
      console.error("❌ House join error:", err);
      alert("Invalid invite code or failed to join");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading house data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <h3 className="font-bold">Error loading house data</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {house ? (
        <div className="bg-white shadow p-6 rounded">
          <h2 className="text-2xl font-bold">{house.name}</h2>
          <p className="text-gray-500">{house.address}</p>
          <p className="text-sm text-gray-400">Invite Code: <span className="font-mono">{house.inviteCode}</span></p>
          <h3 className="mt-4 font-semibold">Members:</h3>
          <ul className="list-disc list-inside">
            {house.members.map((m) => (
              <li key={m._id}>{m.name} ({m.email})</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* Create House */}
          <form onSubmit={handleCreate} className="bg-white shadow p-6 rounded space-y-4">
            <h3 className="text-xl font-bold text-blue-600">🏠 Create House</h3>
            <input className="border p-2 w-full rounded" placeholder="House Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="border p-2 w-full rounded" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <input className="border p-2 w-full rounded" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <button className="btn-primary w-full">Create</button>
          </form>

          {/* Join House */}
          <form onSubmit={handleJoin} className="bg-white shadow p-6 rounded space-y-4">
            <h3 className="text-xl font-bold text-green-600">🔑 Join House</h3>
            <input className="border p-2 w-full rounded" placeholder="Enter Invite Code" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} />
            <button className="btn-primary w-full">Join</button>
          </form>
        </div>
      )}
    </div>
  );
}
