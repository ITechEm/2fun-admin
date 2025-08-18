import { useState } from 'react';
import axios from 'axios';
import Layout from "@/components/Layout";

const NewsletterCreatePage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setSuccess('');
    setError('');

    try {
      const response = await axios.post('/api/newsletters', {
        title,
        content,
      });
      setSuccess('Newsletter created successfully!');
    } catch (err) {
      setError('There was an error creating the newsletter.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
    <div className="page-wrapper">
      <h1>Create a New Newsletter</h1>
      <form className="newsletter-form" onSubmit={handleSubmit}>
        <div className="input-field">
          <input
            type="text"
            placeholder="Newsletter Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="input-field">
          <textarea
            placeholder="Newsletter Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button" disabled={sending}>
          {sending ? 'Sending...' : 'Create Newsletter'}
        </button>
      </form>

      {success && <p className="success-message">{success}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
    </Layout>
  );
};

export default NewsletterCreatePage;
