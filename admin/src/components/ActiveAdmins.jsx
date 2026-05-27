import React, { useEffect, useState } from 'react';

const ActiveAdmins = () => {

  const [admins, setAdmins] = useState([]);

  useEffect(() => {

    fetchAdmins();

    const interval = setInterval(
      fetchAdmins,
      10000
    );

    return () => clearInterval(interval);

  }, []);

  const fetchAdmins = async () => {

    try {

      const token =
        localStorage.getItem('sb-access-token');

      const res = await fetch(
        '/api/admin/active-sessions',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const payload = await res.json();

      if (payload.success) {
        setAdmins(payload.data);
      }

    } catch (err) {
      console.error(err);
    }
  };

  return (

    <div
      style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '16px'
      }}
    >

      <h3>Currently Active Admins</h3>

      {admins.map(admin => (

        <div
          key={admin.id}
          style={{
            padding: '12px',
            borderBottom: '1px solid #eee'
          }}
        >

          <div>
            {admin.username}
          </div>

          <div
            style={{
              color: '#64748b',
              fontSize: '0.85rem'
            }}
          >
            {admin.city_name},
            {admin.country_code}
          </div>

        </div>

      ))}

    </div>

  );
};

export default ActiveAdmins;