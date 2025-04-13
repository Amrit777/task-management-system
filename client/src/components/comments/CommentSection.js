// client/src/components/comments/CommentSection.js
import React, { useEffect, useState } from 'react';
import API from '../../api';

const CommentSection = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  // Fetch comments for a given task
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await API.get(`/comments/${taskId}`);
        setComments(res.data);
      } catch (error) {
        console.error('Failed to fetch comments', error);
      }
    };
    fetchComments();
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/comments', { text, taskId });
      setComments([...comments, res.data]);
      setText('');
    } catch (error) {
      console.error('Error adding comment', error);
    }
  };

  return (
    <div>
      <h3>Comments</h3>
      <ul>
        {comments.map((comm) => (
          <li key={comm.id}>{comm.text} - <small>{comm.userId}</small></li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Add a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        /><br/>
        <button type="submit">Post Comment</button>
      </form>
    </div>
  );
};

export default CommentSection;
