// export default Dashboard;
import React, { useState, useEffect } from "react";
import API from "../../api"; // Assuming you have an API utility for Axios or Fetch

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await API.get("/dashboard");
        setData(response.data); // Assuming the API returns the data for the dashboard
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };


    
    fetchDashboardData();
  }, []); // Empty dependency array means this runs only once when the component mounts

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div>
        {data && data.length > 0 ? (
          <ul>
            {data.map((item, index) => (
              <li key={index}>{item.name}</li>
            ))}
          </ul>
        ) : (
          <div>No data available</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
