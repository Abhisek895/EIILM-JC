import React, { useState } from 'react';
import MainLayout from '@layouts/MainLayout';
import { inquiryApi } from '@api/endpoints';

export default function AdmissionsPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('');
    setLoading(true);

    try {
      const response: any = await inquiryApi.create({
        fullName,
        email,
        phone,
        city,
        message,
      });

      if (response.success) {
        setStatus('Inquiry submitted successfully. Our team will contact you soon.');
        setFullName('');
        setEmail('');
        setPhone('');
        setCity('');
        setMessage('');
      } else {
        setStatus('Unable to submit inquiry. Please try again.');
      }
    } catch (error) {
      setStatus('Unable to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Admissions Inquiry</h1>
        <div className="card">
          <form onSubmit={submit} className="space-y-4">
            <input
              className="input-field"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <input
              className="input-field"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="input-field"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              className="input-field"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <textarea
              className="input-field min-h-28"
              placeholder="Your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="btn-primary" disabled={loading} type="submit">
              {loading ? 'Submitting...' : 'Submit Inquiry'}
            </button>
          </form>
          {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
        </div>
      </div>
    </MainLayout>
  );
}
