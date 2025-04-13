// client/src/components/projects/ProjectDetail.js
import React, { useEffect, useState } from 'react';
import API from '../../api';
import { useParams } from 'react-router-dom';

const ProjectDetail = () => {
  const { id } = useParams();  // Project id from the URL
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await API.get(`/projects`); // Or create an endpoint like /projects/:id
        // Assume res.data is an array of projects; you may need to modify if you have a project detail endpoint.
        const found = res.data.find((p) => p.id === Number(id));
        setProject(found);
      } catch (error) {
        console.error('Error fetching project', error);
      }
    };
    fetchProject();
  }, [id]);

  if (!project) return <p>Loading project details...</p>;

  return (
    <div>
      <h2>{project.title}</h2>
      <p>{project.description}</p>
      <p>Privacy: {project.isPrivate ? 'Private' : 'Public'}</p>
      {project.Users && (
        <div>
          <h4>Team Members:</h4>
          <ul>
            {project.Users.map((user) => (
              <li key={user.id}>{user.name} ({user.email})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
